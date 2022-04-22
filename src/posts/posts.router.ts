import { Router } from 'express';

import {
  addLike,
  createPost,
  deletePost,
  getFeedPosts,
  getPost,
  removeLike,
} from './posts.controller';
import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';
import createValidator from './validators/create.validator';

const router = Router();

const POST_MAX_IMAGES: number = parseInt(process.env.POST_MAX_IMAGES!) || 1;

router.get('/feed', verifyJwtMiddleware(), getFeedPosts);
router.get('/:id', verifyJwtMiddleware(), getPost);
router.post(
  '/',
  verifyJwtMiddleware(),
  upload.array('images', POST_MAX_IMAGES),
  createValidator,
  createPost
);
router.delete('/:id', verifyJwtMiddleware(), deletePost);
router.put('/:id/likes', verifyJwtMiddleware(), addLike);
router.delete('/:id/likes', verifyJwtMiddleware(), removeLike);

export default router;
