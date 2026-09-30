import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { asText } from "../utils/result.js";

export function registerGetDailySummary(server: McpServer) {
  server.registerTool(
    "get_daily_summary",
    {
      title: "Get daily summary",
      description: "Get the caregiver summary for a given day.",
      inputSchema: {
        date: z.string().optional().describe("Date in YYYY-MM-DD format; defaults to today"),
      },
    },
    async ({ date }) =>
      asText(
        `Stub summary for ${date ?? "today"}: 1 of 3 doses taken so far, 1 dose still due.`
      )
  );
}