import express from "express";
import Auth from "./auth.js";
import path from "path";
import { VerifyToken, VerifyRole } from "../middleware/verify.js";

const app = express();

// Define CORS options
const corsOptions = {
    origin: ['http://localhost:3000', 'https://next-form-app-pi.vercel.app'], // List of allowed origins
    credentials: true, // Allow credentials
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.disable("x-powered-by");

app.use('/auth', Auth);
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.get("/test", (req, res) => {
    res.render("test");
});

app.get("/user", VerifyToken, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to your Dashboard.",
    });
});

app.get("/admin", VerifyToken, VerifyRole, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Admin portal!",
    });
});

export default app;