# 🔐 Phase 2: User Registration & Authentication Flow

## 📋 **Step 4: Complete User Authentication System**

### Frontend Registration Flow
**Guest Registration**:
- Email/password signup
- Profile creation (name, interests, location)
- Email verification
- Onboarding tutorial

**Host Registration**:
- Basic signup
- Redirect to host application process
- Profile verification
- Dashboard access upon approval

### Enhanced User Model
```sql
-- Update Users table
ALTER TABLE "Users" ADD COLUMN "isEmailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "Users" ADD COLUMN "profilePhoto" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN interests TEXT[];
ALTER TABLE "Users" ADD COLUMN location VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN "onboardingCompleted" BOOLEAN DEFAULT false;
ALTER TABLE "Users" ADD COLUMN "lastLoginAt" TIMESTAMP;
ALTER TABLE "Users" ADD COLUMN "resetPasswordToken" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN "resetPasswordExpires" TIMESTAMP;

-- Email verification tokens
CREATE TABLE "EmailVerificationTokens" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "Users"(id),
  token VARCHAR(255) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```javascript
// Authentication routes
POST /api/auth/register        // User registration
POST /api/auth/login          // User login
POST /api/auth/logout         // User logout
POST /api/auth/forgot-password // Password reset request
POST /api/auth/reset-password  // Password reset
GET  /api/auth/verify-email/:token // Email verification
POST /api/auth/resend-verification // Resend verification

// Profile routes
GET  /api/users/profile       // Get user profile
PUT  /api/users/profile       // Update profile
POST /api/users/upload-photo  // Profile photo upload
PUT  /api/users/onboarding    // Complete onboarding
```

### Frontend Components
**Registration Form**:
- Email/password validation
- Terms of service acceptance
- Interest selection
- Location input

**Login Form**:
- Email/password fields
- Remember me option
- Forgot password link
- Social login (future)

**Profile Management**:
- Photo upload
- Personal information
- Preferences
- Account settings

### Email Integration
**SendGrid Templates**:
- Welcome email
- Email verification
- Password reset
- Booking confirmations
- Host notifications

**Implementation: 1 week for complete auth system! 🚀**
