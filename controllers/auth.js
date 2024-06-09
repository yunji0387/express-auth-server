import User from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";
import { VerifyToken } from "../middleware/verify.js";
import emailjs from "@emailjs/browser";

// emailjs.init(process.env.EMAILJS_USER_ID);

emailjs.init({
    publicKey: process.env.EMAILJS_USER_ID,
    // Do not allow headless browsers
    blockHeadless: true,
    blockList: {
      // Block the suspended emails
      list: [],
      // The variable contains the email address
      watchVariable: 'userEmail',
    },
    limitRate: {
      // Set the limit rate for the application
      id: 'app',
      // Allow 1 request per 10s
      throttle: 10000,
    },
  });

/**
 * @route POST /auth/register
 * @desc Registers a user
 * @access Public
 */
export async function Register(req, res) {
    const { first_name, last_name, email, password } = req.body;
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: {
                    status: "failed",
                    data: [],
                    message: "It seems you already have an account, please log in instead.",
                }
            });
        }
        const savedUser = await newUser.save();
        res.status(200).json({
            status: "success",
            data: [{ first_name, last_name, email }],
            message: "Thank you for registering with us. Your account has been successfully created.",
        });

    } catch (error) {
        return res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error",
                details: error.message,
            }
        });
    }
    res.end();
}

/**
 * @route POST /auth/login
 * @desc Logs in a user
 * @access Public
 */
export async function Login(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                error: {
                    status: "failed",
                    data: [],
                    message: "Invalid email or password. Please try again with the correct credentials.",
                }
            });
        }
        const isPasswordVaild = await bcrypt.compare(String(req.body.password), user.password);
        if (!isPasswordVaild) {
            return res.status(401).json({
                error: {
                    status: "failed",
                    data: [],
                    message: "Invalid email or password. Please try again with the correct credentials.",
                }
            });
        }

        let options = {
            maxAge: 20 * 60 * 1000, // would expire after 20 minutes
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const token = user.generateAccessJWT();
        res.cookie("SessionID", token, options);
        res.status(200).json({
            status: "success",
            data: [{ first_name: user.first_name, last_name: user.last_name, email: user.email }],
            message: "You have successfully logged in.",
        });
    } catch (error) {
        return res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error.",
                details: error.message,
            }
        });
    }
    res.end();
}

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Public
 */
export async function Logout(req, res) {
    try {
        const authHeader = req.headers["cookie"];
        if (!authHeader) return res.sendStatus(204); // No content
        const cookie = authHeader.split("=")[1];
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken.token });

        if (checkIfBlacklisted) return res.status(204); // No content

        //else blacklist the token
        const newBlacklist = new Blacklist({ token: accessToken });
        await newBlacklist.save();

        //clear the cookie on the client side
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: "You are logged out!" });
    } catch (err) {
        res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error",
            }
        });
    }
    res.end();
}

/**
 * @route GET /auth/verify
 * @desc Verify user
 * @access Public
 */
export async function Verify(req, res) {
    res.status(200).json({
        status: "success",
        message: "You are authenticated",
    });
}

/**
 * @route GET /auth/user
 * @desc Get user
 * @access Public
 */
export async function GetUser(req, res) {
    res.status(200).json({
        status: "success",
        user: {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
        }
    });
    res.end();
}

/**
 * @route POST /auth/request-reset-password
 * @desc Request password reset
 * @access Public
 */
export async function RequestResetPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                error: {
                    status: "failed",
                    data: [],
                    message: "User not found.",
                }
            });
        }

        const token = user.generateResetPasswordToken();
        await user.save();

        // const resetLink = `https://next-form-app-auth-backend-fb01c8c171e9.herokuapp.com/reset-password/${token}`;
        const resetLink = `http://localhost:5005/reset-password/${token}`;

        // Send email using EmailJS
        const emailParams = {
            user_email: email,
            reset_link: resetLink,
        };

        // emailjs.send('service_9ar56ir', 'template_1h86dmp', emailParams, process.env.EMAILJS_USER_ID)
        emailjs.send('service_9ar56ir', 'template_1h86dmp', emailParams)
            .then((response) => {
                res.status(200).json({
                    status: "success",
                    message: "Password reset link sent to your email address.",
                });
            }, (error) => {
                res.status(500).json({
                    error: {
                        status: "error",
                        code: 500,
                        data: [],
                        message: "Failed to send reset email.",
                        details: error.text,
                    }
                });
            });
    } catch (error) {
        return res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error.",
                details: error.message,
            }
        });
    }
    // res.end();
}

/**
 * @route POST /auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
export async function ResetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            error: {
                status: "failed",
                data: [],
                message: "Passwords do not match.",
            }
        });
    }

try {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            error: {
                status: "failed",
                data: [],
                message: "Password reset token is invalid or has expired.",
            }
        });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password has been reset.",
    });
} catch (error) {
    return res.status(500).json({
        error: {
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error.",
            details: error.message,
        }
    });
}
// res.end();
}