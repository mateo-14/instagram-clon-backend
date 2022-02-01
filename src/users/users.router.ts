import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';
import { Router } from 'express';
import {
  addClientFollow,
  removeClientFollow,
  getUser,
  removeClientFollower,
  udpateClientProfile,
} from './users.controller';
import updateValidator from './validators/update.validator';

const router = Router();

router.patch('/me', verifyJwtMiddleware, upload.single('image'), updateValidator, udpateClientProfile);
router.get('/:id', getUser);
router.put('/:id/followers/me', verifyJwtMiddleware, addClientFollow);
router.delete('/:id/followers/me', verifyJwtMiddleware, removeClientFollow);
router.delete('/me/followers/:id', verifyJwtMiddleware, removeClientFollower);

export default router;
