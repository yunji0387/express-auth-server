import User from "../models/User.js";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";
import { VerifyToken } from "../middleware/verify.js";

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
    try {
        const user = await User.findById(req.user.id);
        const { password, ...user_data } = user._doc;
        res.status(200).json({
            status: "success",
            data: [user_data],
        });
    }
    catch (err) {
        res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error",
                details: err.message,
            }
        });
    }
    res.end();
}