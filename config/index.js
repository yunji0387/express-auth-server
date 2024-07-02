import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, EMAIL_USER, NODEMAILER_PASS } = process.env;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_USER,
        pass: NODEMAILER_PASS,
    },
});

export { URI, PORT, SECRET_ACCESS_TOKEN, transporter };