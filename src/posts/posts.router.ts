import { Router } from 'express';
import {
  addClientLike,
  createPost,
  deletePost,
  getFeedPosts,
  getPost,
  removeClientLike,
} from './posts.controller';
import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';

const router = Router();

const POST_MAX_IMAGES: number = parseInt(process.env.POST_MAX_IMAGES!) || 1;

router.get('/feed', verifyJwtMiddleware, getFeedPosts);
router.get('/:id', verifyJwtMiddleware, getPost);
router.post('/', verifyJwtMiddleware, upload.array('images', POST_MAX_IMAGES), createPost);
router.delete('/:id', verifyJwtMiddleware, deletePost);
router.put('/:id/likes/me', verifyJwtMiddleware, addClientLike);
router.delete('/:id/likes/me', verifyJwtMiddleware, removeClientLike);

export default router;
