import DuplicateUsernameError from 'common/exceptions/DuplicateUsernameError';
import CustomUser from 'common/models/CustomUser';
import { NextFunction, Request, Response } from 'express';
import * as usersService from './users.service';
import * as postsService from 'posts/posts.service';

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
  const { userId, body, file } = req;

  try {
    const updatedUser: CustomUser | null = await usersService.updateUser(userId, {
      ...body,
      image: file,
    });

    if (!updatedUser) return res.sendStatus(404);
    res.json(updatedUser);
  } catch (err) {
    if (err instanceof DuplicateUsernameError)
      return res.status(400).json({ error: { msg: err.message } });

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

export async function getUserPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postsService.getUserPosts(
      parseInt(req.params.id),
      parseInt(req.query.last?.toString() || '')
    );

    if (!posts) return res.sendStatus(404);

    res.json(posts);
  } catch (err) {
    next(err);
  }
}
