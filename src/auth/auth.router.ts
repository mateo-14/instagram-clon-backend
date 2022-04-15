import { Router } from 'express';
import { login, signup, auth, loginWithTestAccount } from './auth.controller';
import loginValidator from './validators/login.validator';
import signupValidator from './validators/signup.validator';

const router = Router();

router.post('/login', loginValidator, login);
router.post('/signup', signupValidator, signup);
router.get('/testAccount', loginWithTestAccount);
router.get('/', auth);

export default router;
