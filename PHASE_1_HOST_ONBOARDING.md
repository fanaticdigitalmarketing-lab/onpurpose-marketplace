# 🔧 Phase 1: Host Onboarding & Approval Workflow

## 📋 **Step 2: Host Onboarding System**

### Application Process
**4-Step Host Application**:
1. **Basic Info**: Name, contact, location, category selection
2. **Experience**: Skills, background, portfolio/examples
3. **Availability**: Schedule, pricing preferences, commitment level
4. **Verification**: ID check, references, background screening

### Approval Workflow
**Review Process**:
- **Auto-screening**: Basic requirements check
- **Manual review**: Experience and fit assessment
- **Video interview**: 15-minute screening call
- **Reference check**: Previous clients/employers
- **Final approval**: Admin dashboard decision

### Host Profile Creation
**Required Elements**:
- **Professional photos**: Headshot and action shots
- **Bio**: 150-word description highlighting expertise
- **Services**: Detailed experience offerings
- **Pricing**: Hourly rates and package options
- **Availability**: Calendar integration
- **Location**: Service areas within NYC

### Training & Resources
**Host Onboarding Kit**:
- **Platform tutorial**: How to use OnPurpose dashboard
- **Best practices**: Guest interaction guidelines
- **Safety protocols**: Emergency procedures, reporting
- **Marketing support**: Photo guidelines, bio optimization
- **Payment setup**: Stripe Connect integration

## 🎯 **Technical Implementation**

### Database Schema Updates
```sql
-- Host Applications Table
CREATE TABLE "HostApplications" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "Users"(id),
  category VARCHAR(100) NOT NULL,
  experience TEXT,
  portfolio TEXT,
  availability JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Host Profiles Table (Enhanced)
ALTER TABLE "Hosts" ADD COLUMN bio TEXT;
ALTER TABLE "Hosts" ADD COLUMN "profilePhoto" VARCHAR(255);
ALTER TABLE "Hosts" ADD COLUMN "portfolioImages" TEXT[];
ALTER TABLE "Hosts" ADD COLUMN availability JSONB;
ALTER TABLE "Hosts" ADD COLUMN "verificationStatus" VARCHAR(50) DEFAULT 'pending';
```

### API Endpoints
- `POST /api/host/apply` - Submit host application
- `GET /api/admin/applications` - Review pending applications
- `PUT /api/admin/applications/:id/approve` - Approve host
- `PUT /api/admin/applications/:id/reject` - Reject host
- `GET /api/hosts/profile/:id` - Get host profile

**Implementation timeline: 1 week for onboarding system! 🚀**
