import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export default function validatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatedErrors: any = {};
    for (const error of errors.array({ onlyFirstError: true })) {
      formatedErrors[error.param] = error.msg;
    }
    return res.status(400).json({ errors: formatedErrors });
  }

  next();
}
