import validatorMiddleware from 'common/middlewares/validator.middleware';
import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

export default [
  body('text').trim().isLength({ min: 0, max: 2000 }).withMessage('Max text length is 2000 characters'),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || req.files?.length === 0) return res.sendStatus(400);
    next()
  },
  validatorMiddleware,
];
