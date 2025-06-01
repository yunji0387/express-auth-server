# Next Admin System Express Authentication Server

This Node.js Express server handles user authentication including registration, login, logout, and session validation.

## Features

- User Registration
- User Login
- User Logout
- Session Validation

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js and npm installed
- MongoDB running locally or remotely (update connection URI accordingly)

## Installation and Local Setup

To install the necessary packages, run the following command:

1. Clone the repository:
```bash
git clone [repository URL]
```

2. Navigate to the project directory:
```bash
cd [project directory]
```

3. Install dependencies:
```bash
npm install
```

4. Create a .env file in the project root and add:
  - MongoDB URI:
    ```bash
    URI=[your MongoDB URI]
    ```
  - PORT:
    ```bash
    PORT=5005
    ```
  - SECRET_ACCESS_TOKEN:
    ```bash
    SECRET_ACCESS_TOKEN=[your secret key for JWT]
    ```

## Usage
To start the server, run:
```bash
node server.js
```
The server will start running on http://localhost:5005.

---

## Running the Server

To start the server, run:
```bash
npm start
```
The server will start running on http://localhost:5000.

## Docker Setup

You can also run this project using Docker:

1. **Build the Docker image:**
   ```bash
   docker build -t next-form-app-auth-backend .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 5005:5005 --env-file .env next-form-app-auth-backend
   ```

Make sure your `.env` file (with `URI=[your MongoDB URI]`, `PORT=5005`, `SECRET_ACCESS_TOKEN=[your secret key]`) is present in the project root.

The server will be accessible at [http://localhost:5005](http://localhost:5005).

---

## API Endpoints
### Register
- URL: `/auth/register`
- Method: `POST`
- Body:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- Success Response: `201 Created` +
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

- Error Response: `400 Bad Request` +
  ```json
  {
    "error": {
      "status": "failed",
      "message": "It seems you already have an account, please log in instead."
    }
  }
  ```

### Login
- URL: `/auth/login`
- Method: `POST`
- Body:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- Success Response: `200 OK` + user data JWT token (set in HTTPOnly cookie) +
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

- Error Response: `401 Unauthorized` +
  ```json
  {
    "error": {
      "status": "failed",
      "message": "Invalid email or password. Please try again with the correct credentials."
    }
  }
  ```

### Logout
- URL: `/auth/logout`
- Method: `GET`
- Success Response: `200 OK` +
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
- Error Response: `401 Unauthorized` (if token is invalid or expired) +
  ```json
  {
    "error": {
      "status": "failed",
      "message": "Invalid email or password. Please try again with the correct credentials."
    }
  }
  ```

### Verify Session
- URL: `/auth/verify`
- Method: `GET`
- Success Response: `200 OK` +
  ```json
  {
    "status": "success",
    "message": "You are authenticated."
  }
  ```
- Error Response: `401 Unauthorized` (if token is invalid or expired)

## Contributing
- Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
- This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.
