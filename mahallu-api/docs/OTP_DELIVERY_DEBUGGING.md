# 🔍 OTP Delivery Debugging Guide

## Problem: OTP Not Reaching Users via DXING

This guide addresses the specific issue where:
- ✅ OTP is generated successfully
- ✅ API returns 200 OK
- ✅ Code logs "DXING send completed"
- ❌ **DXING dashboard shows NO requests**

---

## 🎯 Root Cause Categories

### 1. **Silent Environment Failures**

**Symptom**: Request succeeds but goes nowhere

**Causes**:
- `NODE_ENV !== 'production'` → Code skips sending (line 214 in authController)
- Missing/invalid `DXING_API_KEY` or `DXING_INSTANCE_ID`
- Whitespace or newlines in `.env` values
- Wrong `.env` file loaded (check `.env.local`, `.env.production`)

**Diagnostic**:
```bash
# Check which env file is loaded
cd mahallu-api
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('API_KEY length:', process.env.DXING_API_KEY?.length); console.log('INSTANCE_ID:', process.env.DXING_INSTANCE_ID);"
```

---

### 2. **Wrong API Endpoint or Payload Format**

**Symptom**: HTTP 200 received, but DXING dashboard empty

**Causes**:
- Incorrect URL (API endpoint changed)
- Wrong HTTP method (POST vs GET)
- Payload structure mismatch
- Authentication in wrong place (body vs header)

**Current Implementation**:
```json
POST https://app.dxing.in/api/send/whatsapp
{
  "key": "your-api-key",
  "instance_id": "your-instance-id",
  "to": "919999999999",
  "type": "text",
  "message": "Your OTP..."
}
```

**Verification Checklist**:
- [ ] Check DXING official docs for correct endpoint
- [ ] Verify instance ID is correct (copy from dashboard)
- [ ] Confirm instance is ACTIVE (not paused/deleted)
- [ ] Check if DXING changed API version

---

### 3. **Response Validation Gap**

**Problem**: Code accepts any HTTP 200, even if DXING rejected it

**Current Issue** (authController.ts line 219-224):
```typescript
try {
  await sendWhatsAppMessage(normalizedPhone, message);
  console.info(`[OTP] DXING send completed for ${normalizedPhone}`);
} catch (err: any) {
  console.error(`[OTP] DXING send failed for ${normalizedPhone}:`, err?.response?.data || err?.message || err);
  throw err;
}
```

The `sendWhatsAppMessage` returns success if HTTP 200, but doesn't verify DXING's actual queue acceptance.

**Fix Applied** (dxingService.ts):
- Validates response structure
- Checks for DXING-specific `status` field
- Logs detailed diagnostics

---

### 4. **Network-Level Issues**

**Symptom**: Request doesn't leave the server

**Causes**:
- Corporate proxy intercepting requests
- Firewall blocking outbound HTTPS
- VPN routing issues
- DNS resolution returning wrong IP
- Axios not actually sending (rare)

**Diagnostic**:
```bash
# Test network connectivity
curl -X POST https://app.dxing.in/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}'

# Check DNS
nslookup app.dxing.in

# Test from Node
cd mahallu-api
npm install -g ts-node
ts-node scripts/test-dxing.ts 919999999999
```

---

### 5. **DXING Account Issues**

**Possible Account-Level Blocks**:
- Instance is paused or deleted
- Account suspended (payment/TOS violation)
- Rate limits exceeded (not logged in dashboard)
- Sandbox mode restrictions
- IP whitelist configured (server IP not added)
- Phone number format not supported

**Verification**:
1. Log into https://app.dxing.in
2. Check instance status (should be "Active")
3. Check account balance/subscription
4. Review rate limits and quotas
5. Check if IP whitelist is enabled

---

## 🛠️ Step-by-Step Diagnostic Protocol

### Phase 1: Enable Full Logging

**1. Set diagnostic flag**:
```env
# In .env or as environment variable
DXING_DIAG=1
```

**2. Restart server**:
```bash
cd mahallu-api
npm start
```

**3. Trigger OTP send and observe logs**:
- Look for `[DXING-INTERCEPTOR]` lines
- Check actual HTTP status and response body
- Verify payload structure

### Phase 2: Run Standalone Test

