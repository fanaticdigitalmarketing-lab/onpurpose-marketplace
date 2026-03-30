# OnPurpose - Hospitality Marketplace for People

A Node.js + Express backend for OnPurpose, a hospitality marketplace where guests book people, not places—connecting with hosts who offer meaningful experiences, services, and time.

## Features

- **User Authentication**: JWT-based registration and login for guests and hosts
- **Service Listings**: Create, read, update, delete service offerings (not physical spaces)
- **Booking System**: Book hosts for time-based experiences and services
- **Database**: PostgreSQL with Sequelize ORM
- **Validation**: Input validation with express-validator
- **Security**: Password hashing with bcryptjs and authorization checks

## Project Structure

```
simple-marketplace/
├── config/
│   └── database.js     # Database configuration
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── models/
│   ├── User.js         # User model
│   ├── Listing.js      # Listing model
│   └── index.js        # Model associations
├── routes/
│   ├── auth.js         # Authentication routes
│   └── listings.js     # Listing CRUD routes
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── server.js           # Main server file
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database
- Create a database named `marketplace`
- Update `.env` file with your database credentials

### 3. Environment Variables
Update `.env` file with your settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=3000
```

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Listings
- `GET /api/listings` - Get all service offerings
- `GET /api/listings/:id` - Get single service details
- `POST /api/listings` - Create service offering (requires auth)
- `PUT /api/listings/:id` - Update service offering (requires auth, host only)
- `DELETE /api/listings/:id` - Delete service offering (requires auth, host only)

### Bookings
- `POST /api/bookings` - Create booking request for host's time (requires auth)
- `GET /api/bookings/my-bookings` - Get user's service bookings (requires auth)
- `GET /api/bookings/listing/:listingId` - Get bookings for a service (host only)
- `PUT /api/bookings/:id` - Update booking status (host only)

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Service Offering (with token)
```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Local Food Tour Experience",
    "description": "Join me for a 3-hour authentic food tour through hidden local gems",
    "price": 75.00
  }'
```

### Get All Service Offerings
```bash
curl http://localhost:3000/api/listings
```

### Create Booking for Host's Time (with token)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "listingId": 1,
    "startDate": "2024-01-15T10:00:00Z",
    "endDate": "2024-01-17T12:00:00Z"
  }'
```

**Note**: The system prevents double bookings by checking for date conflicts with existing accepted bookings.

### Get User's Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Accept Booking (host only)
```bash
curl -X PUT http://localhost:3000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HOST_JWT_TOKEN" \
  -d '{
    "status": "accepted"
  }'
```

## Database Schema

### Users Table
- id (Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, Hashed)

### Listings Table
- id (Primary Key)
- title (String) - Service/experience name
- description (Text) - Details of the service offered
- price (Decimal) - Price for the service
- userId (Foreign Key to Users - host offering the service)

### Bookings Table
- id (Primary Key)
- userId (Foreign Key to Users - guest booking the service)
- listingId (Foreign Key to Listings - service being booked)
- startDate (Date) - When the service begins
- endDate (Date) - When the service ends
- status (Enum: pending, accepted, rejected) - Booking status

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## License

MIT
