# OnPurpose Minimal Frontend

A clean, minimal React frontend for the OnPurpose marketplace.

## Features

- **Authentication**: Register and Login with JWT
- **Dashboard**: View your listings and bookings
- **Create Listing**: Offer your services
- **View Listings**: Browse available services
- **Book Listing**: Book services with date/time selection

## Setup

1. Install dependencies:
```bash
cd minimal-frontend
npm install
```

2. Start development server:
```bash
npm start
```

3. Ensure backend is running on `http://localhost:3000`

## Pages

### `/register` - User Registration
- Username, email, password fields
- JWT token storage in localStorage
- Redirects to dashboard on success

### `/login` - User Login
- Email and password fields
- JWT token storage in localStorage
- Redirects to dashboard on success

### `/dashboard` - User Dashboard
- Shows user's listings
- Shows user's bookings
- Create new listing button
- Logout functionality

### `/create-listing` - Create Service
- Title, description, price fields
- JWT authentication required
- Redirects to dashboard on success

### `/listings` - View All Services
- Grid layout of all available listings
- Book now buttons for each listing
- Responsive design

### `/book/:listingId` - Book Service
- Shows listing details
- Date/time selection form
- JWT authentication required
- Prevents double bookings

## API Integration

Uses Axios with automatic JWT token handling:

```javascript
// Auth
POST /api/auth/register
POST /api/auth/login

// Listings
GET /api/listings
POST /api/listings

// Bookings
POST /api/bookings
GET /api/bookings/my-bookings
```

## JWT Authentication

- Token stored in localStorage
- Automatic token inclusion in API headers
- Protected routes redirect to login
- Logout clears token and user data

## Styling

- Minimal, clean design
- Responsive layouts
- Simple CSS (no frameworks)
- Focus on functionality over aesthetics

## Technologies

- React 18
- React Router 6
- Axios
- CSS3
- Create React App
