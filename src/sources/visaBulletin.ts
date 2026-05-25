import fetch from "node-fetch";
import * as cheerio from "cheerio";

const INDEX_URL = "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

type Row = Record<string, string>;
type Chart = { columns: string[]; rows: Row[] };

function parseTable($: cheerio.CheerioAPI, el: cheerio.Element): Chart | null {
  const $t = $(el);
  const trs = $t.find("tr").toArray();
  if (trs.length < 2) return null;

  const header = $(trs[0]).find("th, td").map((_, c) => norm($(c).text())).get();
  if (header.length < 2) return null;
  const categoryCol = header[0];
  const countries = header.slice(1);

  const rows: Row[] = [];
  for (const tr of trs.slice(1)) {
    const cells = $(tr).find("th, td").map((_, c) => norm($(c).text())).get();
    if (cells.length < header.length) continue;
    const row: Row = { category: cells[0] };
    countries.forEach((country, i) => { row[country] = cells[i + 1]; });
    rows.push(row);
  }
  return { columns: [categoryCol, ...countries], rows };
}

const EB_MAP: Record<string, string> = { "1st": "EB-1", "2nd": "EB-2", "3rd": "EB-3" };

function pickIndiaEB(chart: Chart | null) {
  if (!chart) return null;
  const indiaCol = chart.columns.find(c => /india/i.test(c));
  if (!indiaCol) return null;
  const out: Record<string, string> = {};
  for (const row of chart.rows) {
    const ebKey = EB_MAP[row.category];
    if (ebKey) out[ebKey] = row[indiaCol];
  }
  return Object.keys(out).length ? out : null;
}

export async function getIndiaVisaBulletin() {
  const indexHtml = await fetch(INDEX_URL).then(r => r.text());
  const $idx = cheerio.load(indexHtml);
  const latestLink = $idx("a")
    .filter((_, el) => $idx(el).text().includes("Visa Bulletin For"))
    .first()
    .attr("href");
  if (!latestLink) throw new Error("Latest Visa Bulletin link not found");
  const fullUrl = latestLink.startsWith("http") ? latestLink : `https://travel.state.gov${latestLink}`;

  const bulletinHtml = await fetch(fullUrl).then(r => r.text());
  const $ = cheerio.load(bulletinHtml);
  $("script, style, noscript").remove();

  const titleMatch = norm($("body").text()).match(/Visa Bulletin For \w+ \d{4}/i);
  const bulletinTitle = titleMatch ? titleMatch[0] : "Visa Bulletin";

  const tables = $("table").toArray();
  const employmentTables: Chart[] = [];
  const familyTables: Chart[] = [];

  for (const t of tables) {
    const headerText = norm($(t).find("tr").first().text());
    const parsed = parseTable($, t);
    if (!parsed) continue;
    if (/Employment[-\s]*based/i.test(headerText) && /INDIA/i.test(headerText)) {
      employmentTables.push(parsed);
    } else if (/Family[-\s]*Sponsored/i.test(headerText) && /INDIA/i.test(headerText)) {
      familyTables.push(parsed);
    }
  }

  return {
    source: fullUrl,
    bulletinTitle,
    employmentBased: {
      finalActionDates: employmentTables[0] || null,
      datesForFiling: employmentTables[1] || null,
      indiaSummary: {
        finalAction: pickIndiaEB(employmentTables[0]),
        datesForFiling: pickIndiaEB(employmentTables[1])
      }
    },
    familySponsored: {
      finalActionDates: familyTables[0] || null,
      datesForFiling: familyTables[1] || null
    }
  };
}
