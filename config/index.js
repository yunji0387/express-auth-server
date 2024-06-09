import * as dotenv from "dotenv";
import nodemailer from 'nodemailer';

dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN } = process.env;

export { URI, PORT, SECRET_ACCESS_TOKEN };

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default transporter;