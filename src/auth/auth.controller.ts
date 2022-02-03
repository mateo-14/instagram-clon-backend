import { NextFunction, Request, Response } from 'express';
import * as authService from './auth.service';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import CustomUser from 'common/models/CustomUser';
import DuplicateUsernameError from '../common/exceptions/DuplicateUsernameError';

export async function login(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  try {
    const user: CustomUser | null = await authService.login(username, password);
    if (!user) return res.status(400).json({ error: { msg: 'Invalid password or username' } });
    res.json(user);
  } catch (err) {
    if (err instanceof InvalidPasswordError)
      return res.status(400).json({ error: { msg: 'Invalid password or username' } });

    next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, password, displayName } = req.body;
  try {
    const user: CustomUser = await authService.createUser(username, password, displayName);
    res.json(user);
  } catch (err) {
    if (err instanceof DuplicateUsernameError)
      return res.status(400).json({ error: { msg: err.message } });

    next(err);
  }
}
