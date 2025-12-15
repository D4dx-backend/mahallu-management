# 📱 DXING WhatsApp API Specification

## Overview

DXING is a WhatsApp Business API provider used for sending OTPs and notifications.

**Official Website**: https://app.dxing.in  
**Current Endpoint**: `https://app.dxing.in/api/send/whatsapp`

---

## 🔑 Authentication

DXING uses **API Key authentication** passed in the request body (not headers).

### Required Credentials

| Parameter | Source | Format | Example |
|-----------|--------|--------|---------|
| `key` | API Key from dashboard | String (typically 32+ chars) | `abc123def456...` |
| `instance_id` | Instance ID from dashboard | String/Number | `12345` or `inst_abc123` |

### Where to Find

1. Log into https://app.dxing.in
2. Navigate to **Settings** or **API** section
3. Copy your **API Key** and **Instance ID**
4. Verify instance status is **Active**

---

## 📤 Send WhatsApp Message

### Endpoint

```
POST https://app.dxing.in/api/send/whatsapp
Content-Type: application/json
```

### Request Payload

```json
{
  "key": "your-api-key-here",
  "instance_id": "your-instance-id",
  "to": "919999999999",
  "type": "text",
  "message": "Your OTP is 123456"
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | ✅ Yes | API authentication key |
| `instance_id` | string | ✅ Yes | WhatsApp instance identifier |
| `to` | string | ✅ Yes | Recipient phone in international format (no + prefix) |
| `type` | string | ✅ Yes | Message type: `text`, `media`, `template` |
| `message` | string | ✅ Yes | Message content (for type=text) |

### Phone Number Format

**Required Format**: `{country_code}{number}` (no spaces, no + prefix)

Examples:
- ✅ Correct: `919999999999` (India)
- ✅ Correct: `14155552671` (USA)
- ❌ Wrong: `+919999999999` (has + prefix)
- ❌ Wrong: `91 9999999999` (has space)
- ❌ Wrong: `9999999999` (missing country code)

### Expected Response

#### Success Response

```json
{
  "status": 200,
  "message": "Message sent successfully",
  "id": "msg_abc123xyz",
  "timestamp": "2025-12-15T10:30:00Z"
}
```

**OR** (variant):

```json
{
  "status": true,
  "message": "Message queued",
  "message_id": "12345"
}
```

#### Error Responses

**Invalid API Key** (401):
```json
{
  "status": 401,
  "message": "Invalid API key"
}
```

**Invalid Instance** (404):
```json
{
  "status": 404,
  "message": "Instance not found or inactive"
}
```

**Rate Limit Exceeded** (429):
```json
{
  "status": 429,
  "message": "Rate limit exceeded. Please try again later."
}
```

**Server Error** (500):
```json
{
  "status": 500,
  "message": "Internal server error"
}
```

---

## 🔍 Provider-Specific Validation

### Critical Checks Before Going Live

#### 1. **Instance Status**
- [ ] Instance is **Active** in dashboard
- [ ] Instance is not **Paused** or **Deleted**
- [ ] WhatsApp Business Account is connected
- [ ] Phone number is verified

#### 2. **Account Status**
- [ ] Account has active subscription
- [ ] Payment method is valid
- [ ] No outstanding balance
- [ ] Account is not suspended

#### 3. **Configuration**
- [ ] Correct instance ID (no typos)
- [ ] API key is not expired
- [ ] API key has send permissions
- [ ] No IP whitelist restrictions (or server IP is whitelisted)

#### 4. **Delivery Settings**
- [ ] Check if sandbox mode is disabled
- [ ] Verify webhook URL (if configured)
- [ ] Check message templates approval status
- [ ] Review daily/hourly rate limits

### Common Silent Failure Scenarios

| Scenario | Symptom | Root Cause |
|----------|---------|------------|
| **HTTP 200 but no delivery** | Request succeeds, dashboard empty | Wrong instance ID or instance paused |
| **Immediate success** | No network delay | Not actually calling DXING API (local mock) |
| **Empty response body** | Response is null/undefined | Wrong endpoint URL |
| **Non-JSON response** | HTML returned instead of JSON | Hitting a different server (proxy/CDN) |

---

## 🛠️ Testing Checklist

### Pre-Production Testing

```bash
# 1. Test DNS resolution
nslookup app.dxing.in

# 2. Test HTTPS connectivity
curl -I https://app.dxing.in

# 3. Test API endpoint
curl -X POST https://app.dxing.in/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "key": "YOUR_API_KEY",
    "instance_id": "YOUR_INSTANCE_ID",
    "to": "919999999999",
    "type": "text",
    "message": "Test message"
  }'

