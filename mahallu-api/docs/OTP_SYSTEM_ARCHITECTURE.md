# 🏗️ Production-Grade OTP Authentication System

## Overview

This document describes the complete architecture for a secure, scalable OTP-based authentication system using Node.js, Express, MongoDB, and WhatsApp delivery via DXING.

---

## 🎯 System Requirements

### Functional Requirements

1. **OTP Generation**: Generate cryptographically random 6-digit OTPs
2. **Storage**: Persist OTPs in database with expiry
3. **Delivery**: Send via WhatsApp with delivery confirmation
4. **Verification**: Validate OTP with brute-force protection
5. **Rate Limiting**: Prevent abuse and spam
6. **Security**: Single-use, time-bound, attempt-limited

### Non-Functional Requirements

1. **Performance**: OTP delivery < 5 seconds
2. **Availability**: 99.9% uptime
3. **Security**: Prevent brute-force, timing attacks, replay attacks
4. **Scalability**: Handle 1000+ OTP requests/minute
5. **Observability**: Comprehensive logging and monitoring

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                       │
│                    (React/Mobile/Web Frontend)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
        ┌──────────────────────────────────────┐
        │        API GATEWAY / Load Balancer    │
        │         (Rate Limiting Layer)         │
        └──────────────────┬───────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AUTHENTICATION ROUTER                      │    │
│  │  • POST /auth/send-otp                                  │    │
│  │  • POST /auth/verify-otp                                │    │
│  │  • POST /auth/refresh-token                             │    │
│  └───────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           MIDDLEWARE CHAIN                               │   │
│  │  1. Request Validator (express-validator)               │   │
│  │  2. Rate Limiter (per phone/IP)                         │   │
│  │  3. Sanitizer (XSS, injection prevention)               │   │
│  │  4. Authentication (JWT for protected routes)           │   │
│  └─────────────────────┬───────────────────────────────────┘   │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           AUTHENTICATION CONTROLLER                       │  │
│  │                                                           │  │
│  │  sendOTP():                                              │  │
│  │    1. Validate phone number                              │  │
│  │    2. Check user exists & active                         │  │
│  │    3. Check rate limit (1/min)                           │  │
│  │    4. Generate OTP                                       │  │
│  │    5. Invalidate old OTPs                                │  │
│  │    6. Save to database                                   │  │
│  │    7. Send via DXING                                     │  │
│  │    8. Return success                                     │  │
│  │                                                           │  │
│  │  verifyOTP():                                            │  │
│  │    1. Validate phone & OTP                               │  │
│  │    2. Find valid OTP record                              │  │
│  │    3. Check expiry & usage                               │  │
│  │    4. Check attempt count                                │  │
│  │    5. Verify code matches                                │  │
│  │    6. Mark as used                                       │  │
│  │    7. Generate JWT                                       │  │
│  │    8. Update last login                                  │  │
│  │    9. Return user + token                                │  │
│  └─────────────────────┬────────────────────────────────────┘  │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌─────────┐   ┌──────────────┐   ┌─────────────┐
   │ MongoDB │   │ DXING Service │   │ User Service│
   │         │   │  (WhatsApp)   │   │             │
   │ • Users │   │               │   │ • Lookup    │
   │ • OTPs  │   │ • Send Msg    │   │ • Validate  │
   │ • Logs  │   │ • Retry       │   │ • Update    │
   └─────────┘   └──────────────┘   └─────────────┘
```

---

## 🗄️ Database Schema

### OTP Collection

```typescript
{
  _id: ObjectId,
  phone: String,           // Normalized: "919999999999"
  code: String,            // 6-digit OTP
  expiresAt: Date,         // TTL expiry (10 minutes)
  isUsed: Boolean,         // Single-use flag
  attempts: Number,        // Verification attempt count
  createdAt: Date,         // Auto timestamp
  updatedAt: Date,         // Auto timestamp
}

// Indexes
phone + isUsed + expiresAt  // Composite for fast verification lookup
expiresAt (TTL index)       // Auto-delete expired documents
```

**Schema Definition** (already implemented):

```typescript
// models/OTP.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Composite index for verification query
OTPSchema.index({ phone: 1, isUsed: 1, expiresAt: 1 });

