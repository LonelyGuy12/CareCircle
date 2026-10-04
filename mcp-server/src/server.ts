import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerAllTools } from './tools/index.js';

const server = new McpServer({ name: 'carecircle', version: '0.1.0' });

registerAllTools(server);

await server.connect(new StdioServerTransport());
console.error('CareCircle MCP server running on stdio');