# 4. Run diagnostic script
cd mahallu-api
npx ts-node scripts/test-dxing.ts 919999999999
```

### Validation Criteria

✅ **Success Indicators**:
1. HTTP Status 200
2. Response body is valid JSON object
3. Response contains `status: 200` or `status: true`
4. Response includes message ID
5. **Dashboard shows message in history** ← Most important!
6. User receives message (within 5-30 seconds)

❌ **Failure Indicators**:
1. HTTP status other than 200
2. Empty or non-JSON response
3. Response `status` field is not 200/true
4. Dashboard shows no request
5. User does not receive message

---

## 📊 Alternative WhatsApp Providers Comparison

If DXING doesn't work, consider these alternatives:

### Provider Comparison Table

| Provider | API Complexity | Pricing | Reliability | Support | Dashboard |
|----------|---------------|---------|-------------|---------|-----------|
| **DXING** | Simple | Low | Medium | Email | Good |
| **Twilio** | Medium | High | Excellent | 24/7 | Excellent |
| **Gupshup** | Medium | Medium | Good | Business hrs | Good |
| **MSG91** | Simple | Low | Good | Email/Chat | Good |
| **WATI** | Simple | Medium | Good | Chat | Excellent |
| **Interakt** | Simple | Medium | Good | Chat | Good |

### DXING Specifics

**Pros**:
- ✅ Simple API structure
- ✅ Affordable pricing
- ✅ Indian market focused
- ✅ Quick setup

**Cons**:
- ❌ Limited documentation
- ❌ Email-only support
- ❌ Occasional downtime
- ❌ No official SDK

---

## 🐛 Known Issues & Workarounds

### Issue 1: Dashboard Not Showing Requests

**Symptoms**:
- API returns 200 OK
- No error logged
- Dashboard history is empty

**Possible Causes**:
1. **Wrong Instance ID**: Copy-paste error
2. **Instance Paused**: Manual pause or auto-pause due to payment
3. **Wrong Environment**: Using test credentials in production

**Workaround**:
```typescript
// Add strict response validation
if (!response.data?.status || response.data.status !== 200) {
  throw new Error('DXING did not confirm delivery');
}
```

### Issue 2: Messages Delayed or Not Delivered

**Symptoms**:
- Dashboard shows "Sent"
- User doesn't receive message
- Delivery time > 5 minutes

**Possible Causes**:
1. WhatsApp number not registered
2. User blocked the business number
3. WhatsApp rate limiting
4. Network issues on recipient side

**Workaround**:
- Implement delivery status webhook
- Add fallback SMS provider
- Show clear instructions to user

### Issue 3: Rate Limiting

**Symptoms**:
- First few messages work
- Subsequent messages fail
- HTTP 429 Too Many Requests

**Possible Causes**:
1. Exceeded hourly limit
2. Exceeded daily limit
3. Too many messages to same number

**Workaround**:
```typescript
// Implement exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (let i = 0; i < 3; i++) {
  try {
    return await sendWhatsAppMessage(phone, message);
  } catch (err) {
    if (err.response?.status === 429) {
      await delay(Math.pow(2, i) * 1000); // 1s, 2s, 4s
      continue;
    }
    throw err;
  }
}
```

---

## 🔐 Security Best Practices

### Credential Management

```bash
# .env file (never commit to git)
DXING_API_KEY=your-actual-api-key-here
DXING_INSTANCE_ID=your-instance-id

# Add to .gitignore
.env
.env.local
.env.production
```

### Validation

```typescript
// Validate before using
const validateDxingConfig = () => {
  const apiKey = process.env.DXING_API_KEY?.trim();
  const instanceId = process.env.DXING_INSTANCE_ID?.trim();
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Invalid DXING_API_KEY');
  }
  
  if (!instanceId || instanceId.length < 3) {
    throw new Error('Invalid DXING_INSTANCE_ID');
  }
  
  return { apiKey, instanceId };
};
```

### Logging

```typescript
// NEVER log full API key
console.log('API Key:', apiKey.slice(0, 4) + '***' + apiKey.slice(-4));

// NEVER log user phone numbers in production
const maskedPhone = phone.slice(0, 4) + '***' + phone.slice(-3);
console.log('Sending to:', maskedPhone);
```

---

## 📞 DXING Support Contact

**Email**: support@dxing.in  
**Website**: https://app.dxing.in  
**Documentation**: Check dashboard for API docs link  

**When Contacting Support, Include**:
1. Your instance ID (e.g., "Instance: 12345")
2. Timestamp of failed request (ISO format)
3. Recipient phone number (with consent)
4. Error message or response received
5. Screenshot of dashboard (if relevant)

---

## ✅ Integration Checklist

Before deploying to production:

- [ ] API credentials verified in dashboard
- [ ] Instance status is "Active"
- [ ] Test message sent successfully via curl/Postman
- [ ] Test message appears in DXING dashboard
- [ ] Test message received on actual WhatsApp
- [ ] Diagnostic script passes all checks
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Logging configured (no sensitive data)
- [ ] Fallback mechanism in place
- [ ] Monitoring/alerting set up
- [ ] Environment variables secured
- [ ] Code reviewed and tested

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-15  
**Maintained By**: Development Team


