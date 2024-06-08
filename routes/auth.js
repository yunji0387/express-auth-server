import express from "express";
import { Register, Login, Logout, Verify, GetUser, RequestResetPassword, ResetPassword } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { VerifyToken } from "../middleware/verify.js";

const router = express.Router();

router.post(
    "/register",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("You first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("You last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    Validate,
    Register
);

router.post(
    "/login",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password").notEmpty().withMessage("Password is required"),
    Validate,
    Login
);

router.get("/logout", Logout);

router.get("/verify", VerifyToken, Verify);

router.get("/user", VerifyToken, GetUser);

router.post("/reset-password", ResetPassword);

router.post('/auth/request-reset-password', RequestResetPassword);

router.post('/auth/reset-password/:token', ResetPassword);

export default router;