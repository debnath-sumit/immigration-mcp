import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUscisNews } from "../src/sources/uscis.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = Math.min(25, Math.max(1, Number(req.query.limit) || 10));
    const data = await getUscisNews(limit);
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
