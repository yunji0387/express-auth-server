import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, EMAIL_USER, NODEMAILER_PASS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, COOKIE_KEY } = process.env;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_USER,
        pass: NODEMAILER_PASS,
    },
});

// Passport Configuration
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          email: profile.emails[0].value
        });
        await user.save();
      }
      const token = jwt.sign({ id: user._id }, SECRET_ACCESS_TOKEN, { expiresIn: '20m' });
      done(null, { user, token });
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser(async (data, done) => {
  try {
    const user = await User.findById(data.user._id);
    done(null, { user, token: data.token });
  } catch (err) {
    done(err, null);
  }
});

export { URI, PORT, SECRET_ACCESS_TOKEN, transporter, passport, COOKIE_KEY };


// import * as dotenv from 'dotenv';
// import nodemailer from 'nodemailer';

// dotenv.config();

// const { URI, PORT, SECRET_ACCESS_TOKEN, EMAIL_USER, NODEMAILER_PASS } = process.env;

// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: EMAIL_USER,
//         pass: NODEMAILER_PASS,
//     },
// });

// export { URI, PORT, SECRET_ACCESS_TOKEN, transporter };