export default mongoose.model<IOTP>('OTP', OTPSchema);
```

### User Collection

```typescript
{
  _id: ObjectId,
  phone: String,           // Local format: "9999999999"
  name: String,
  role: String,            // "admin", "member", etc.
  status: String,          // "active", "inactive"
  lastLogin: Date,
  memberId: ObjectId,      // Reference to Member
  tenantId: ObjectId,      // Multi-tenancy
  createdAt: Date,
  updatedAt: Date,
}

// Indexes
phone (unique)
status
tenantId + phone
```

---

## 🔄 API Flow Diagrams

### Send OTP Flow

```
Client                Server              Database           DXING API
  │                     │                     │                  │
  │  POST /send-otp     │                     │                  │
  │  {phone}            │                     │                  │
  ├────────────────────>│                     │                  │
  │                     │                     │                  │
  │                     │ Validate phone      │                  │
  │                     │ Normalize format    │                  │
  │                     │                     │                  │
  │                     │ Find user           │                  │
  │                     ├────────────────────>│                  │
  │                     │<────────────────────┤                  │
  │                     │ User found          │                  │
  │                     │                     │                  │
  │                     │ Check rate limit    │                  │
  │                     ├────────────────────>│                  │
  │                     │<────────────────────┤                  │
  │                     │ No recent OTP       │                  │
  │                     │                     │                  │
  │                     │ Generate OTP code   │                  │
  │                     │ (123456)            │                  │
  │                     │                     │                  │
  │                     │ Invalidate old OTPs │                  │
  │                     ├────────────────────>│                  │
  │                     │<────────────────────┤                  │
  │                     │                     │                  │
  │                     │ Save new OTP        │                  │
  │                     ├────────────────────>│                  │
  │                     │<────────────────────┤                  │
  │                     │ Saved               │                  │
  │                     │                     │                  │
  │                     │ Send WhatsApp msg   │                  │
  │                     ├─────────────────────────────────────>│
  │                     │                     │                  │
  │                     │                     │    HTTP Request  │
  │                     │                     │    Processing... │
  │                     │                     │                  │
  │                     │<─────────────────────────────────────┤
  │                     │ {status: 200, id: "msg_123"}         │
  │                     │                     │                  │
  │                     │ Validate response   │                  │
  │                     │ Confirm delivery    │                  │
  │                     │                     │                  │
  │  {success: true}    │                     │                  │
  │<────────────────────┤                     │                  │
  │                     │                     │                  │
  │                     │                     │                  │
  │                                           │            WhatsApp
  │                                           │             User
  │                                           │              │
  │                                           │     OTP: 123456
  │                                           │<─────────────┤
```

### Verify OTP Flow

```
Client                Server              Database
  │                     │                     │
  │  POST /verify-otp   │                     │
  │  {phone, otp}       │                     │
  ├────────────────────>│                     │
  │                     │                     │
  │                     │ Validate input      │
  │                     │ Normalize phone     │
  │                     │                     │
  │                     │ Find valid OTP      │
  │                     │ (not used,          │
  │                     │  not expired)       │
  │                     ├────────────────────>│
  │                     │<────────────────────┤
  │                     │ OTP record found    │
  │                     │                     │
  │                     │ Check attempts < 5  │
  │                     │ ✓ Valid             │
  │                     │                     │
  │                     │ Compare OTP code    │
  │                     │ ✓ Match             │
  │                     │                     │
  │                     │ Mark as used        │
  │                     ├────────────────────>│
  │                     │<────────────────────┤
  │                     │                     │
  │                     │ Find user           │
  │                     ├────────────────────>│
  │                     │<────────────────────┤
  │                     │                     │
  │                     │ Update lastLogin    │
  │                     ├────────────────────>│
  │                     │<────────────────────┤
  │                     │                     │
  │                     │ Generate JWT        │
  │                     │ {userId, role}      │
  │                     │ Expires: 7 days     │
  │                     │                     │
  │  {success: true,    │                     │
  │   user: {...},      │                     │
  │   token: "eyJ..."}  │                     │
  │<────────────────────┤                     │
