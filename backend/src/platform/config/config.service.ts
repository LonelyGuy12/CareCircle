import { parseDurationToSeconds } from '@shared/utils/time';
import { configDotenv } from 'dotenv';
import z from 'zod';

configDotenv();

const configSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'trace', 'fatal']).default('debug'),
    PORT: z.string().default('5500').transform(Number),
    DATABASE_TYPE: z.enum(['dynamodb', 'postgres']).optional().default('dynamodb'),
    DATABASE_URL: z.string().optional().default('postgresql://localhost:5432/carecircle'),
    CORS_ORIGIN: z.string().default('*'),
    PNPM_PACKAGE_VERSION: z.string().default('1.0.0'),
    REDIS_HOST: z.string().optional().default('localhost'),
    REDIS_PORT: z.string().optional().default('6379').transform(Number),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    APP_URL: z.string().optional().default('http://localhost:9000'),

    // AWS & DynamoDB Configuration
    AWS_REGION: z.string().optional().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    DYNAMODB_ENDPOINT: z.string().optional(),
    DYNAMODB_TABLE_PREFIX: z.string().optional().default('carecircle_'),

    // Authentication Configuration
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRY: z.string().default('30m'),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

    // Cookie Configuration
    SECURE_COOKIES: z
        .string()
        .default('false')
        .transform((x: string) => x.toLowerCase() === 'true'),
    HTTPONLY_COOKIES: z
        .string()
        .default('true')
        .transform((x: string) => x.toLowerCase() === 'true'),

    // SMTP Configuration
    SMTPUSER: z.string(),
    SMTPPASS: z.string(),

    // AI Configuration
    GEMINI_API_KEY: z.string().optional(),

    // R2 Storage Configuration
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),

    // Supabase Storage Configuration
    SUPABASE_PROJECT_REF: z.string().optional(),
    SUPABASE_ACCESS_KEY_ID: z.string().optional(),
    SUPABASE_SECRET_ACCESS_KEY: z.string().optional(),
    SUPABASE_REGION: z.string().optional().default('us-east-1'),
    SUPABASE_BUCKET: z.string().optional(),
});

type ConfigSchema = z.infer<typeof configSchema>;

export class ConfigService {
    private static instance: ConfigService | null = null;
    private readonly config: ConfigSchema;

