import validatorMiddleware from 'common/middlewares/validator.middleware';
import { body } from 'express-validator';

export default [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validatorMiddleware,
];
