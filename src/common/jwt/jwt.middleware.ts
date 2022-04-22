import extractAuthToken from 'common/utils/extractAuthToken';
import type { NextFunction, Response } from 'express';
import { verifyToken } from './jwt.service';
import type { Request } from '../../..';

export default function verifyJwtMiddleware(allowWithoutAuth = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractAuthToken(req.headers.authorization as string);
    if (!token && !allowWithoutAuth) return res.sendStatus(401);
    try {
      if (token) {
        const payload = await verifyToken(token);
        req.userId = payload.userId;
      }

      next();
    } catch (err) {
      if (!allowWithoutAuth) res.sendStatus(401);
      else next();
    }
  };
}
