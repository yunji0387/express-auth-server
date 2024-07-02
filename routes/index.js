import express from 'express';
import cookieSession from 'cookie-session';
import { passport, COOKIE_KEY } from './config/index.js'; // Ensure to import your configuration which includes passport
import Auth from './auth.js';
import './config/index.js';  // Ensure to import your configuration which includes passport

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [COOKIE_KEY],
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

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

app.get("/reset-password/:token", (req, res) => {
    res.render("reset-password", { token: req.params.token });
});

export default app;

// import express from "express";
// import Auth from "./auth.js";
// import { VerifyToken, VerifyRole } from "../middleware/verify.js";

// const app = express();

// // app.disable("x-powered-by");

// app.use('/auth', Auth);

// app.get("/", (req, res) => {
//     try {
//         res.status(200).json({
//             status: "success",
//             message: "Welcome to the Next Form App Auth API",
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "error",
//             message: "Internal Server Error",
//             details: error.message,
//         });
//     }
// });

// app.get("/reset-password/:token", (req, res) => {
//     res.render("reset-password", { token: req.params.token });
// });

// // app.get("/user", VerifyToken, (req, res) => {
// //     res.status(200).json({
// //         status: "success",
// //         message: "Welcome to your Dashboard.",
// //     });
// // });

// // app.get("/admin", VerifyToken, VerifyRole, (req, res) => {
// //     res.status(200).json({
// //         status: "success",
// //         message: "Welcome to the Admin portal!",
// //     });
// // });

// export default app;