import express from "express";
import Auth from "./auth.js";

const app = express();

app.disable("x-powered-by");

app.use('/auth', Auth);

app.get("/", (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Welcome to the Next Form App Auth API",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            details: error.message,
        });
    }
});

export default app;