import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getIndiaVisaBulletin } from "./sources/visaBulletin.js";
import { getUscisLinks, getI485FilingChart, getUscisNews } from "./sources/uscis.js";

const server = new McpServer({
  name: "immigration-mcp",
  version: "1.0.0"
});

server.tool(
  "get_india_priority_dates",
  "Get the latest EB-1, EB-2, EB-3 India priority dates and green card (GC) movement from the U.S. Department of State Visa Bulletin. Use for questions about GC update, visa bulletin, priority date, EB1/EB2/EB3 India.",
  {},
  async () => {
    const data = await getIndiaVisaBulletin();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_i485_filing_chart",
  "Get the current and next month USCIS I-485 Adjustment of Status filing chart designation (Dates for Filing vs Final Action Dates) for family-sponsored and employment-based categories. Use for questions about 485 update, I-485, AOS filing chart, adjustment of status, which chart to use.",
  {},
  async () => {
    const data = await getI485FilingChart();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_uscis_news",
  "Get the latest USCIS newsroom headlines (policy memos, alerts, announcements). Use for questions about USCIS news, latest immigration news, policy updates.",
  { limit: z.number().int().min(1).max(25).optional() },
  async ({ limit }) => {
    const data = await getUscisNews(limit ?? 10);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_uscis_links",
  "Get reference URLs for USCIS Adjustment of Status filing chart, H-1B processing time, and USCIS newsroom.",
  {},
  async () => {
    const data = getUscisLinks();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
