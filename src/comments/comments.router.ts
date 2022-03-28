import { Router } from 'express';

import verifyJwtMiddleware from 'common/jwt/jwt.middleware';
import { addComment, deleteComment, getComments, addLike, removeLike } from './comments.controller';

const router = Router();

router.post('/', verifyJwtMiddleware, addComment);
router.get('/', verifyJwtMiddleware, getComments);
router.delete('/:id', verifyJwtMiddleware, deleteComment);
router.put('/:id/likes', verifyJwtMiddleware, addLike);
router.delete('/:id/likes', verifyJwtMiddleware, removeLike);

export default router;
