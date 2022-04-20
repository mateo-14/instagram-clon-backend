import validatorMiddleware from 'common/middlewares/validator.middleware';
import { body } from 'express-validator';

export default [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 25 })
    .withMessage('Username must be 3 to 25 characters long')
    .matches(/^(?!\.)(?!.*\.$)(?!.*?\.\.)[a-zA-Z0-9_.]+$/)
    .withMessage('Username must contains only letters, numbers, dots and underscores'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Name must be less than 30 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4, max: 30 })
    .withMessage('Password must be 4 to 25 characters long'),

  validatorMiddleware,
];
