import { NextFunction, Request, Response } from 'express';
import * as authService from './auth.service';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import DuplicateUsernameError from '../common/exceptions/DuplicateUsernameError';
import extractAuthToken from 'common/utils/extractAuthToken';
import { AuthUser } from 'common/models/AuthUser';

export async function login(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  try {
    const user: AuthUser | null = await authService.login(username, password);
    if (!user) return res.status(400).json({ errors: { error: 'Invalid password or username' } });
    res.json(user);
  } catch (err) {
    if (err instanceof InvalidPasswordError)
      return res.status(400).json({ errors: { error: 'Invalid password or username' } });

    next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { username, password, displayName } = req.body;
  try {
    const user: AuthUser = await authService.createUser(username, password, displayName);
    res.json(user);
  } catch (err) {
    if (err instanceof DuplicateUsernameError)
      return res.status(400).json({ errors: { error: err.message } });

    next(err);
  }
}

export async function auth(req: Request, res: Response) {
  const token = extractAuthToken(req.headers.authorization as string);
  if (!token) return res.sendStatus(401);

  try {
    const user: AuthUser | null = await authService.auth(token);
    if (!user) return res.sendStatus(401);

    res.json(user);
  } catch (err) {
    return res.sendStatus(401);
  }
}

export async function loginWithTestAccount(_: Request, res: Response) {
  try {
    const user: AuthUser | null = await authService.loginWithATestAccount();
    if (!user) return res.sendStatus(401);

    res.json(user);
  } catch (err) {
    return res.sendStatus(500);
  }
}