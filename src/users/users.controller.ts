import { NextFunction, Request, Response } from 'express';
import usersService from './users.service';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    const user = await usersService.getUserById(parseInt(id) || 0);
    if (!user) return res.sendStatus(404);

    res.json(user);
  } catch (err) {
    next(err);
  }
}
export async function udpateClientProfile(req: Request, res: Response, next: NextFunction) {
  const { userId, body, file } = req;
  
  try {
    const updatedUser = await usersService.updateUser(userId, { ...body, image: file });
    if (!updatedUser) return res.sendStatus(404);
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
}

export async function addClientFollow(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;
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
