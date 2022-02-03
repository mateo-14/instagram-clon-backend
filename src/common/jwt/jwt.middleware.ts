import extractAuthToken from 'common/utils/extractAuthToken';
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt.service';

export default async function verifyJwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req.headers.authorization as string);
  if (!token) return res.sendStatus(401);

  try {
    const payload = await verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.sendStatus(401);
  }
}
