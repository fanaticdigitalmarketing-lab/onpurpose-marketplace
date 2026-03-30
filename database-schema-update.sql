-- OnPurpose Phase 1 Database Schema Updates
-- Host Applications and Enhanced Host Management

-- Create HostApplications table for managing host recruitment
CREATE TABLE IF NOT EXISTS "HostApplications" (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  category VARCHAR(100) NOT NULL,
  experience TEXT NOT NULL,
  portfolio TEXT,
  bio TEXT,
  location VARCHAR(255),
  "hourlyRate" DECIMAL(10,2),
  availability VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  "reviewNotes" TEXT,
  "reviewedBy" INTEGER,
  "reviewedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Enhanced Hosts table for approved hosts
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "profilePhoto" VARCHAR(255);
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "portfolioImages" TEXT[];
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS availability JSONB;
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "verificationStatus" VARCHAR(50) DEFAULT 'pending';
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "hourlyRate" DECIMAL(10,2);
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "totalEarnings" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE "Hosts" ADD COLUMN IF NOT EXISTS "responseRate" DECIMAL(5,2) DEFAULT 0;

-- Experiences table for host offerings
CREATE TABLE IF NOT EXISTS "Experiences" (
  id SERIAL PRIMARY KEY,
  "hostId" INTEGER REFERENCES "Hosts"(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  "maxGuests" INTEGER DEFAULT 1,
  "basePrice" DECIMAL(10,2),
  category VARCHAR(100),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Host availability scheduling
CREATE TABLE IF NOT EXISTS "HostAvailability" (
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

-- Enhanced Bookings table
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "experienceId" INTEGER REFERENCES "Experiences"(id);
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "guestCount" INTEGER DEFAULT 1;
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "specialRequests" TEXT;
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "meetingLocation" VARCHAR(255);
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "hostNotes" TEXT;
ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "guestNotes" TEXT;

-- Sample NYC host categories data
INSERT INTO "HostApplications" ("firstName", "lastName", email, category, experience, bio, location, "hourlyRate", availability, status) VALUES
('Maria', 'Rodriguez', 'maria.foodie@email.com', 'Local Expert', 'Food blogger and NYC native with 10+ years exploring hidden culinary gems', 'Passionate foodie who knows every authentic taco spot in Queens and secret speakeasy in Manhattan', 'Queens', 45.00, '15-25 hours', 'approved'),
('David', 'Chen', 'david.history@email.com', 'Cultural Guide', 'Licensed NYC tour guide specializing in immigration history and Chinatown culture', 'Third-generation New Yorker sharing stories of how diverse communities shaped our city', 'Manhattan', 55.00, '10-15 hours', 'approved'),
('Sarah', 'Williams', 'sarah.wellness@email.com', 'Wellness Coach', 'Certified yoga instructor and meditation teacher with Central Park outdoor classes', 'Find your zen in the city that never sleeps through mindful movement and breathing', 'Manhattan', 65.00, '15-25 hours', 'approved'),
('Alex', 'Thompson', 'alex.photo@email.com', 'Creative Mentor', 'Professional photographer teaching street photography and Instagram content creation', 'Capture the soul of NYC through your lens - from golden hour in Brooklyn to neon nights in Times Square', 'Brooklyn', 50.00, 'Flexible', 'approved'),
('Jennifer', 'Kim', 'jennifer.network@email.com', 'Professional Networker', 'Tech startup founder and angel investor connecting ambitious professionals', 'Navigate NYC''s startup ecosystem and build meaningful professional relationships that matter', 'Manhattan', 75.00, '10-15 hours', 'approved');

-- Update sample hosts in main Hosts table
UPDATE "Hosts" SET 
  bio = 'Passionate foodie who knows every authentic taco spot in Queens and secret speakeasy in Manhattan',
  location = 'Queens',
  "hourlyRate" = 45.00,
  "verificationStatus" = 'verified'
WHERE id = 1;

UPDATE "Hosts" SET 
  bio = 'Third-generation New Yorker sharing stories of how diverse communities shaped our city',
  location = 'Manhattan', 
  "hourlyRate" = 55.00,
  "verificationStatus" = 'verified'
WHERE id = 2;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON "HostApplications"(status);
CREATE INDEX IF NOT EXISTS idx_host_applications_category ON "HostApplications"(category);
CREATE INDEX IF NOT EXISTS idx_hosts_location ON "Hosts"(location);
CREATE INDEX IF NOT EXISTS idx_hosts_verification ON "Hosts"("verificationStatus");
CREATE INDEX IF NOT EXISTS idx_experiences_host ON "Experiences"("hostId");
CREATE INDEX IF NOT EXISTS idx_experiences_category ON "Experiences"(category);
