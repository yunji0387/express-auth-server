import User from "../models/User";
import jwt from "jsonwebtoken";

export async function Verify(req, res) {
    try {
        const authHeader = req.headers["cookie"];

        if(!authHeader) return res.sendStatus(401);
        const cookie = authHeader.split("=")[1];

        jwt.verify(cookie, config.SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: "failed",
                    message: "This session has expired. Please login to continue.",
                    details: err.message,
                });
            }

            const { id } = decoded;
            const user = await User.findById(id);
            const { password, ...user_data } = user._doc;
            req.user = user_data;
            next();
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            code: 500,
            data: [],
            details: err.message,
        });
    }
}