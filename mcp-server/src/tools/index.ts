import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerConfirmDose } from "./confirm-dose.js";
import { registerGetTodaysMeds } from "./get-todays-meds.js";
import { registerGetDueDoses } from "./get-due-doses.js";
import { registerAddAppointment } from "./add-appointment.js";
import { registerGetNextAppointment } from "./get-next-appointment.js";
import { registerGetDailySummary } from "./get-daily-summary.js";

export function registerAllTools(server: McpServer) {
  registerConfirmDose(server);
  registerGetTodaysMeds(server);
  registerGetDueDoses(server);
  registerAddAppointment(server);
  registerGetNextAppointment(server);
  registerGetDailySummary(server);
}