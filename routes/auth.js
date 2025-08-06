import express from "express";
import { passport } from '../config/index.js';
import { Register, Login, Logout, Verify, GetUser, RequestResetPassword, ResetPassword, VerifyResetPasswordToken, GoogleAuth } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { VerifyToken } from "../middleware/verify.js";
import rateLimit from "express-rate-limit";

// Rate limiter for registration: max 5 requests per IP per hour
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: "Too many accounts created from this IP, please try again after an hour"
});

// Rate limiter for login: max 10 requests per IP per hour
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: "Too many login attempts from this IP, please try again after an hour"
});

// Rate limiter for logout: max 10 requests per IP per hour
const logoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: "Too many logout attempts from this IP, please try again after an hour"
});

// Rate limiter for verify: max 20 requests per IP per hour
const verifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: "Too many verification attempts from this IP, please try again after an hour"
});

// Rate limiter for user info: max 20 requests per IP per hour
const userLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: "Too many requests for user info from this IP, please try again after an hour"
});

// Rate limiter for reset password: max 5 requests per IP per hour
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15,
    message: "Too many password reset attempts from this IP, please try again after an hour"
});

const router = express.Router();

router.post(
    "/register",
    registerLimiter,
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
    loginLimiter,
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password").notEmpty().withMessage("Password is required"),
    Validate,
    Login
);

router.get("/logout", logoutLimiter, Logout);

router.get("/verify", verifyLimiter, VerifyToken, Verify);

router.get("/user", userLimiter, VerifyToken, GetUser);

router.post("/request-reset-password", RequestResetPassword);

router.post("/reset-password/:token", resetPasswordLimiter, ResetPassword);

router.get("/verify-reset-password-token/:token", VerifyResetPasswordToken );

router.get("/google", GoogleAuth);

router.get("/google/callback",
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, issue a JWT token
        const token = req.user.token;
        res.cookie("SessionID", token, {
            maxAge: 20 * 60 * 1000, // 20 minutes
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        res.redirect('/');
    }
);

export default router;