import { ValidationError } from '@shared/json';
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

export type ValidationTarget = 'json' | 'body' | 'query' | 'param' | 'params' | 'form';

/**
 * Express middleware for validating request data against a Zod schema.
 */
export const validate = (target: ValidationTarget, schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let dataToValidate: any;
            if (target === 'json' || target === 'body' || target === 'form') {
                dataToValidate = req.body || {};
            } else if (target === 'query') {
                dataToValidate = req.query || {};
            } else if (target === 'param' || target === 'params') {
                dataToValidate = req.params || {};
            }

            const parsed = await schema.parseAsync(dataToValidate);

            if (target === 'json' || target === 'body' || target === 'form') {
                req.body = parsed;
            } else if (target === 'query') {
                req.query = parsed as any;
            } else if (target === 'param' || target === 'params') {
                req.params = parsed as any;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const fields: Record<string, string[]> = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.') || target;
                    if (!fields[path]) fields[path] = [];
                    fields[path].push(issue.message);
                });
                return next(new ValidationError('Validation failed', fields));
            }
            next(error);
        }
    };
};
