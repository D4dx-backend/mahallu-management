# Institute Admin Endpoints (Verified)

This document lists the working endpoints for **Institute Admin** login and common institute-admin master account operations.

## Base URL

- `http://localhost:5000/api`

## Authentication Endpoints

These are shared auth endpoints. Institute Admin can login using institute admin credentials.

### 1) POST `/auth/login`

**Purpose:** Login with phone and password.

**Request Body (JSON):**
```json
{
  "phone": "9999999999",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "Institute Admin",
      "role": "institute"
    },
    "token": "JWT_TOKEN"
  }
}
```

---

### 2) POST `/auth/send-otp`

**Purpose:** Send OTP to registered phone.

**Request Body (JSON):**
```json
{
  "phone": "9999999999"
}
```

---

### 3) POST `/auth/verify-otp`

**Purpose:** Verify OTP and login.

**Request Body (JSON):**
```json
{
  "phone": "9999999999",
  "otp": "123456"
}
```

---

### 4) GET `/auth/me`

**Purpose:** Get currently logged-in user.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**GET Body:**
- No body

---

### 5) POST `/auth/change-password`

**Purpose:** Change password for current user.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Request Body (JSON):**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## Institute Admin Master Account Endpoints

Route group: `/master-accounts`

> All endpoints below require `Authorization: Bearer <JWT_TOKEN>`.

### Institute Accounts

#### GET `/master-accounts/institute`

**Purpose:** List institute accounts.

**GET Body:**
- No body

**Query Params (optional):**
- `instituteId`
- `status` (`active` | `inactive`)
- `page`
- `limit`

**Example:**
`/master-accounts/institute?instituteId=507f1f77bcf86cd799439015&status=active&page=1&limit=10`

#### POST `/master-accounts/institute`

**Purpose:** Create institute account.

**Request Body (JSON):**
```json
{
  "instituteId": "507f1f77bcf86cd799439015",
  "accountName": "Main Account",
  "accountNumber": "1234567890",
  "bankName": "State Bank",
  "ifscCode": "SBIN0001234",
  "balance": 100000,
  "status": "active"
}
```

### Categories

#### GET `/master-accounts/categories`

**GET Body:**
- No body

**Query Params (optional):**
- `type` (`income` | `expense`)
- `search`
- `page`
- `limit`

#### POST `/master-accounts/categories`

**Request Body (JSON):**
```json
{
  "name": "Donations",
  "description": "Charitable donations",
  "type": "income",
  "status": "active"
}
```

### Wallets

#### GET `/master-accounts/wallets`

**GET Body:**
- No body

**Query Params (optional):**
- `type` (`main` | `reserve` | `charity`)
- `page`
- `limit`

#### POST `/master-accounts/wallets`

**Request Body (JSON):**
```json
{
  "name": "Main Wallet",
  "balance": 0,
  "type": "main"
}
```

### Ledgers

#### GET `/master-accounts/ledgers`

**GET Body:**
- No body

**Query Params (optional):**
- `type` (`income` | `expense`)
- `search`
- `page`
- `limit`

#### POST `/master-accounts/ledgers`

**Request Body (JSON):**
```json
{
  "name": "General Ledger",
  "description": "Primary ledger",
  "type": "income"
}
```

### Ledger Items

#### GET `/master-accounts/ledger-items`

**GET Body:**
- No body

**Query Params (optional):**
- `ledgerId`
- `categoryId`
- `dateFrom`
- `dateTo`
- `page`
- `limit`

#### POST `/master-accounts/ledger-items`

**Request Body (JSON):**
```json
{
  "ledgerId": "507f1f77bcf86cd799439099",
  "date": "2026-02-20T00:00:00.000Z",
  "amount": 5000,
  "type": "income",
  "description": "Initial balance entry",
  "categoryId": "507f1f77bcf86cd799439033",
  "paymentMethod": "Cash",
  "referenceNo": "REF001"
}
```

## Verified Source Files

- `mahallu-api/src/routes/authRoutes.ts`
- `mahallu-api/src/routes/masterAccountRoutes.ts`
- `mahallu-api/src/index.ts`
