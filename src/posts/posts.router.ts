import { Router } from 'express';
import {
  addLike,
  createPost,
  deletePost,
  getFeedPosts,
  getPost,
  removeLike,
} from './posts.controller';
import multer from 'multer';
import verifyJwtMiddleware from 'common/jwt/jwt.middleware';

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

router.get('/feed', verifyJwtMiddleware, getFeedPosts);
router.get('/:id', verifyJwtMiddleware, getPost);
router.post('/', verifyJwtMiddleware, upload.array('images', POST_MAX_IMAGES), createPost);
router.delete('/:id', verifyJwtMiddleware, deletePost);
router.put('/:id/likes', verifyJwtMiddleware, addLike);
router.delete('/:id/likes', verifyJwtMiddleware, removeLike);

export default router;
