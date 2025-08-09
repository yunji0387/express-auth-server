import express from 'express';
import cookieSession from 'cookie-session';
import { passport, COOKIE_KEY } from '../config/index.js'; // Ensure to import your configuration which includes passport
import Auth from './auth.js';

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
    // Only allow tokens that match a strict pattern (e.g., JWT: base64url segments, or UUID)
    const token = req.params.token;
    // Example: JWT regex (three base64url segments separated by dots)
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    // Example: UUID regex (v4)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (jwtRegex.test(token) || uuidRegex.test(token)) {
        res.render("reset-password", { token });
    } else {
        res.status(400).send("Invalid or malformed token.");
    }
});

export default app;
