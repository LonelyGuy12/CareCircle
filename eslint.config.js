import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    // ── Global ignores ──
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/build/**',
            '**/coverage/**',
            '**/*.d.ts',
            'scripts/**',
        ],
    },

    // ── TypeScript files ──
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],

        plugins: {
            'simple-import-sort': simpleImportSort,
        },

        rules: {
            'no-undef': 'off',

            // Import sorting
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            // TypeScript
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    // ── Turn off rules that conflict with Prettier ──
    prettier,
);
