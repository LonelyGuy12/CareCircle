import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { confirmDose, getDoses } from '../api/doses.js';
import { getMedications } from '../api/medications.js';
import { findMatchingDoses, findMatchingMedications } from '../utils/match.js';
import { asError, asFollowUp,asText } from '../utils/result.js';

export function registerConfirmDose(server: McpServer) {
    server.registerTool(
        'confirm_dose',
        {
            title: 'Confirm dose',
            description:
                "Mark a medication dose as taken, including a missed dose taken late. Give the medicine name or alias (e.g. 'blood pressure pill'), and the scheduled time if the person mentioned one.",
            inputSchema: {
                medicationName: z
                    .string()
                    .describe("Medicine name or alias, e.g. 'blood pressure pill'"),
                time: z.string().optional().describe("Scheduled time, e.g. '9 AM'"),
            },
        },
        async ({ medicationName, time }) => {
            try {
                const medications = await getMedications();
                const matchedMeds = findMatchingMedications(medications, medicationName);

                if (matchedMeds.length === 0) {
                    return asText(`I don't recognize "${medicationName}" as a medication.`);
                }

                const doses = await getDoses();
                const confirmable = doses.filter(
                    (d) => d.status === 'pending' || d.status === 'missed',
                );
                const medicationIds = matchedMeds.map((m) => m.id);
                const matches = findMatchingDoses(confirmable, medicationIds, time);

                if (matches.length === 0) {
                    return asText(
                        `No pending or missed dose found for "${medicationName}"${time ? ` at ${time}` : ''}. It may already be taken.`,
                    );
                }

                if (matches.length > 1) {
                    const options = matches
                        .map((d) => `${d.medicationName} at ${d.scheduledAt.slice(11, 16)}`)
                        .join(', ');
                    return asFollowUp(`Several doses match: ${options}. Which one did you mean?`);
                }

                return asText(await confirmDose(matches[0]!.id, 'alexa'));
            } catch (err) {
                return asError(err);
            }
        },
    );
}
