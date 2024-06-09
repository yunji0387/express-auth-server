import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export { URI, PORT, SECRET_ACCESS_TOKEN, transporter };