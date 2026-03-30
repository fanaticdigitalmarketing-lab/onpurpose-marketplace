-- OnPurpose Database Schema
-- Connection, not dating

-- Users table (both guests and hosts)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) DEFAULT 'guest' CHECK (user_type IN ('guest', 'host', 'admin')),
  profile_photo TEXT,
  bio TEXT,
  interests JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hosts table (extended profile for hosts)
CREATE TABLE hosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  offerings TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  categories JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  host_id INTEGER REFERENCES hosts(id) ON DELETE CASCADE,
  session_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  total_amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  host_id INTEGER REFERENCES hosts(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Availability table (for hosts)
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES hosts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table (basic chat)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_hosts_status ON hosts(status);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_session_date ON bookings(session_date);
CREATE INDEX idx_reviews_host_id ON reviews(host_id);
CREATE INDEX idx_availability_host_id ON availability(host_id);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);

-- Insert sample categories
INSERT INTO users (email, password_hash, name, user_type) VALUES 
('admin@onpurpose.com', '$2a$10$example', 'OnPurpose Admin', 'admin');

-- Sample data for development (remove in production)
-- This will be populated by the seeding script
