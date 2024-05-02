import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";

const server = express();

// Define CORS options
const corsOptions = {
    origin: ['http://localhost:3000', 'https://next-form-app-pi.vercel.app'], // List of allowed origins
    credentials: true, // Allow credentials
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

server.use(cors(corsOptions)); // Use CORS with specified options
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect(URI).then(console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit process with an error code
    });

server.use(App);

server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`),
);