-- OnPurpose Phase 1 Database Schema Updates - FIXED VERSION
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

-- Enhanced Hosts table for approved hosts (only add columns if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'bio') THEN
        ALTER TABLE "Hosts" ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'profilePhoto') THEN
        ALTER TABLE "Hosts" ADD COLUMN "profilePhoto" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'portfolioImages') THEN
        ALTER TABLE "Hosts" ADD COLUMN "portfolioImages" TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'availability') THEN
        ALTER TABLE "Hosts" ADD COLUMN availability JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'verificationStatus') THEN
        ALTER TABLE "Hosts" ADD COLUMN "verificationStatus" VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'hourlyRate') THEN
        ALTER TABLE "Hosts" ADD COLUMN "hourlyRate" DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'location') THEN
        ALTER TABLE "Hosts" ADD COLUMN location VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'totalEarnings') THEN
        ALTER TABLE "Hosts" ADD COLUMN "totalEarnings" DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Hosts' AND column_name = 'responseRate') THEN
        ALTER TABLE "Hosts" ADD COLUMN "responseRate" DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

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

-- Enhanced Bookings table (only add columns if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'experienceId') THEN
        ALTER TABLE "Bookings" ADD COLUMN "experienceId" INTEGER REFERENCES "Experiences"(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'guestCount') THEN
        ALTER TABLE "Bookings" ADD COLUMN "guestCount" INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'specialRequests') THEN
        ALTER TABLE "Bookings" ADD COLUMN "specialRequests" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'meetingLocation') THEN
        ALTER TABLE "Bookings" ADD COLUMN "meetingLocation" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'hostNotes') THEN
        ALTER TABLE "Bookings" ADD COLUMN "hostNotes" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Bookings' AND column_name = 'guestNotes') THEN
        ALTER TABLE "Bookings" ADD COLUMN "guestNotes" TEXT;
    END IF;
END $$;

-- Sample NYC host categories data (only insert if table is empty)
INSERT INTO "HostApplications" ("firstName", "lastName", email, category, experience, bio, location, "hourlyRate", availability, status) 
SELECT * FROM (VALUES
    ('Maria', 'Rodriguez', 'maria.foodie@email.com', 'Local Expert', 'Food blogger and NYC native with 10+ years exploring hidden culinary gems', 'Passionate foodie who knows every authentic taco spot in Queens and secret speakeasy in Manhattan', 'Queens', 45.00, '15-25 hours', 'approved'),
    ('David', 'Chen', 'david.history@email.com', 'Cultural Guide', 'Licensed NYC tour guide specializing in immigration history and Chinatown culture', 'Third-generation New Yorker sharing stories of how diverse communities shaped our city', 'Manhattan', 55.00, '10-15 hours', 'approved'),
    ('Sarah', 'Williams', 'sarah.wellness@email.com', 'Wellness Coach', 'Certified yoga instructor and meditation teacher with Central Park outdoor classes', 'Find your zen in the city that never sleeps through mindful movement and breathing', 'Manhattan', 65.00, '15-25 hours', 'approved'),
    ('Alex', 'Thompson', 'alex.photo@email.com', 'Creative Mentor', 'Professional photographer teaching street photography and Instagram content creation', 'Capture the soul of NYC through your lens - from golden hour in Brooklyn to neon nights in Times Square', 'Brooklyn', 50.00, 'Flexible', 'approved'),
    ('Jennifer', 'Kim', 'jennifer.network@email.com', 'Professional Networker', 'Tech startup founder and angel investor connecting ambitious professionals', 'Navigate NYC''s startup ecosystem and build meaningful professional relationships that matter', 'Manhattan', 75.00, '10-15 hours', 'approved')
) AS v("firstName", "lastName", email, category, experience, bio, location, "hourlyRate", availability, status)
WHERE NOT EXISTS (SELECT 1 FROM "HostApplications" WHERE email = v.email);

-- Update sample hosts in main Hosts table (only if they exist)
UPDATE "Hosts" SET 
  bio = 'Passionate foodie who knows every authentic taco spot in Queens and secret speakeasy in Manhattan',
  location = 'Queens',
  "hourlyRate" = 45.00,
  "verificationStatus" = 'verified'
WHERE id = 1 AND EXISTS (SELECT 1 FROM "Hosts" WHERE id = 1);

UPDATE "Hosts" SET 
  bio = 'Third-generation New Yorker sharing stories of how diverse communities shaped our city',
  location = 'Manhattan', 
  "hourlyRate" = 55.00,
  "verificationStatus" = 'verified'
WHERE id = 2 AND EXISTS (SELECT 1 FROM "Hosts" WHERE id = 2);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON "HostApplications"(status);
CREATE INDEX IF NOT EXISTS idx_host_applications_category ON "HostApplications"(category);
CREATE INDEX IF NOT EXISTS idx_hosts_location ON "Hosts"(location);
CREATE INDEX IF NOT EXISTS idx_hosts_verification ON "Hosts"("verificationStatus");
CREATE INDEX IF NOT EXISTS idx_experiences_host ON "Experiences"("hostId");
CREATE INDEX IF NOT EXISTS idx_experiences_category ON "Experiences"(category);
