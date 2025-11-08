import { Router } from "express";
import { signup, login, getCurrentUser, logout } from "../controllers/auth";
import { handleValidation } from "../middlewares/validateRequest";
import { loginValidation, signupValidation } from "../validation/user";
import { signedUser } from "../middlewares/auth";

const router = Router();

router.post("/me", signedUser, getCurrentUser);

router.post("/signup", signupValidation, handleValidation, signup);

router.post("/login", loginValidation, handleValidation, login);

router.post("/logout", signedUser, logout);

export { router as AuthRouter };
