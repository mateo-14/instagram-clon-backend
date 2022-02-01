import validatorMiddleware from 'common/middlewares/validator.middleware';
import { body } from 'express-validator';

export default [
  body('bio').trim().isLength({ min: 0, max: 150 }).withMessage('Max bio length is 150 characters'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 25 })
    .withMessage('Username must be 3 to 25 characters long'),
  body('email').optional().isEmail().withMessage('Email is invalid'),
  validatorMiddleware,
];
