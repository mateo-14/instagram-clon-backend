import { NextFunction, Request, Response } from 'express';
import postsService from './posts.service';

export async function createPost(req: Request, res: Response, next: NextFunction) {
  if (!(req.files instanceof Array)) return res.sendStatus(400);

  const { text } = req.body;
  try {
    const post = await postsService.createPost(req.files, text, req.userId);
    res.json(post);
  } catch (err) {
    next(err); // Pass error to handle errors middleware
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;

  try {
    const found = await postsService.deletePost(parseInt(id), userId)
    if (!found) return res.sendStatus(404)
    
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export async function addLike(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;

  try {
    const found = await postsService.addLike(parseInt(id), userId);
    if (!found) return res.sendStatus(404);
    
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function removeLike(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  const { id } = params;

  try {
    const found = await postsService.removeLike(parseInt(id), userId);
    if (!found) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