**Run diagnostic script**:
```bash
cd mahallu-api
npx ts-node scripts/test-dxing.ts 919567374733
```

**Expected Output**:
```
📋 Step 1: Environment Variables
✓ DXING_API_KEY exists: true
✓ DXING_INSTANCE_ID exists: true

🌐 Step 3: DNS & Network Test
✓ DNS resolution successful
✓ HTTPS connection successful

🚀 Step 4: Sending Test Request
📥 Response Received:
HTTP Status: 200 OK
Response Body: { "status": 200, "message": "Message queued", "id": "..." }

✅ SUCCESS: DXING confirmed message queued
```

**Red Flags**:
- Response body is empty
- Response is not JSON
- Response missing `status` field
- HTTP 401 (bad credentials)
- HTTP 404 (wrong endpoint)

### Phase 3: Compare with DXING Dashboard

**1. Open DXING dashboard**: https://app.dxing.in/messages

**2. Check for test message**:
- Timestamp should match
- Phone number should match
- Status should show "Sent" or "Delivered"

**3. If message appears**:
- ✅ Configuration is correct
- Issue is in application logic (environment check, conditional sending)

**4. If message does NOT appear**:
- ❌ Credentials are wrong OR endpoint is wrong
- Check instance ID carefully
- Verify API key is active

### Phase 4: Verify Payload Format

**Check DXING documentation** for correct format. Common variations:

**Option A** (current implementation):
```json
{
  "key": "api-key",
  "instance_id": "instance-id",
  "to": "919999999999",
  "type": "text",
  "message": "Hello"
}
```

**Option B** (some providers use headers):
```bash
POST /api/send/whatsapp
Authorization: Bearer {api-key}
{
  "instance_id": "instance-id",
  "to": "919999999999",
  "message": "Hello"
}
```

**Option C** (some providers use different field names):
```json
{
  "api_key": "api-key",
  "instanceId": "instance-id",
  "number": "919999999999",
  "text": "Hello"
}
```

---

## 🏗️ Production-Grade OTP System Design

Now that you have diagnostics in place, here's a robust OTP system:

### Architecture Overview

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ POST /auth/send-otp
       ▼
┌──────────────────────────┐
│  Rate Limit Middleware   │ ← 1 req/min per phone
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Phone Normalization     │ ← Consistent format
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  User Validation         │ ← Check if exists/active
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  OTP Generation          │ ← 6-digit random
│  + Database Storage      │ ← TTL, attempts, single-use
└──────────┬───────────────┘
           │
           ├─── Production ─→ DXING Service ─→ WhatsApp
           │
           └─── Dev ────────→ Return in API response
```

### Database Schema

```typescript
// OTP Model (already implemented correctly)
{
  phone: string;        // Normalized (e.g., "919999999999")
  code: string;         // 6-digit OTP
  expiresAt: Date;      // TTL for auto-deletion
  isUsed: boolean;      // Single-use enforcement
  attempts: number;     // Brute-force protection (max 5)
  createdAt: Date;      // Auto timestamp
}

// Indexes
phone + isUsed + expiresAt  // Fast lookup for verification
expiresAt (TTL)             // Auto-cleanup
```

### API Endpoints

#### 1. **Send OTP**

```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "9999999999"
}
```

**Response** (Production):
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response** (Development):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

**Error Responses**:
```json
// User not found
{ "success": false, "message": "User not found with this phone number" }

// Too many requests
{ "success": false, "message": "Please wait before requesting another OTP" }

// Account inactive
{ "success": false, "message": "Account is inactive" }
```

#### 2. **Verify OTP**

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "9999999999",
  "otp": "123456"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "user": { ...userDetails },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:
```json
// Invalid OTP
{ "success": false, "message": "Invalid or expired OTP" }

