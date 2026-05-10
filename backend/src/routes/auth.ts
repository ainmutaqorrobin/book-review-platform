import { Router } from "express";
import {
  signup,
  login,
  getCurrentUser,
  logout,
  changePassword,
} from "../controllers/auth";
import { handleValidation } from "../middlewares/validateRequest";
import {
  changePasswordValidation,
  loginValidation,
  signupValidation,
} from "../validation/user";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/me", requireAuth, getCurrentUser);

router.post("/signup", signupValidation, handleValidation, signup);

router.post("/login", loginValidation, handleValidation, login);

router.post("/logout", requireAuth, logout);

router.patch(
  "/password",
  requireAuth,
  changePasswordValidation,
  handleValidation,
  changePassword,
);

export { router as AuthRouter };
