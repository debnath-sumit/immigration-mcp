import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getIndiaVisaBulletin } from "./sources/visaBulletin.js";
import { getI485FilingChart, getUscisNews, getUscisLinks } from "./sources/uscis.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

const wrap = (fn: (req: Request) => Promise<unknown> | unknown) =>
  async (req: Request, res: Response) => {
    try {
      res.json(await fn(req));
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

app.get("/api/india-priority-dates", wrap(() => getIndiaVisaBulletin()));
app.get("/api/i485-chart", wrap(() => getI485FilingChart()));
app.get("/api/news", wrap((req) => {
  const limit = Math.min(25, Math.max(1, Number(req.query.limit) || 10));
  return getUscisNews(limit);
}));
app.get("/api/links", wrap(() => getUscisLinks()));

app.listen(port, () => {
  console.log(`UI running at http://localhost:${port}`);
});
