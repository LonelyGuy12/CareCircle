import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getDueDoses } from '../api/doses.js';
import { asError, asText } from '../utils/result.js';

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
                return asText(await getDueDoses());
            } catch (err) {
                return asError(err);
            }
        },
    );
}
