import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";

const server = express();

server.use(cors());
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect(URI).then(console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

server.use(App);

server.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`),
);