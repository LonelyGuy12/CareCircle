// Shape matches the Bedrock Converse API tool-use response closely enough
// to swap in the real client later without changing agent.ts.
export interface ToolCallRequest {
    toolName: string;
    input: Record<string, unknown>;
}

export interface BedrockReply {
    toolCalls: ToolCallRequest[];
    text: string | null; // present when the model wants to reply directly, no tool needed
}

// --- MOCK: replace this function body with a real Bedrock Converse call later ---
export async function callBedrock(userText: string): Promise<BedrockReply> {
    const text = userText.toLowerCase();

    if (text.includes('took') || text.includes('confirm')) {
        const medicationName = extractMedicationGuess(text);
        return {
            toolCalls: [{ toolName: 'confirm_dose', input: { medicationName } }],
            text: null,
        };
    }

    if (text.includes('due') || text.includes('need to take')) {
        return { toolCalls: [{ toolName: 'get_due_doses', input: {} }], text: null };
    }

    if (text.includes('appointment') && (text.includes('add') || text.includes('schedule'))) {
        return { toolCalls: [{ toolName: 'add_appointment', input: {} }], text: null };
    }

    if (text.includes('next appointment')) {
        return { toolCalls: [{ toolName: 'get_next_appointment', input: {} }], text: null };
    }

    return { toolCalls: [], text: "I'm not sure what you'd like to do." };
}

// Crude placeholder — the real model does this matching, not this function.
function extractMedicationGuess(text: string): string {
    const known = ['metformin', 'amlodipine', 'blood pressure pill', 'sugar pill'];
    return known.find((k) => text.includes(k)) ?? '';
}
