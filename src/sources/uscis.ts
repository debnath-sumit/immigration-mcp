import fetch from "node-fetch";
import * as cheerio from "cheerio";

const FILING_CHART_URL =
  "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin";
const NEWS_URL = "https://www.uscis.gov/newsroom/all-news";

export function getUscisLinks() {
  return {
    adjustmentOfStatusChart: FILING_CHART_URL,
    h1bProcessingTime: "https://egov.uscis.gov/processing-times",
    uscisNews: NEWS_URL
  };
}

export async function getI485FilingChart() {
  const html = await fetch(FILING_CHART_URL).then(r => r.text());
  const $ = cheerio.load(html);
  const text = $("main, article, [role=main], .page-content").first().text() || $("body").text();
  const flat = text.replace(/\s+/g, " ").trim();

  const months = ["Current Month", "Next Month"];
  const result: Record<string, unknown> = { source: FILING_CHART_URL };
  for (const m of months) {
    const marker = new RegExp(`${m}[’']s Adjustment of Status Filing Charts`);
    const match = flat.match(marker);
    const start = match ? match.index! : -1;
    if (start === -1) continue;
    const slice = flat.slice(start, start + 1200);
    const family = slice.match(/family-sponsored[^.]*?(Dates for Filing|Final Action Dates)[^.]*?(?:Visa Bulletin for )?([A-Z][a-z]+ \d{4})/i);
    const employment = slice.match(/employment-based[^.]*?(Dates for Filing|Final Action Dates)[^.]*?(?:Visa Bulletin for )?([A-Z][a-z]+ \d{4})/i);
    result[m === "Current Month" ? "currentMonth" : "nextMonth"] = {
      familySponsored: family ? { chart: family[1], month: family[2] } : null,
      employmentBased: employment ? { chart: employment[1], month: employment[2] } : null
    };
  }

  return result;
}

export async function getUscisNews(limit = 10) {
  const html = await fetch(NEWS_URL).then(r => r.text());
  const $ = cheerio.load(html);
  const items: Array<{ date: string; title: string; url: string }> = [];

  $(".views-row").each((_, el) => {
    if (items.length >= limit) return;
    const $el = $(el);
    const titleEl = $el.find("h1, h2, h3, h4").first();
    const title = titleEl.text().trim() || $el.find("a").first().text().trim();
    const href = $el.find("a").first().attr("href") || "";
    const date = $el.find("time, .date, [class*=date]").first().text().trim();
    if (!title || !href) return;
    const url = href.startsWith("http") ? href : `https://www.uscis.gov${href}`;
    items.push({ date, title, url });
  });

  return { source: NEWS_URL, items };
}