```

---

## 🔐 Security Implementation

### 1. OTP Generation

```typescript
// Cryptographically secure random OTP
import crypto from 'crypto';

function generateSecureOTP(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  // Use crypto for better randomness
  const buffer = crypto.randomBytes(4);
  const randomNum = buffer.readUInt32BE(0);
  const otp = (randomNum % (max - min + 1)) + min;
  
  return otp.toString();
}

// Current implementation (acceptable)
const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
```

### 2. Rate Limiting

**Current Implementation**:
```typescript
// Database-backed rate limiting (1 OTP per minute per phone)
const recentOTP = await OTP.findOne({
  phone: normalizedPhone,
  createdAt: { $gte: new Date(Date.now() - 60000) },
});

if (recentOTP) {
  return res.status(429).json({
    success: false,
    message: 'Please wait before requesting another OTP',
  });
}
```

**Enhanced Rate Limiting**:
```typescript
// IP-based rate limiting (prevent mass generation from single source)
import rateLimit from 'express-rate-limit';

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes per IP
  message: 'Too many OTP requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpRateLimiter, sendOTP);

// Phone-specific rate limiting (already implemented)
// Additional: Daily limit per phone
const dailyOTPs = await OTP.countDocuments({
  phone: normalizedPhone,
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
});

if (dailyOTPs >= 10) {
  return res.status(429).json({
    success: false,
    message: 'Daily OTP limit exceeded. Please try again tomorrow.',
  });
}
```

### 3. Brute-Force Protection

**Current Implementation**:
```typescript
// Verification already has attempt limiting
if (otpRecord.attempts >= 5) {
  return res.status(429).json({
    success: false,
    message: 'Too many failed attempts. Please request a new OTP',
  });
}

// Increment on wrong OTP
if (otpRecord.code !== otp) {
  otpRecord.attempts += 1;
  await otpRecord.save();
  // ...
}
```

**Enhanced Protection**:
```typescript
// Exponential backoff after failed attempts
const getVerificationDelay = (attempts: number): number => {
  if (attempts >= 3) {
    return Math.pow(2, attempts - 2) * 1000; // 1s, 2s, 4s, 8s...
  }
  return 0;
};

// In verify endpoint
if (otpRecord.attempts > 0) {
  const delay = getVerificationDelay(otpRecord.attempts);
  if (delay > 0) {
    const lastAttemptTime = otpRecord.updatedAt.getTime();
    const timeSinceLastAttempt = Date.now() - lastAttemptTime;
    
    if (timeSinceLastAttempt < delay) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil((delay - timeSinceLastAttempt) / 1000)} seconds before trying again`,
      });
    }
  }
}
```

### 4. Single-Use Enforcement

**Current Implementation**: ✅ Correct

```typescript
// Mark as used after successful verification
otpRecord.isUsed = true;
await otpRecord.save();

// Verification query explicitly checks isUsed
const otpRecord = await OTP.findOne({
  phone: normalizedPhone,
  isUsed: false,  // ← Ensures single use
  expiresAt: { $gt: new Date() },
}).sort({ createdAt: -1 });
```

### 5. Time-Based Expiry

**Current Implementation**: ✅ Correct

```typescript
// 10-minute TTL
const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

// MongoDB TTL index for automatic cleanup
expiresAt: {
  type: Date,
  required: true,
  index: { expireAfterSeconds: 0 },
}

// Query checks expiry
expiresAt: { $gt: new Date() }
```

### 6. Phone Number Normalization

**Current Implementation**: ✅ Correct

```typescript
// services/dxingService.ts
export const normalizeIndianPhone = (input: string): NormalizedPhone => {
  const digits = (input || '').replace(/\D/g, '');
  
  let local = digits;
  if (local.startsWith('91') && local.length === 12) {
    local = local.slice(2);
  }
  
  if (local.length !== 10) {
    throw new Error('Invalid Indian phone number. Provide a 10-digit number with optional +91.');
  }
  
  return {
    normalized: `91${local}`,  // For DXING
    local,                      // For database
  };
};
```

### 7. JWT Security

**Current Implementation**:
```typescript
// Only issue JWT after successful OTP verification
const token = jwt.sign(
  { userId: user._id, isSuperAdmin: user.isSuperAdmin },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Enhancements**:
```typescript
// Add token refresh mechanism
const generateTokenPair = (user: IUser) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }  // Short-lived access token
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }  // Long-lived refresh token
  );
  
  return { accessToken, refreshToken };
};

