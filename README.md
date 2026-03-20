# MERN Marketplace Backend API

Professional Node.js and Express backend for a marketplace application with JWT authentication, MongoDB data storage, and full CRUD operations for listings.

## Project Description

This backend provides APIs for user authentication and marketplace listings management. It supports secure user registration and login, protected routes using JWT, owner-based authorization for updates and deletes, input validation, and consistent JSON response handling.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication with jsonwebtoken
- Password hashing with bcryptjs
- Request logging with morgan
- CORS support with cors

## Key Features

- User registration and login
- Password hashing and credential validation
- JWT token generation and route protection
- Listings CRUD APIs
- Owner-only update and delete logic for listings
- Centralized error handling middleware
- Consistent API response format for success and errors

## Project Structure

~~~text
backend/
 config/
  db.js
 controllers/
  authController.js
  listingController.js
 middleware/
  authMiddleware.js
  errorMiddleware.js
 models/
  User.js
  Listing.js
  History.js
 routes/
  authRoutes.js
  listingRoutes.js
 utils/
  ApiError.js
  asyncHandler.js
  apiResponse.js
 server.js
~~~

## Setup Instructions

1. Clone the repository.
2. Open terminal and move to backend folder.
3. Install dependencies.
4. Create a .env file in backend folder.
5. Start server.

Commands:

~~~bash
cd backend
npm install
npm run dev
~~~

For production run:

~~~bash
npm start
~~~

## Environment Variables

Create a .env file inside backend folder with:

~~~env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
~~~

## API Base URL

~~~text
http://localhost:5000
~~~

## Response Format

Success response:

~~~json
{
 "success": true,
 "data": {}
}
~~~

Error response:

~~~json
{
 "success": false,
 "message": "Error message"
}
~~~

## API Endpoints

### Auth Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login and get token |
| GET | /api/auth/me | Private | Get current user profile |

### Listing Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | /api/listings | Public | Get all active listings |
| GET | /api/listings/:id | Public | Get listing by ID |
| POST | /api/listings | Private | Create listing |
| PUT | /api/listings/:id | Private (Owner/Admin) | Update listing |
| DELETE | /api/listings/:id | Private (Owner/Admin) | Delete listing |

## Example Requests

Use Content-Type: application/json for JSON requests.

### 1) Register User

Request

~~~http
POST /api/auth/register
~~~

Body

~~~json
{
 "name": "Demo User",
 "email": "demo@example.com",
 "password": "123456"
}
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "user": {
   "_id": "USER_ID",
   "name": "Demo User",
   "email": "demo@example.com",
   "role": "user"
  },
  "token": "JWT_TOKEN"
 }
}
~~~

### 2) Login User

Request

~~~http
POST /api/auth/login
~~~

Body

~~~json
{
 "email": "demo@example.com",
 "password": "123456"
}
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "user": {
   "_id": "USER_ID",
   "name": "Demo User",
   "email": "demo@example.com",
   "role": "user"
  },
  "token": "JWT_TOKEN"
 }
}
~~~

### 3) Create Listing

Request

~~~http
POST /api/listings
Authorization: Bearer JWT_TOKEN
~~~

Body

~~~json
{
 "title": "iPhone 13",
 "description": "128GB, excellent condition",
 "price": 650,
 "category": "Electronics",
 "images": ["https://example.com/iphone.jpg"],
 "location": "Toronto",
 "status": "active"
}
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "_id": "LISTING_ID",
  "title": "iPhone 13"
 }
}
~~~

### 4) Get Listings

Request

~~~http
GET /api/listings
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "count": 1,
  "items": [
   {
    "_id": "LISTING_ID",
    "title": "iPhone 13"
   }
  ]
 }
}
~~~

### 5) Update Listing

Request

~~~http
PUT /api/listings/LISTING_ID
Authorization: Bearer JWT_TOKEN
~~~

Body

~~~json
{
 "price": 600,
 "description": "Price updated for quick sale"
}
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "_id": "LISTING_ID",
  "price": 600
 }
}
~~~

### 6) Delete Listing

Request

~~~http
DELETE /api/listings/LISTING_ID
Authorization: Bearer JWT_TOKEN
~~~

Success Response

~~~json
{
 "success": true,
 "data": {
  "id": "LISTING_ID"
 }
}
~~~

## Demo Flow

Recommended order for demo:

1. Register
2. Login and copy token
3. Create listing with token
4. Get listings
5. Update listing
6. Delete listing

## Submission Notes

- Ensure MongoDB is running or MongoDB Atlas URI is valid.
- Ensure .env variables are set before starting server.
- Use Postman environment variables for base URL, token, and listing ID for faster demo.
