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
  updateClientPhoto,
} from './users.controller';
import updateValidator from './validators/update.validator';

const router = Router();

router.patch('/me', verifyJwtMiddleware(), updateValidator, udpateClientProfile);
router.put('/me/photo', verifyJwtMiddleware(), upload.single('image'), updateClientPhoto);
router.get('/profiles/:username', verifyJwtMiddleware(), getUserByUsername);
router.get('/:id', verifyJwtMiddleware(), getUserById);
router.put('/:id/followers', verifyJwtMiddleware(), addClientFollow);
router.delete('/:id/followers', verifyJwtMiddleware(), removeClientFollow);
// router.delete('/me/followers/:id', verifyJwtMiddleware(), removeClientFollower);

export default router;
