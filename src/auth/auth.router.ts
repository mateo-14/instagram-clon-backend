import { Router } from "express";
import { login, signup } from "./auth.controller";
import { auth } from "./auth.service";
import loginValidator from "./validators/login.validator";
import signupValidator from "./validators/signup.validator";

const router = Router();

router.post('/login', loginValidator, login);
router.post('/signup', signupValidator, signup);
router.get('/', auth);

export default router;