import { NextFunction, Request, Response } from 'express';
import * as authService from './auth.service';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import AuthUser from 'common/models/AuthUser';
import * as jwtService from 'common/jwt/jwt.service';
import DuplicateEmailError from './exceptions/DuplicateEmailError';
import DuplicateUsernameError from './exceptions/DuplicateUsernameError';

export async function login(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  try {
    const user: AuthUser | null = await authService.login(username, password);
    if (!user) return res.status(400).json({ error: { msg: 'Invalid password or username' } });

    const token: string = await jwtService.generateToken(user.id);
    res.json({ ...user, token });
  } catch (err) {
    if (err instanceof InvalidPasswordError)
      return res.status(400).json({ error: { msg: 'Invalid password or username' } });

    next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, email, password, displayName } = req.body;
  try {
    const user: AuthUser = await authService.createUser(username, email, password, displayName);
    const token: string = await jwtService.generateToken(user.id);
    res.json({ ...user, token });
  } catch (err) {
    if (err instanceof DuplicateEmailError || err instanceof DuplicateUsernameError)
      return res.status(400).json({ error: { msg: err.message } });

    next(err);
  }
}
