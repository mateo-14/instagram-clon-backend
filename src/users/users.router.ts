import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';
import { Router } from 'express';
import {
  addClientFollow,
  removeClientFollow,
  getUserByUsername,
  getUserById,
  removeClientFollower,
  udpateClientProfile,
  getUserPosts,
} from './users.controller';
import updateValidator from './validators/update.validator';

const router = Router();

router.patch(
  '/me',
  verifyJwtMiddleware,
  upload.single('image'),
  updateValidator,
  udpateClientProfile
);
router.get('/profiles/:username', verifyJwtMiddleware, getUserByUsername);
router.get('/:id', verifyJwtMiddleware, getUserById);
router.put('/:id/followers', verifyJwtMiddleware, addClientFollow);
router.delete('/:id/followers', verifyJwtMiddleware, removeClientFollow);
router.delete('/me/followers/:id', verifyJwtMiddleware, removeClientFollower);
router.get('/:id/posts', getUserPosts);

export default router;
