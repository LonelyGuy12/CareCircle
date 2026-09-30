import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { asText, asError } from "../utils/result.js";
import { getDoses } from "../api/doses.js";

export function registerGetTodaysMeds(server: McpServer) {
  server.registerTool(
    "get_todays_meds",
    {
      title: "Get today's medications",
      description: "List all medication doses scheduled for today with their status (pending, taken or missed).",
      inputSchema: {},
    },
    async () => {
      try {
        return asText(await getDoses());
      } catch (err) {
        return asError(err);
      }
    }
  );
}