import { NextFunction, Request, Response } from 'express';

export const bodyLimit = (limit = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const size = Number(req.headers['content-length'] || 0);
        if (size > limit) {
            return res.status(413).send('Payload too large');
        }
        next();
    };
};