    private constructor() {
        try {
            this.config = configSchema.parse(process.env);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Invalid environment configuration:');
                error.issues.forEach((err) => {
                    console.error(`  - ${err.path.join('.')}: ${err.message}`);
                });
                process.exit(1);
            }
            throw error;
        }
    }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    static resetInstance(): void {
        ConfigService.instance = null;
    }

    get nodeEnv(): 'development' | 'production' | 'test' {
        return this.config.NODE_ENV;
    }

    get isProduction(): boolean {
        return this.config.NODE_ENV === 'production';
    }

    get isDevelopment(): boolean {
        return this.config.NODE_ENV === 'development';
    }

    get isTest(): boolean {
        return this.config.NODE_ENV === 'test';
    }

    get port(): number {
        return this.config.PORT;
    }

    get corsOrigin(): string {
        return this.config.CORS_ORIGIN;
    }

    get databaseUrl(): string {
        return this.config.DATABASE_URL;
    }

    get logLevel(): string {
        return this.config.LOG_LEVEL;
    }

    get appUrl(): string {
        return this.config.APP_URL;
    }

    get npm_package_version(): string {
        return this.config.PNPM_PACKAGE_VERSION;
    }

    get redis_host(): string {
        return this.config.REDIS_HOST;
    }

    get redis_port(): number {
        return this.config.REDIS_PORT;
    }

    get redis_password(): string | undefined {
        return this.config.REDIS_PASSWORD;
    }

    get redis_url(): string | undefined {
        return this.config.REDIS_URL;
    }

    get upstash_redis_rest_url(): string | undefined {
        return this.config.UPSTASH_REDIS_REST_URL;
    }

    get upstash_redis_rest_token(): string | undefined {
        return this.config.UPSTASH_REDIS_REST_TOKEN;
    }

    get access_token_secret(): string {
        return this.config.ACCESS_TOKEN_SECRET;
    }

    // Returns string format for JWT (e.g., "30m")
    get access_token_expiry(): string {
        return this.config.ACCESS_TOKEN_EXPIRY;
    }

    // Returns seconds for Cookies (e.g., 1800)
    get access_token_expiry_seconds(): number {
        return parseDurationToSeconds(this.config.ACCESS_TOKEN_EXPIRY);
    }

    get refresh_token_secret(): string {
        return this.config.REFRESH_TOKEN_SECRET;
    }

    // Returns string format for JWT (e.g., "7d")
    get refresh_token_expiry(): string {
        return this.config.REFRESH_TOKEN_EXPIRY;
    }

    // Returns seconds for Cookies (e.g., 604800)
    get refresh_token_expiry_seconds(): number {
        return parseDurationToSeconds(this.config.REFRESH_TOKEN_EXPIRY);
    }

    get secure_cookies(): boolean {
        return this.config.SECURE_COOKIES;
    }

    get httpOnly_cookies(): boolean {
        return this.config.HTTPONLY_COOKIES;
    }

    get smtpUser(): string {
        return this.config.SMTPUSER;
    }

    get smtpPass(): string {
        return this.config.SMTPPASS;
    }

    get geminiApiKey(): string | undefined {
        return this.config.GEMINI_API_KEY;
    }

    get r2_account_id(): string | undefined {
        return this.config.R2_ACCOUNT_ID;
    }

    get r2_access_key_id(): string | undefined {
        return this.config.R2_ACCESS_KEY_ID;
    }

    get r2_secret_access_key(): string | undefined {
        return this.config.R2_SECRET_ACCESS_KEY;
    }

    get r2_bucket_name(): string | undefined {
        return this.config.R2_BUCKET_NAME;
    }

    get r2_public_url(): string | undefined {
        return this.config.R2_PUBLIC_URL;
    }

    get isR2Configured(): boolean {
        return !!(
            this.config.R2_ACCOUNT_ID &&
            this.config.R2_ACCESS_KEY_ID &&
            this.config.R2_SECRET_ACCESS_KEY &&
            this.config.R2_BUCKET_NAME
        );
    }

    get supabase_project_ref(): string | undefined {
        return this.config.SUPABASE_PROJECT_REF;
    }

    get supabase_access_key_id(): string | undefined {
        return this.config.SUPABASE_ACCESS_KEY_ID;
    }

    get supabase_secret_access_key(): string | undefined {
        return this.config.SUPABASE_SECRET_ACCESS_KEY;
    }

    get supabase_region(): string {
        return this.config.SUPABASE_REGION || 'us-east-1';
    }

    get supabase_bucket(): string | undefined {
        return this.config.SUPABASE_BUCKET;
    }

    get isSupabaseStorageConfigured(): boolean {
        return !!(
            this.config.SUPABASE_PROJECT_REF &&
            this.config.SUPABASE_ACCESS_KEY_ID &&
            this.config.SUPABASE_SECRET_ACCESS_KEY &&
            this.config.SUPABASE_BUCKET
        );
    }

    get aws_region(): string {
        return this.config.AWS_REGION || 'us-east-1';
    }

    get aws_access_key_id(): string | undefined {
        return this.config.AWS_ACCESS_KEY_ID;
    }

    get aws_secret_access_key(): string | undefined {
        return this.config.AWS_SECRET_ACCESS_KEY;
    }

    get dynamodb_endpoint(): string | undefined {
        return this.config.DYNAMODB_ENDPOINT;
    }

    get dynamodb_table_prefix(): string {
        return this.config.DYNAMODB_TABLE_PREFIX || 'carecircle_';
    }

    get database_type(): 'dynamodb' | 'postgres' {
        return (this.config.DATABASE_TYPE as any) || 'dynamodb';
    }
}

export const config = ConfigService.getInstance();
