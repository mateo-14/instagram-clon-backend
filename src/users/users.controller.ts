import DuplicateUsernameError from 'common/exceptions/DuplicateUsernameError';
import CustomUser from 'common/models/CustomUser';
import { NextFunction, Response } from 'express';
import * as usersService from './users.service';
import type { Request } from '../..';

export async function getUserByUsername(req: Request, res: Response, next: NextFunction) {
  const { userId } = req;
  const { username } = req.params;

  try {
    const user: CustomUser | null = await usersService.getUserByUsername(username, userId);
    if (!user) return res.sendStatus(404);

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    const user: CustomUser | null = await usersService.getUserById(parseInt(id));
    if (!user) return res.sendStatus(404);

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function udpateClientProfile(req: Request, res: Response, next: NextFunction) {
  const { userId, body } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const user = await usersService.getUserById(userId);
    if (user?.isTestAccount) return res.sendStatus(403);

    const updatedUser: CustomUser | null = await usersService.updateUser(userId, body);

    if (!updatedUser) return res.sendStatus(404);
    res.json(updatedUser);
  } catch (err) {
    if (err instanceof DuplicateUsernameError)
      return res.status(400).json({ errors: { username: err.message } });

    next(err);
  }
}

export async function addClientFollow(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;

  if (!userId) return res.sendStatus(401);
  if (userId === parseInt(id)) return res.sendStatus(204);

  try {
    const found = await usersService.addFollower(parseInt(id) || 0, userId);
    if (!found) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
export async function removeClientFollow(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;

  if (!userId) return res.sendStatus(401);
  if (userId === parseInt(id)) return res.sendStatus(204);

  try {
    const found = await usersService.removeFollower(parseInt(id) || 0, userId);
    if (!found) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function removeClientFollower(req: Request, res: Response, next: NextFunction) {
  // TODO: Add remove followers to req.userId user
  res.sendStatus(501);
}

export async function updateClientPhoto(req: Request, res: Response, next: NextFunction) {
  const { userId, file } = req;
  if (!userId) return res.sendStatus(401);
  if (!file) return res.sendStatus(400);

  try {
    const user = await usersService.getUserById(userId);
    if (user?.isTestAccount) return res.sendStatus(403);

    const data = await usersService.updatePhoto(userId, file);
    if (!data) return res.sendStatus(404);

    res.json(data);
  } catch (err) {
    next(err);
  }
}
