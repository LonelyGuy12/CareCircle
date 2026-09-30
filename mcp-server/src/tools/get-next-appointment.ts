import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { asText, asError } from "../utils/result.js";
import { getNextAppointment } from "../api/appointments.js";

export function registerGetNextAppointment(server: McpServer) {
  server.registerTool(
    "get_next_appointment",
    {
      title: "Get next appointment",
      description: "Return the next upcoming appointment.",
      inputSchema: {},
    },
    async () => {
      try {
        const appt = await getNextAppointment();
        return asText(appt ?? "No upcoming appointments.");
      } catch (err) {
        return asError(err);
      }
    }
  );
}