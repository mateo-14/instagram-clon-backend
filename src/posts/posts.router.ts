import { Router } from 'express';

import {
  addLike,
  createPost,
  deletePost,
  getFeedPosts,
  getLikes,
  getPost,
  getUserPosts,
  removeLike,
} from './posts.controller';
import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';
import createValidator from './validators/create.validator';

const router = Router();

const POST_MAX_IMAGES: number = parseInt(process.env.POST_MAX_IMAGES!) || 1;

router.get('/users/:id/posts', verifyJwtMiddleware(), getUserPosts);
router.get('/posts/feed', verifyJwtMiddleware(), getFeedPosts);
router.get('/posts/:id', verifyJwtMiddleware(), getPost);
router.post(
  '/',
  verifyJwtMiddleware(),
  upload.array('images', POST_MAX_IMAGES),
  createValidator,
  createPost
);
router.delete('/posts/:id', verifyJwtMiddleware(), deletePost);
router.put('/posts/:id/likes', verifyJwtMiddleware(), addLike);
router.delete('/posts/:id/likes', verifyJwtMiddleware(), removeLike);
router.get('/posts/:id/likes', verifyJwtMiddleware(), getLikes);

export default router;
