# 📅 Phase 2: Host Search & Booking System

## 📋 **Step 5: Host Search & Discovery**

### Search & Filter System
**Search Functionality**:
- **Text search**: Host names, descriptions, locations
- **Category filters**: Local Expert, Cultural Guide, Wellness Coach, etc.
- **Price range**: $35-75/hour slider
- **Location**: NYC neighborhoods, distance radius
- **Availability**: Date/time selection
- **Rating**: Minimum star rating filter

### Host Listing Page
**Display Elements**:
- **Grid/list view**: Toggle between layouts
- **Host cards**: Photo, name, category, price, rating
- **Quick preview**: Hover for more details
- **Sorting options**: Price, rating, distance, availability
- **Pagination**: Load more results

### Host Profile Pages
**Detailed Information**:
- **Photo gallery**: Professional photos, experience shots
- **Bio & expertise**: Detailed description, background
- **Services offered**: Specific experiences, packages
- **Pricing**: Hourly rates, package deals
- **Availability calendar**: Real-time scheduling
- **Reviews**: Guest feedback and ratings
- **Location**: Service areas, meeting points

## 🎯 **Booking Flow Implementation**

### Booking Process
1. **Select experience**: Choose from host's offerings
2. **Pick date/time**: Available slots from calendar
3. **Duration**: 1-4 hour sessions
4. **Guest count**: Individual or small groups
5. **Special requests**: Custom requirements
6. **Payment**: Secure Stripe processing
7. **Confirmation**: Email and SMS notifications

### Database Schema
```sql
-- Experiences table
CREATE TABLE "Experiences" (
  id SERIAL PRIMARY KEY,
  "hostId" INTEGER REFERENCES "Hosts"(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  "maxGuests" INTEGER DEFAULT 1,
  "basePrice" DECIMAL(10,2),
  category VARCHAR(100),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Bookings table (enhanced)
ALTER TABLE "Bookings" ADD COLUMN "experienceId" INTEGER REFERENCES "Experiences"(id);
ALTER TABLE "Bookings" ADD COLUMN "guestCount" INTEGER DEFAULT 1;
ALTER TABLE "Bookings" ADD COLUMN "specialRequests" TEXT;
ALTER TABLE "Bookings" ADD COLUMN "meetingLocation" VARCHAR(255);
ALTER TABLE "Bookings" ADD COLUMN "hostNotes" TEXT;
ALTER TABLE "Bookings" ADD COLUMN "guestNotes" TEXT;

-- Availability table
CREATE TABLE "HostAvailability" (
  id SERIAL PRIMARY KEY,
  "hostId" INTEGER REFERENCES "Hosts"(id),
  "dayOfWeek" INTEGER, -- 0-6 (Sunday-Saturday)
  "startTime" TIME,
  "endTime" TIME,
  "isRecurring" BOOLEAN DEFAULT true,
  "specificDate" DATE, -- for one-time availability
  "isAvailable" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```javascript
// Search & Discovery
GET  /api/hosts/search?q=&category=&price=&location= // Search hosts
GET  /api/hosts/:id                                  // Host profile
GET  /api/hosts/:id/availability                     // Host calendar
GET  /api/experiences                                // All experiences
GET  /api/experiences/category/:category             // By category

// Booking Management
POST /api/bookings                                   // Create booking
GET  /api/bookings/user/:userId                      // User bookings
GET  /api/bookings/host/:hostId                      // Host bookings
PUT  /api/bookings/:id/status                        // Update status
POST /api/bookings/:id/cancel                        // Cancel booking
```

**Implementation: 2 weeks for complete booking system! 🚀**
