import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getI485FilingChart } from "../src/sources/uscis.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const data = await getI485FilingChart();
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
