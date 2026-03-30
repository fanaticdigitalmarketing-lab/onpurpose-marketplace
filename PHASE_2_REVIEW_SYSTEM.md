# ⭐ Phase 2: Review & Rating System

## 📋 **Step 7: Review & Rating Implementation**

### Review System Design
**Rating Categories**:
- **Overall Experience**: 1-5 stars
- **Host Knowledge**: Expertise and insights
- **Communication**: Responsiveness and clarity
- **Value**: Worth the price paid
- **Authenticity**: Genuine local experience

### Review Process Flow
1. **Experience completion**: Host marks booking as completed
2. **Review prompt**: Guest receives email/SMS invitation
3. **Review submission**: Guest rates and writes review
4. **Host response**: Optional response to guest review
5. **Public display**: Reviews appear on host profile
6. **Aggregate scoring**: Overall rating calculation

### Database Schema
```sql
-- Reviews table
CREATE TABLE "Reviews" (
  id SERIAL PRIMARY KEY,
  "bookingId" INTEGER REFERENCES "Bookings"(id),
  "guestId" INTEGER REFERENCES "Users"(id),
  "hostId" INTEGER REFERENCES "Hosts"(id),
  "overallRating" INTEGER CHECK ("overallRating" >= 1 AND "overallRating" <= 5),
  "knowledgeRating" INTEGER CHECK ("knowledgeRating" >= 1 AND "knowledgeRating" <= 5),
  "communicationRating" INTEGER CHECK ("communicationRating" >= 1 AND "communicationRating" <= 5),
  "valueRating" INTEGER CHECK ("valueRating" >= 1 AND "valueRating" <= 5),
  "authenticityRating" INTEGER CHECK ("authenticityRating" >= 1 AND "authenticityRating" <= 5),
  "reviewText" TEXT,
  "hostResponse" TEXT,
  "isPublic" BOOLEAN DEFAULT true,
  "isVerified" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "respondedAt" TIMESTAMP
);

-- Host rating aggregates
ALTER TABLE "Hosts" ADD COLUMN "averageRating" DECIMAL(3,2) DEFAULT 0;
ALTER TABLE "Hosts" ADD COLUMN "totalReviews" INTEGER DEFAULT 0;
ALTER TABLE "Hosts" ADD COLUMN "responseRate" DECIMAL(5,2) DEFAULT 0;
```

### Review API Endpoints
```javascript
// Review management
POST /api/reviews                      // Submit review
GET  /api/reviews/host/:hostId         // Host reviews
GET  /api/reviews/user/:userId         // User reviews
PUT  /api/reviews/:id/respond          // Host response
GET  /api/reviews/booking/:bookingId   // Booking review

// Rating aggregation
GET  /api/hosts/:id/ratings            // Host rating breakdown
PUT  /api/hosts/:id/update-ratings     // Recalculate ratings
```

### Review Quality Controls
**Verification System**:
- **Verified bookings only**: Must complete experience to review
- **One review per booking**: Prevents duplicate reviews
- **Moderation queue**: Flagged reviews for manual review
- **Spam detection**: Automated filtering of fake reviews

**Review Guidelines**:
- **Constructive feedback**: Encourage helpful, specific comments
- **Respectful language**: No personal attacks or inappropriate content
- **Authentic experiences**: Based on actual interactions
- **Balanced perspective**: Both positive and constructive feedback

### Frontend Components
**Review Form**:
- **Star ratings**: Interactive 5-star system for each category
- **Text review**: Rich text editor for detailed feedback
- **Photo upload**: Optional experience photos
- **Anonymous option**: Option to hide guest name

**Review Display**:
- **Rating summary**: Average scores with breakdown
- **Review list**: Paginated reviews with filters
- **Host responses**: Highlighted responses from hosts
- **Helpful votes**: Community voting on review quality

### Email Notifications
**Review Requests**:
- **24-hour delay**: Send review request day after experience
- **Reminder emails**: Follow-up if no review submitted
- **Host notifications**: Alert when new review received
- **Response reminders**: Encourage host responses

**Implementation: 1 week for complete review system! ⭐**
