import { Router } from 'express';
import { addLike, createPost, deletePost, removeLike } from './posts.controller';
import multer from 'multer';
import jwtMiddleware from 'common/jwt/jwt.middleware';

const router = Router();
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Invalid image type'));
  },
});

const POST_MAX_IMAGES: number = parseInt(process.env.POST_MAX_IMAGES!) || 1;

router.post('/', jwtMiddleware, upload.array('images', POST_MAX_IMAGES), createPost);
router.delete('/:id', jwtMiddleware, deletePost);
router.put('/:id/likes', jwtMiddleware, addLike);
router.delete('/:id/likes', jwtMiddleware, removeLike);

export default router;
