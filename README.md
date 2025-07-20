# Express Authentication Server

[![Run Tests](https://github.com/yunji0387/express-auth-server/actions/workflows/test.yml/badge.svg)](https://github.com/yunji0387/express-auth-server/actions/workflows/test.yml)
[![CodeQL](https://github.com/yunji0387/express-auth-server/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/yunji0387/express-auth-server/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/yunji0387/express-auth-server/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/yunji0387/express-auth-server/actions/workflows/dependabot/dependabot-updates)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

[![GitHub issues](https://img.shields.io/github/issues/yunji0387/express-auth-server)](https://github.com/yunji0387/express-auth-server/issues)
[![GitHub forks](https://img.shields.io/github/forks/yunji0387/express-auth-server)](https://github.com/yunji0387/express-auth-server/network)
[![GitHub stars](https://img.shields.io/github/stars/yunji0387/express-auth-server)](https://github.com/yunji0387/express-auth-server/stargazers)

[![Code Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)](https://github.com/yunji0387/express-auth-server)
[![Security Rating](https://img.shields.io/badge/security-A-brightgreen)](https://github.com/yunji0387/express-auth-server/security)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/yunji0387/express-auth-server/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<!-- [![npm version](https://img.shields.io/npm/v/express-auth-server?color=brightgreen)](https://www.npmjs.com/package/express-auth-server) -->
<!-- [![Docker Image Size](https://img.shields.io/docker/image-size/yunji0387/express-auth-server?color=blue)](https://hub.docker.com/r/yunji0387/express-auth-server) -->

A robust and secure Node.js Express server providing complete user authentication functionality including registration, login, logout, password reset, and session validation with JWT tokens and OAuth integration.

## ✨ Features

- 🔐 **User Registration** - Secure account creation with password hashing
- 🔑 **User Login** - JWT-based authentication with HTTPOnly cookies
- 🚪 **User Logout** - Secure session termination with token blacklisting
- ✅ **Session Validation** - Middleware for protected routes
- 🔄 **Password Reset** - Email-based password recovery system
- 🌐 **OAuth Integration** - Google OAuth with Passport.js
- 🛡️ **Security Features** - Rate limiting, CORS, input validation
- 🐳 **Docker Support** - Containerized deployment ready
- 🧪 **Comprehensive Testing** - 87%+ test coverage with Jest

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** >= 16.0.0 and npm installed
- **MongoDB** running locally or remotely (MongoDB Atlas recommended)
- **Git** for version control
- **Google OAuth Credentials** (optional, for OAuth features)

## 🚀 Installation and Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/yunji0387/express-auth-server.git
cd express-auth-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```bash
# Database
URI=mongodb://localhost:27017/your-database-name
# or for MongoDB Atlas:
# URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Server Configuration
PORT=5005
NODE_ENV=development

# JWT Configuration
SECRET_ACCESS_TOKEN=your-super-secret-jwt-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Start the development server
```bash
npm start
```

The server will start running on [http://localhost:5005](http://localhost:5005)

### 5. Run tests (optional)
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 🐳 Docker Setup

### Quick Start with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t express-auth-server .
   ```

2. **Run with Docker Compose (recommended):**
   ```bash
   # Create docker-compose.yml with MongoDB service
   docker-compose up -d
   ```

3. **Or run the container directly:**
   ```bash
   docker run -p 5005:5005 --env-file .env express-auth-server
   ```

**Note:** Ensure your `.env` file is properly configured before running with Docker.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5005
```

### Authentication Endpoints

#### 1. Register New User
- **URL:** `/auth/register`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@example.com"
  },
  "message": "Your account has been successfully created."
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": {
    "status": "failed",
    "message": "It seems you already have an account, please log in instead."
  }
}
```

#### 2. User Login
- **URL:** `/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response:** `200 OK` + JWT cookie set
```json
{
  "status": "success",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@example.com"
  },
  "message": "You have successfully logged in."
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "error": {
    "status": "failed",
    "message": "Invalid email or password. Please try again with the correct credentials."
  }
}
```

#### 3. User Logout
- **URL:** `/auth/logout`
- **Method:** `GET`
- **Authentication:** Required (JWT cookie)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "You have successfully logged out."
}
```

#### 4. Verify Session
- **URL:** `/auth/verify`
- **Method:** `GET`
- **Authentication:** Required (JWT cookie)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "You are authenticated."
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "error": {
    "status": "failed",
    "message": "Access denied. No valid token provided."
  }
}
```

#### 5. Get User Profile
- **URL:** `/auth/user`
- **Method:** `GET`  
- **Authentication:** Required (JWT cookie)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@example.com"
  }
}
```

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (>= 16.0.0)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + Passport.js (Google OAuth)
- **Security:** bcrypt, CORS, cookie-parser
- **Testing:** Jest with 87%+ coverage
- **Container:** Docker & Docker Compose
- **Environment:** dotenv for configuration

## 🏗️ Project Structure

```
├── config/
│   ├── index.js              # Passport configuration
│   └── __tests__/            # Config tests
├── controllers/
│   ├── auth.js               # Authentication logic
│   └── __tests__/            # Controller tests
├── middleware/
│   ├── validate.js           # Input validation
│   ├── verify.js             # JWT verification
│   └── __tests__/            # Middleware tests
├── models/
│   ├── User.js               # User schema
│   ├── Blacklist.js          # Token blacklist
│   └── __tests__/            # Model tests
├── routes/
│   ├── auth.js               # Auth routes
│   └── index.js              # Route exports
├── views/
│   └── reset-password.ejs    # Password reset template
├── public/
│   └── assets/               # Static files
├── .env.example              # Environment template
├── server.js                 # Application entry point
├── Dockerfile                # Docker configuration
└── package.json              # Dependencies & scripts
```

## 🧪 Testing

This project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

**Current Coverage:** 87%+ across all modules

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes and add tests**
4. **Ensure tests pass:** `npm test`
5. **Commit your changes:** `git commit -m 'Add amazing feature'`
6. **Push to branch:** `git push origin feature/amazing-feature`
7. **Submit a Pull Request**

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE.md](./LICENSE.md) file for details.

## 🆘 Support & Issues

- **Bug Reports:** [Create an issue](https://github.com/yunji0387/express-auth-server/issues/new?template=bug_report.md)
- **Feature Requests:** [Request a feature](https://github.com/yunji0387/express-auth-server/issues/new?template=feature_request.md)
- **Questions:** [GitHub Discussions](https://github.com/yunji0387/express-auth-server/discussions)

## 🙏 Acknowledgments

- Express.js community for the robust framework
- MongoDB team for the excellent database solution
- Passport.js for authentication strategies
- Jest team for the testing framework

---

**⭐ If this project helped you, please consider giving it a star!**
