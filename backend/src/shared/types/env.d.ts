/**
 * @module types/env
 * @description Augments the global ProcessEnv interface so that
 *              process.env variables have proper types and autocomplete.
 *              Database variables are auto-uncommented by the project generator.
 */

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /** Application port (default: 3000) */
            PORT: string;
            /** Runtime environment */
            NODE_ENV: 'development' | 'production' | 'test';

            // ── Database (auto-uncommented by generator) ──────────
            // MONGO_URI: string;
            DATABASE_URL: string;

            // ── Auth ──────────────────────────────────────────────
            // JWT_SECRET: string;
            // JWT_EXPIRES_IN: string;
        }
    }
}

export {};
