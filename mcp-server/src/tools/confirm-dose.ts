import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { asText, asError } from "../utils/result.js";
import { getDoses, confirmDose } from "../api/doses.js";
import { findMatchingDoses } from "../utils/match.js";

export function registerConfirmDose(server: McpServer) {
  server.registerTool(
    "confirm_dose",
    {
      title: "Confirm dose",
      description:
        "Mark a pending medication dose as taken. Give the medicine name, and the scheduled time if the person mentioned one.",
      inputSchema: {
        medicationName: z.string().describe("Medicine name or alias, e.g. 'Metformin'"),
        time: z.string().optional().describe("Scheduled time, e.g. '9 AM'"),
      },
    },
    async ({ medicationName, time }) => {
      try {
        const doses = await getDoses();
        const pending = doses.filter((d) => d.status === "pending");
        const matches = findMatchingDoses(pending, medicationName, time);

        if (matches.length === 0) {
          return asText(
            `No pending dose found for "${medicationName}"${time ? ` at ${time}` : ""}. It may already be taken.`
          );
        }

        if (matches.length > 1) {
          const options = matches
            .map((d) => `${d.medicationName} at ${d.scheduledAt.slice(11, 16)}`)
            .join(", ");
          return asText(`Several pending doses match: ${options}. Ask the person which one.`);
        }

        return asText(await confirmDose(matches[0]!.id, "alexa"));
      } catch (err) {
        return asError(err);
      }
    }
  );
}