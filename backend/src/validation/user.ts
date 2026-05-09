import { body } from "express-validator";

export const signupValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
];

export const loginValidation = [
  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("password").isString().notEmpty().withMessage("Password is required"),
];
