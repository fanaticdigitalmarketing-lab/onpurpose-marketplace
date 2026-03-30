# OnPurpose Frontend

A simple React frontend for the OnPurpose hospitality marketplace.

## Features

- **Authentication**: User registration and login
- **Service Listings**: Browse and view service offerings
- **Create Services**: Add new service offerings (authenticated users only)
- **Booking System**: Book services with date/time selection
- **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Backend Configuration
Make sure your backend is running on `http://localhost:3000` or update the API_BASE_URL in `src/services/api.js`

## Pages

### Authentication (`/auth`)
- User registration and login
- Switch between login/register modes
- JWT token management

### Listings (`/listings`)
- Browse all available services
- View service details and pricing
- Quick booking buttons

### Create Listing (`/create-listing`)
- Create new service offerings
- Form validation
- Authenticated users only

### Booking (`/book/:listingId`)
- Book specific services
- Date/time selection
- Double booking prevention

## API Integration

Uses Axios for HTTP requests with automatic JWT token handling:

```javascript
// Auth API
authAPI.register(userData)
authAPI.login(credentials)

// Listings API
listingsAPI.getAll()
listingsAPI.create(listingData)

// Bookings API
bookingsAPI.create(bookingData)
bookingsAPI.getMyBookings()
```

## Styling

- Clean, modern design with gradients
- Responsive grid layouts
- Hover effects and transitions
- Mobile-first approach

## Technologies Used

- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling (no CSS framework)

## Environment

- Development: `npm start`
- Production: `npm run build`
- Built with Create React App
