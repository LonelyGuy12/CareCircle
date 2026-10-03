import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import type { CacheService } from '@platform/cache';
import type { ConfigService } from '@platform/config';
import type { DatabaseService } from '@platform/database';
import type { Request, Response } from 'express';

import { HealthController } from './health.controller';

/**
 * Liveness is pure: it never touches the database, cache, or config, so this
 * test needs no DynamoDB Local, no Redis, and no AWS credentials.
 */
function makeController(): HealthController {
    return new HealthController(
        {} as unknown as DatabaseService,
        {} as unknown as CacheService,
        {} as unknown as ConfigService,
    );
}

interface FakeRes {
    status(code: number): FakeRes;
    json(payload: unknown): FakeRes;
}

function makeRes(calls: { statusCode: number; body: unknown }): FakeRes {
    return {
        status(code: number): FakeRes {
            calls.statusCode = code;
            return this;
        },
        json(payload: unknown): FakeRes {
            calls.body = payload;
            return this;
        },
    };
}

test('GET /health/live returns 200 with the standard success envelope', () => {
    const controller = makeController();
    const calls: { statusCode: number; body: unknown } = { statusCode: 0, body: null };

    controller.liveness({} as unknown as Request, makeRes(calls) as unknown as Response);

    assert.equal(calls.statusCode, 200);
    assert.ok(calls.body !== null && typeof calls.body === 'object');
    const body = calls.body as { success: unknown; message: unknown; data: unknown };
    assert.equal(body.success, true);
    assert.equal(body.message, 'Liveness check passed');
    assert.ok(body.data !== null && typeof body.data === 'object');
    assert.equal((body.data as { status: unknown }).status, 'alive');
});
