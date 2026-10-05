import { TokenPayload } from '@shared/utils/auth';
import { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

export type ExpressHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void | unknown> | void | unknown;
export type AuthenticatedExpressHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => Promise<void | unknown> | void | unknown;
