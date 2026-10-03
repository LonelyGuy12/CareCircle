import { callBedrock } from './bedrock-client.js';
import { callTool } from './tool-runner.js';

export interface AgentReply {
    text: string;
    needsFollowUp: boolean;
}

export async function runAgent(userText: string): Promise<AgentReply> {
    const reply = await callBedrock(userText);

    if (reply.toolCalls.length === 0) {
        return { text: reply.text ?? "Sorry, I didn't understand that.", needsFollowUp: false };
    }

    const results = [];
    for (const call of reply.toolCalls) {
        results.push(await callTool(call.toolName, call.input));
    }

    return {
        text: results.map((r) => r.text).join('\n'),
        needsFollowUp: results.some((r) => r.needsFollowUp),
    };
}
