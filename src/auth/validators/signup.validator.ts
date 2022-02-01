import validatorMiddleware from 'common/middlewares/validator.middleware';
import { body } from 'express-validator';

export default [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 25 })
    .withMessage('Password must be 3 to 25 characters long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4, max: 30 })
    .withMessage('Password must be 4 to 25 characters long'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),
  validatorMiddleware,
];
