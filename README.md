# Immigration MCP Server

AI-powered MCP (Model Context Protocol) server for U.S. immigration updates.

## Features

- Latest Visa Bulletin
- EB1 India Priority Date
- EB2 India Priority Date
- EB3 India Priority Date
- USCIS Filing Chart
- H1B Processing Time
- Green Card Updates
- Simple Web UI

---

## Tech Stack

- TypeScript
- MCP SDK
- Express
- Node.js
- HTML/CSS/JavaScript

---

## Project Structure

```text
immigration-mcp/
├── public/
├── src/
│   ├── server.ts
│   ├── web.ts
│   └── sources/
├── package.json
├── tsconfig.json
└── README.md

**Install**
npm install
**Run MCP Server**
npm run dev
**Run Web UI**
npm run web

**Claude Desktop MCP Config**
{
  "mcpServers": {
    "immigration-mcp": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/sumit.debnath/immigration-mcp"
    }
  }
}
