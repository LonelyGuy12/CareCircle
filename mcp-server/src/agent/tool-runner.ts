import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAllTools } from '../tools/index.js';

let clientPromise: Promise<Client> | null = null;
export interface ToolCallResult {
    text: string;
    isError: boolean;
    needsFollowUp: boolean;
}

// Builds one server + one connected client, reused across calls.
async function getClient(): Promise<Client> {
    if (!clientPromise) {
        clientPromise = (async () => {
            const server = new McpServer({ name: 'carecircle', version: '0.1.0' });
            registerAllTools(server);

            const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
            await server.connect(serverTransport);

            const client = new Client({ name: 'carecircle-agent', version: '0.1.0' });
            await client.connect(clientTransport);

            return client;
        })();
    }
    return clientPromise;
}

export async function callTool(
    toolName: string,
    input: Record<string, unknown>,
): Promise<ToolCallResult> {
    const client = await getClient();
    const result = await client.callTool({ name: toolName, arguments: input });

    const content = result.content as Array<{ type: string; text?: string }>;
    const text = content.find((c) => c.type === 'text')?.text ?? '';
    const meta = result._meta as { needsFollowUp?: boolean } | undefined;

    return {
        text,
        isError: Boolean(result.isError),
        needsFollowUp: Boolean(meta?.needsFollowUp),
    };
}
