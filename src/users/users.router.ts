import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import { Router } from 'express';
import {
  addClientFollow,
  removeClientFollow,
  getUser,
  removeFollower,
  udpateClientProfile,
} from './users.controller';

const router = Router();

router.patch('/me/profile', verifyJwtMiddleware, udpateClientProfile);
router.get('/:id', getUser);
router.put('/:id/followers/me', verifyJwtMiddleware, addClientFollow);
router.delete('/:id/followers/me', verifyJwtMiddleware, removeClientFollow);
router.delete('/:id/followers/:id', verifyJwtMiddleware, removeFollower);

export default router;
