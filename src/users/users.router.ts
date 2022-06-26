import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import upload from 'common/multer';
import { Router } from 'express';
import {
  addClientFollow,
  removeClientFollow,
  getUserByUsername,
  getUserById,
  udpateClientProfile,
  updateClientPhoto,
  getSuggestedUsers,
} from './users.controller';
import updateValidator from './validators/update.validator';

const router = Router();

router.patch('/me', verifyJwtMiddleware(), updateValidator, udpateClientProfile);
router.put('/me/photo', verifyJwtMiddleware(), upload.single('image'), updateClientPhoto);
router.get('/profiles/:username', verifyJwtMiddleware(), getUserByUsername);
router.get('/suggestions', verifyJwtMiddleware(), getSuggestedUsers)
router.get('/:id', verifyJwtMiddleware(), getUserById);
router.put('/:id/followers', verifyJwtMiddleware(), addClientFollow);
router.delete('/:id/followers', verifyJwtMiddleware(), removeClientFollow);
export default router;
