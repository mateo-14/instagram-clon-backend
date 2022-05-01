import CustomComment from 'common/models/CustomComment';
import { NextFunction, Response } from 'express';
import * as commentsService from './comments.service';
import type { Request } from '../..';
export async function addPostComment(req: Request, res: Response, next: NextFunction) {
  const { userId, body, params } = req;
  if (!userId) return res.sendStatus(401);
  const { text, commentRepliedId } = body;

  try {
    const comment: null | CustomComment = await commentsService.createComment(
      parseInt(params.id),
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

export async function getPostComments(req: Request, res: Response, next: NextFunction) {
  const { query, userId, params } = req;
  if (!userId) return res.sendStatus(401);
  const { last, replied } = query;
  
  try {
    const comments: CustomComment[] = await commentsService.getComments(
      parseInt(params.id),
      parseInt(last?.toString() || '') || 0,
      parseInt(replied?.toString() || '') || undefined,
      userId
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
