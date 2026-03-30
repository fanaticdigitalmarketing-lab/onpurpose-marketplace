# 🔗 OnPurpose Webhook Endpoints

## **Live Production Webhook URLs**

**Base URL**: `https://onpurpose-production-a60a.up.railway.app`

### **Available Webhook Endpoints:**

**1. Generic Webhook**
- **URL**: `https://onpurpose-production-a60a.up.railway.app/webhook`
- **Method**: POST
- **Purpose**: General-purpose webhook for any external service
- **Response**: JSON with status and timestamp

**2. Stripe Webhook**
- **URL**: `https://onpurpose-production-a60a.up.railway.app/webhook/stripe`
- **Method**: POST
- **Purpose**: Stripe payment events (payment_intent.succeeded, etc.)
- **Headers**: Includes Stripe-Signature verification
- **Response**: JSON confirmation

**3. SendGrid Webhook**
- **URL**: `https://onpurpose-production-a60a.up.railway.app/webhook/sendgrid`
- **Method**: POST
- **Purpose**: Email delivery events (delivered, bounced, opened, etc.)
- **Response**: JSON confirmation

**4. API Webhook**
- **URL**: `https://onpurpose-production-a60a.up.railway.app/api/webhook`
- **Method**: POST
- **Purpose**: API testing and custom integrations
- **Features**: Logs body and query parameters
- **Response**: JSON with received data

### **Webhook Features:**
- **JSON Parsing**: Automatic JSON body parsing
- **Raw Data Support**: Handles raw application/json
- **Logging**: All webhooks logged to Railway console
- **Timestamps**: ISO timestamps on all responses
- **Status Codes**: Proper HTTP status responses (200 OK)

### **Testing Webhooks:**
```bash
# Test generic webhook
curl -X POST https://onpurpose-production-a60a.up.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test API webhook
curl -X POST https://onpurpose-production-a60a.up.railway.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"key": "value"}}'
```

### **Integration Setup:**
- **Stripe**: Use `/webhook/stripe` in Stripe Dashboard
- **SendGrid**: Use `/webhook/sendgrid` in SendGrid Event Webhook settings
- **Custom Services**: Use `/webhook` or `/api/webhook`

**All webhook endpoints are live and ready for external integrations.**
