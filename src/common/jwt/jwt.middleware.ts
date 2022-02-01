import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt.service';

export default async function verifyJwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ');
  if (!token || token.length < 2) return res.sendStatus(401);

  try {
    const payload = await verifyToken(token[1]);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.sendStatus(401);
  }
}
