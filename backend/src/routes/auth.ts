import { Router } from "express";
import { signup, login, getCurrentUser, logout } from "../controllers/auth";
import { handleValidation } from "../middlewares/validateRequest";
import { loginValidation, signupValidation } from "../validation/user";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/me", requireAuth, getCurrentUser);

router.post("/signup", signupValidation, handleValidation, signup);

router.post("/login", loginValidation, handleValidation, login);

router.post("/logout", requireAuth, logout);

export { router as AuthRouter };