// Store refresh token in database or Redis
// Implement /auth/refresh endpoint
```

---

## 📈 Performance Optimization

### 1. Database Indexing

**Current Indexes** (already implemented):
```typescript
// Single field index
phone: { type: String, index: true }

// TTL index
expiresAt: { index: { expireAfterSeconds: 0 } }

// Composite index
OTPSchema.index({ phone: 1, isUsed: 1, expiresAt: 1 });
```

**Query Performance**:
```typescript
// Efficient verification query uses composite index
OTP.findOne({
  phone: normalizedPhone,     // Index scan starts here
  isUsed: false,              // Filtered by index
  expiresAt: { $gt: new Date() }, // Filtered by index
}).sort({ createdAt: -1 });   // In-memory sort (small result set)
```

### 2. Caching Strategy

```typescript
// Optional: Cache user lookups with Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getUserByPhone(phone: string) {
  // Check cache first
  const cached = await redis.get(`user:${phone}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const user = await User.findOne({ phone });
  
  // Cache for 5 minutes
  if (user) {
    await redis.setex(`user:${phone}`, 300, JSON.stringify(user));
  }
  
  return user;
}
```

### 3. Async Processing

```typescript
// Send WhatsApp message asynchronously (if acceptable)
import { Queue } from 'bull';
const otpQueue = new Queue('otp-delivery', process.env.REDIS_URL);

// In sendOTP controller
await otp.save();

// Queue the delivery (non-blocking)
await otpQueue.add({
  phone: normalizedPhone,
  message,
  otpId: otp._id,
});

// Respond immediately
res.json({ success: true, message: 'OTP will be sent shortly' });

// Worker process handles actual sending
otpQueue.process(async (job) => {
  const { phone, message, otpId } = job.data;
  
  try {
    await sendWhatsAppMessage(phone, message);
    await OTP.updateOne({ _id: otpId }, { deliveryStatus: 'sent' });
  } catch (err) {
    await OTP.updateOne({ _id: otpId }, { deliveryStatus: 'failed' });
    throw err; // Bull will retry
  }
});
```

---

## 📊 Monitoring & Observability

### 1. Structured Logging

```typescript
// Log format
interface OTPLogEvent {
  action: 'otp_send' | 'otp_verify' | 'otp_failed';
  phone: string;
  userId?: string;
  success: boolean;
  errorCode?: string;
  duration?: number;
  timestamp: string;
}

// Usage
console.info(JSON.stringify({
  action: 'otp_send',
  phone: normalizedPhone,
  userId: user._id,
  success: true,
  duration: Date.now() - startTime,
  timestamp: new Date().toISOString(),
}));
```

### 2. Key Metrics

```typescript
// Track these metrics (use Prometheus, StatsD, or custom)
- otp_generation_total (counter)
- otp_verification_total (counter)
- otp_delivery_success_rate (gauge)
- otp_verification_success_rate (gauge)
- otp_delivery_duration_seconds (histogram)
- otp_active_sessions (gauge)
- otp_rate_limit_hits (counter)
- otp_brute_force_attempts (counter)
```

### 3. Alerting Rules

```yaml
# Example alerting rules
- alert: OTP_DeliveryFailureHigh
  expr: rate(otp_delivery_failed_total[5m]) > 0.1
  annotations:
    summary: High OTP delivery failure rate

- alert: OTP_BruteForceDetected
  expr: rate(otp_brute_force_attempts[1m]) > 10
  annotations:
    summary: Possible brute-force attack on OTP verification

- alert: OTP_DeliveryLatencyHigh
  expr: histogram_quantile(0.95, otp_delivery_duration_seconds) > 10
  annotations:
    summary: OTP delivery taking longer than 10 seconds
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/otp.test.ts
describe('OTP Service', () => {
  test('generates 6-digit OTP', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });
  
  test('normalizes phone number correctly', () => {
    const result = normalizeIndianPhone('9999999999');
    expect(result.normalized).toBe('919999999999');
    expect(result.local).toBe('9999999999');
  });
  
  test('throws error for invalid phone', () => {
    expect(() => normalizeIndianPhone('123')).toThrow();
  });
});

describe('OTP Controller', () => {
  test('returns 429 for rate limit exceeded', async () => {
    // Mock recent OTP
    OTP.findOne = jest.fn().mockResolvedValue({ phone: '919999999999' });
    
    const res = await request(app)
      .post('/auth/send-otp')
      .send({ phone: '9999999999' });
    
    expect(res.status).toBe(429);
  });
  
  test('marks OTP as used after verification', async () => {
    const otpRecord = new OTP({ /* ... */ });
    await verifyOTP(req, res);
    
    expect(otpRecord.isUsed).toBe(true);
  });
});
```

### Integration Tests

```typescript
// tests/integration/auth.test.ts
describe('OTP Flow Integration', () => {
  test('complete OTP flow: send → verify → login', async () => {
    // 1. Send OTP
    const sendRes = await request(app)
      .post('/auth/send-otp')
      .send({ phone: '9999999999' });
    
    expect(sendRes.status).toBe(200);
    
    // 2. Get OTP from database (in test mode)
    const otpRecord = await OTP.findOne({ phone: '919999999999' });
    
    // 3. Verify OTP
    const verifyRes = await request(app)
      .post('/auth/verify-otp')
      .send({ phone: '9999999999', otp: otpRecord.code });
    
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.token).toBeDefined();
    
    // 4. Use token to access protected route
    const meRes = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${verifyRes.body.data.token}`);
    
    expect(meRes.status).toBe(200);
  });
});
```

### Load Testing

```typescript
// tests/load/otp-load.js (using Artillery or k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  const phone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  // Send OTP
  const sendRes = http.post('http://localhost:5000/auth/send-otp', {
    phone,
  });
  
  check(sendRes, {
    'send status is 200': (r) => r.status === 200,
    'send duration < 5s': (r) => r.timings.duration < 5000,
  });
  
  sleep(1);
}
```

---

## 🚀 Deployment Checklist

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<another-long-secret>
DXING_API_KEY=<actual-key>
DXING_INSTANCE_ID=<actual-instance-id>
DXING_DIAG=0

# Optional
REDIS_URL=redis://...
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### Pre-Deployment Verification

- [ ] All environment variables set
- [ ] MongoDB connection verified
- [ ] DXING credentials tested (run diagnostic script)
- [ ] Test OTP end-to-end in staging
- [ ] Rate limiters configured
- [ ] Logging configured (no sensitive data)
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Health check endpoint working
- [ ] Load balancer configured
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Database indexes created
- [ ] Backup strategy in place

### Monitoring Setup

- [ ] Application metrics exported
- [ ] Logs aggregated (ELK/Datadog/CloudWatch)
- [ ] Alerts configured
- [ ] Dashboard created
- [ ] On-call rotation defined
- [ ] Runbook documented

---

## 📚 API Documentation

### Complete API Reference

**Base URL**: `https://api.yourapp.com`

#### POST /auth/send-otp

**Description**: Generate and send OTP to user's phone via WhatsApp

**Request**:
```json
{
  "phone": "9999999999"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error Responses**:
- `400`: Invalid phone number
- `404`: User not found
- `429`: Rate limit exceeded
- `500`: Server error / delivery failed

---

#### POST /auth/verify-otp

**Description**: Verify OTP and authenticate user

**Request**:
```json
{
  "phone": "9999999999",
  "otp": "123456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "phone": "9999999999",
      "name": "John Doe",
      "role": "member",
      "tenantId": { ... },
      "memberId": { ... }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400`: Missing phone/OTP
- `401`: Invalid or expired OTP
- `403`: Account inactive
- `429`: Too many failed attempts

---

#### GET /auth/me

**Description**: Get current authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "phone": "9999999999",
    "name": "John Doe",
    "role": "member"
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-15  
**Maintained By**: Development Team


