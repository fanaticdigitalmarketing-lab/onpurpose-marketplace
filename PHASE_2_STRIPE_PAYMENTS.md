# 💳 Phase 2: Live Stripe Payment Processing

## 📋 **Step 6: Payment System Implementation**

### Stripe Connect Integration
**Multi-Party Payments**:
- **Platform account**: OnPurpose main Stripe account
- **Connected accounts**: Individual host Stripe accounts
- **Payment flow**: Guest → Platform → Host (minus 20% fee)
- **Instant payouts**: Hosts receive payment within 24 hours

### Payment Processing Flow
1. **Guest books experience**: Selects host and time slot
2. **Payment authorization**: Stripe pre-authorizes card
3. **Experience completion**: Host marks as completed
4. **Payment capture**: Funds transferred to host
5. **Platform fee**: 20% retained by OnPurpose
6. **Payout**: Host receives 80% of booking amount

### Database Schema
```sql
-- Payment transactions
CREATE TABLE "Payments" (
  id SERIAL PRIMARY KEY,
  "bookingId" INTEGER REFERENCES "Bookings"(id),
  "stripePaymentIntentId" VARCHAR(255),
  "stripeTransferId" VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  "platformFee" DECIMAL(10,2),
  "hostPayout" DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  "processedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Host Stripe accounts
ALTER TABLE "Hosts" ADD COLUMN "stripeAccountId" VARCHAR(255);
ALTER TABLE "Hosts" ADD COLUMN "stripeOnboardingComplete" BOOLEAN DEFAULT false;
ALTER TABLE "Hosts" ADD COLUMN "payoutEnabled" BOOLEAN DEFAULT false;
```

### Stripe Connect Onboarding
**Host Account Setup**:
- **Express accounts**: Simplified onboarding for hosts
- **KYC verification**: Identity and bank account verification
- **Tax information**: W-9/W-8 forms collection
- **Payout schedule**: Daily automatic payouts

### Payment API Endpoints
```javascript
// Payment processing
POST /api/payments/create-intent        // Create payment intent
POST /api/payments/confirm             // Confirm payment
POST /api/payments/capture             // Capture authorized payment
POST /api/payments/refund              // Process refund

// Stripe Connect
POST /api/hosts/stripe/onboard         // Start host onboarding
GET  /api/hosts/stripe/status          // Check onboarding status
POST /api/hosts/stripe/refresh         // Refresh account link
GET  /api/hosts/earnings               // Host earnings dashboard
```

### Frontend Components
**Payment Form**:
- **Stripe Elements**: Secure card input
- **Payment methods**: Credit/debit cards, Apple Pay, Google Pay
- **Booking summary**: Experience details, pricing breakdown
- **Terms acceptance**: Payment and cancellation policies

**Host Earnings Dashboard**:
- **Total earnings**: Lifetime and monthly totals
- **Pending payouts**: Upcoming transfers
- **Transaction history**: Detailed payment records
- **Tax documents**: 1099 forms and statements

### Security & Compliance
- **PCI compliance**: Stripe handles all card data
- **3D Secure**: Authentication for international cards
- **Fraud detection**: Stripe Radar integration
- **Dispute handling**: Chargeback management

**Implementation: 1 week for live payment processing! 💳**
