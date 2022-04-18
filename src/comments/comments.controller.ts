import CustomComment from 'common/models/CustomComment';
import { NextFunction, Response } from 'express';
import * as commentsService from './comments.service';
import type { Request } from '../..';
export async function addComment(req: Request, res: Response, next: NextFunction) {
  const { userId, body } = req;
  if (!userId) return res.sendStatus(401);

  const { text, commentRepliedId, postId } = body;

  try {
    const comment: null | CustomComment = await commentsService.createComment(
      parseInt(postId),
      text,
      userId,
      commentRepliedId
    );
    if (!comment) return res.sendStatus(404);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction) {
  const { query, userId } = req;
  if (userId) return res.sendStatus(401);

  const { post, last, replied } = query;

  try {
    if (!post || isNaN(parseInt(post.toString()))) return res.sendStatus(400);

    const comments: CustomComment[] = await commentsService.getComments(
      parseInt(post.toString()),
      parseInt(last?.toString() || '') || 0,
      parseInt(replied?.toString() || '') || undefined,
      req.userId
    );
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  const { userId, params } = req;
  if (!userId) return res.sendStatus(401);

  try {
    const found = await commentsService.deleteComment(parseInt(params.id) || 0, userId);
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
    const found = await commentsService.addLike(parseInt(params.id) || 0, userId);
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
    const found = await commentsService.removeLike(parseInt(params.id) || 0, userId);
    if (!found) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
