import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUscisLinks } from "../src/sources/uscis.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400");
  res.status(200).json(getUscisLinks());
}
