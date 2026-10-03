import { runAgent } from '../agent/agent.js';

const sentences = [
    'I took my metformin',
    'what doses are due',
    "what's my next appointment",
    'hello there',
];

for (const s of sentences) {
    const reply = await runAgent(s);
    console.log(`> ${s}`);
    console.log(reply.text, reply.needsFollowUp ? '[needs follow-up]' : '');
    console.log();
}
