import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getDueDoses } from '../api/doses.js';
import { asError,asText } from '../utils/result.js';

export function registerGetDueDoses(server: McpServer) {
    server.registerTool(
        'get_due_doses',
        {
            title: 'Get due doses',
            description: 'List doses that are due now and have not been taken yet.',
            inputSchema: {},
        },
        async () => {
            try {
                const due = await getDueDoses();
                return due.length === 0 ? asText('No doses are due right now.') : asText(due);
            } catch (err) {
                return asError(err);
            }
        },
    );
}
