import fs from 'node:fs';
import path from 'node:path';

// 1. Enforce pnpm only
const userAgent = process.env.npm_config_user_agent || '';
if (!userAgent.includes('pnpm')) {
    console.error('\x1b[31m%s\x1b[0m', '[ERROR] This repository strictly requires pnpm!');
    console.error('Please do not use npm, yarn, or bun.');
    console.error('Run: pnpm install');
    process.exit(1);
}

// 2. Enforce Node.js version from .nvmrc or minimum version (>=20)
try {
    const nvmrcPath = path.resolve(process.cwd(), '.nvmrc');
    let requiredMajor = 20;

    if (fs.existsSync(nvmrcPath)) {
        const raw = fs.readFileSync(nvmrcPath, 'utf-8').trim().replace(/^v/, '');
        const parsedMajor = parseInt(raw.split('.')[0], 10);
        if (!isNaN(parsedMajor)) {
            requiredMajor = parsedMajor;
        }
    }

    const currentMajor = parseInt(process.version.replace(/^v/, '').split('.')[0], 10);

    if (currentMajor < 20) {
        console.error(
            '\x1b[31m%s\x1b[0m',
            `[ERROR] Node.js version v${currentMajor} is not supported.`,
        );
        console.error(`Please use Node.js v${requiredMajor}+ (specified in .nvmrc)`);
        process.exit(1);
    }
} catch (e) {
    // Ignore error if check fails
}
