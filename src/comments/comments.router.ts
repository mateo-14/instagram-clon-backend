import { Router } from 'express';

import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import { addComment, deleteComment, getPostComments, addLike, removeLike } from './comments.controller';

const router = Router();

router.post('/comments', verifyJwtMiddleware(), addComment);
router.get('/posts/:id/comments', verifyJwtMiddleware(), getPostComments);
router.delete('/comments/:id', verifyJwtMiddleware(), deleteComment);
router.put('/comments/:id/likes', verifyJwtMiddleware(), addLike);
router.delete('/comments/:id/likes', verifyJwtMiddleware(), removeLike);

export default router;