// Too many attempts
{ "success": false, "message": "Too many failed attempts. Please request a new OTP" }
```

### Security Best Practices

**✅ Implemented**:
- Database-backed OTP (no in-memory storage)
- TTL-based expiry (10 minutes)
- Single-use enforcement
- Attempt counting (max 5)
- Rate limiting (1 OTP per minute per phone)
- JWT only after successful verification
- Phone normalization
- Previous OTP invalidation

**🔒 Additional Recommendations**:
1. **Add IP-based rate limiting**: Prevent mass OTP generation
2. **Log authentication attempts**: Monitor for brute-force attacks
3. **Add CAPTCHA for web clients**: Prevent automated abuse
4. **Device fingerprinting**: Detect suspicious patterns
5. **Exponential backoff**: Increase delay after failed attempts
6. **Delivery status webhook**: Confirm message actually reached user

### Enhanced Error Handling

```typescript
// In authController.ts
if (!isDevelopment) {
  console.info(`[OTP] Sending via DXING to ${normalizedPhone}`);
  try {
    const result = await sendWhatsAppMessage(normalizedPhone, message);
    
    // Validate DXING confirmed the send
    if (!result || !result.status || (result.status !== 200 && result.status !== true)) {
      throw new Error('DXING did not confirm message delivery');
    }
    
    console.info(`[OTP] DXING confirmed delivery to ${normalizedPhone}`, { messageId: result.id });
  } catch (err: any) {
    console.error(`[OTP] DXING send failed for ${normalizedPhone}:`, {
      error: err?.message,
      response: err?.response?.data,
      code: err?.code,
    });
    
    // Mark OTP as failed delivery (optional: delete it)
    await OTP.deleteOne({ _id: otp._id });
    
    // Return user-friendly error
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again or contact support.',
    });
  }
}
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

1. **OTP Generation Rate**: Requests per minute
2. **OTP Verification Success Rate**: % of OTPs successfully verified
3. **DXING Delivery Success Rate**: % of requests confirmed by DXING
4. **Average Delivery Time**: Time from send to receipt
5. **Failed Attempts Per User**: Detect brute-force attacks
6. **Expired OTPs**: Users not completing flow

### Logging Best Practices

```typescript
// Structured logging
console.info('[OTP_SEND]', {
  action: 'send_otp',
  phone: normalizedPhone,
  userId: user._id,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  success: true,
});

console.info('[OTP_VERIFY]', {
  action: 'verify_otp',
  phone: normalizedPhone,
  userId: user._id,
  attempts: otpRecord.attempts,
  success: true,
  timestamp: new Date().toISOString(),
});

console.error('[OTP_ERROR]', {
  action: 'send_otp_failed',
  phone: normalizedPhone,
  error: error.message,
  errorCode: error.code,
  dxingStatus: error.response?.status,
  timestamp: new Date().toISOString(),
});
```

---

## 🚀 Quick Fixes Checklist

Before diving deep, try these quick fixes:

- [ ] Verify `NODE_ENV=production` in production
- [ ] Check `.env` file exists and is loaded correctly
- [ ] Trim whitespace from `DXING_API_KEY` and `DXING_INSTANCE_ID`
- [ ] Confirm instance is active in DXING dashboard
- [ ] Test with curl or Postman directly to DXING API
- [ ] Check server can reach external HTTPS endpoints
- [ ] Review DXING account status (billing, limits)
- [ ] Enable `DXING_DIAG=1` for detailed logs
- [ ] Run `scripts/test-dxing.ts` diagnostic script

---

## 📞 Support Escalation

If diagnostics don't reveal the issue:

1. **Gather Evidence**:
   - Full terminal logs with `DXING_DIAG=1`
   - Output of `scripts/test-dxing.ts`
   - Screenshot of DXING dashboard (no messages)
   - Your DXING instance ID

2. **Contact DXING Support**:
   - Email: support@dxing.in
   - Include: API key (last 4 chars), instance ID, timestamp of test
   - Ask: "Why are requests not appearing in dashboard despite HTTP 200?"

3. **Alternative Providers**:
   - Twilio WhatsApp API
   - Gupshup
   - MSG91
   - WATI

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Server logs show `[DXING-INTERCEPTOR] 📤 HTTP Request initiated`
2. ✅ Server logs show `[DXING-INTERCEPTOR] 📥 HTTP Response received`
3. ✅ Response includes `{"status": 200, "message": "Message queued"}`
4. ✅ **DXING dashboard shows the message in history**
5. ✅ User receives WhatsApp message with OTP
6. ✅ Verification completes and JWT is issued

---

**Last Updated**: 2025-12-15
**Maintainer**: Development Team


