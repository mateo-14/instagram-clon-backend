import { NextFunction, Response } from 'express';
import * as postsService from './posts.service';
import type { Request } from '../..';

export async function createPost(req: Request, res: Response, next: NextFunction) {
  if (!(req.files instanceof Array)) return res.sendStatus(400);
  const { userId, files, body } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const post = await postsService.createPost(files, body.text, userId!);
    res.status(201).json(post);
  } catch (err) {
    next(err); // Pass error to handle errors middleware
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const found = await postsService.deletePost(parseInt(params.id), userId);
    if (!found) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function addLike(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const found = await postsService.addLike(parseInt(params.id), userId);
    if (!found) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function removeLike(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const found = await postsService.removeLike(parseInt(params.id), userId);
    if (!found) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function getFeedPosts(req: Request, res: Response, next: NextFunction) {
  const { userId, query } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const posts = await postsService.getFeedPosts(userId, parseInt(query.last?.toString() || ''));
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { userId } = req;

  try {
    const post = await postsService.getPost(parseInt(id), userId);
    if (!post) return res.sendStatus(404);

    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function getLikes(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { last } = req.query;

  try {
    const likes = await postsService.getLikes(parseInt(id), parseInt(last?.toString() || ''));
    res.json(likes);
  } catch (err) {
    next(err);
  }
}

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const posts = await postsService.getUserPosts(
      parseInt(req.query.author?.toString() || ''),
      parseInt(req.query.last?.toString() || ''),
      userId
    );

    if (!posts) return res.sendStatus(404);

    res.json(posts);
  } catch (err) {
    next(err);
  }
}
