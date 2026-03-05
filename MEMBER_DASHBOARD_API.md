# Member Portal — Complete API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** All `/member-user/*` routes require `Authorization: Bearer <token>` header.  
**Token expiry:** 7 days  

---

## Table of Contents

1. [Authentication — OTP Login Flow](#1-authentication--otp-login-flow)
   - 1.1 POST `/auth/send-otp`
   - 1.2 POST `/auth/verify-otp`
   - 1.3 GET `/auth/me`
2. [Member Dashboard — Overview](#2-member-dashboard--overview)
3. [Profile](#3-profile)
   - 3.1 GET `/member-user/profile`
   - 3.2 PUT `/member-user/profile`
4. [Payments](#4-payments)
   - 4.1 GET `/member-user/payments`
   - 4.2 GET `/member-user/varisangya`
   - 4.3 POST `/member-user/payments/varisangya`
   - 4.4 POST `/member-user/payments/zakat`
5. [Wallet](#5-wallet)
   - 5.1 GET `/member-user/wallet`
   - 5.2 GET `/member-user/wallet/transactions`
6. [Registrations](#6-registrations)
   - 6.1 GET `/member-user/registrations`
   - 6.2 POST `/member-user/registrations/nikah`
   - 6.3 POST `/member-user/registrations/death`
   - 6.4 POST `/member-user/registrations/noc`
7. [Notifications](#7-notifications)
8. [Community](#8-community)
   - 8.1 GET `/member-user/programs`
   - 8.2 GET `/member-user/feeds`
9. [Family Members](#9-family-members)
10. [Data Models Reference](#10-data-models-reference)
11. [Error Responses](#11-error-responses)
12. [Admin Registration CRUD](#12-admin-registration-crud-mahall-admin--super-admin)
    - 12.1 Nikah Registration — Admin CRUD
    - 12.2 Death Registration — Admin CRUD
    - 12.3 NOC — Admin CRUD
    - NOC Full Lifecycle Summary
    - Admin Access Levels

---

## 1. Authentication — OTP Login Flow

> Members **cannot** use password login. They must use the OTP flow below.

### Step 1 — POST `/api/auth/send-otp`

Sends a 6-digit OTP to the member's registered phone (via WhatsApp/SMS).

#### Request Body

```json
{
  "phone": "9567374733"
}
```

#### Field Rules

| Field   | Type   | Required | Validation                           |
|---------|--------|----------|--------------------------------------|
| `phone` | string | Yes      | `^(\+?91)?[0-9]{10}$` — accepts 10-digit number with optional `+91` or `91` prefix |

#### Success Response `200`

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### Error Responses

| Status | Message |
|--------|---------|
| `400`  | `Phone number is required` |
| `400`  | `Invalid phone number` |
| `404`  | `No member account found with this phone number` |
| `500`  | `Internal server error` |

---

### Step 2 — POST `/api/auth/verify-otp`

Verifies the OTP and returns a JWT token.

#### Request Body

```json
{
  "phone": "9567374733",
  "otp": "123456"
}
```

#### Field Rules

| Field   | Type   | Required | Validation          |
|---------|--------|----------|---------------------|
| `phone` | string | Yes      | `^(\+?91)?[0-9]{10}$` |
| `otp`   | string | Yes      | `^[0-9]{6}$` — exactly 6 digits |

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7890a1234",
      "name": "Ahmed Rashid",
      "phone": "9567374733",
      "role": "member",
      "status": "active",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "memberId": "65f1a2b3c4d5e6f7890a5678",
      "permissions": {
        "view": true,
        "add": false,
        "edit": false,
        "delete": false
      },
      "lastLogin": "2026-03-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

| Status | Message |
|--------|---------|
| `400`  | `Phone and OTP are required` |
| `400`  | `Invalid or expired OTP` |
| `403`  | `Account is inactive` |
| `404`  | `User not found` |

---

### Step 3 — GET `/api/auth/me`

Returns the current authenticated user's info.

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a1234",
    "name": "Ahmed Rashid",
    "phone": "9567374733",
    "role": "member",
    "status": "active",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "memberId": "65f1a2b3c4d5e6f7890a5678",
    "permissions": {
      "view": true,
      "add": false,
      "edit": false,
      "delete": false
    },
    "lastLogin": "2026-03-03T10:00:00.000Z"
  }
}
```

---

## 2. Member Dashboard — Overview

### GET `/api/member-user/overview`

Returns the complete dashboard snapshot: member details, family info, mahallu stats, financial summary, varusankhya details, and assigned permissions.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

None.

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "member": {
      "_id": "65f1a2b3c4d5e6f7890a5678",
      "name": "Ahmed Rashid",
      "phone": "9567374733",
      "age": 35,
      "gender": "male",
      "bloodGroup": "B +ve",
      "healthStatus": "Good",
      "education": "Graduation",
      "maritalStatus": "married",
      "marriageCount": 1,
      "isOrphan": false,
      "isDead": false,
      "status": "active",
      "mahallId": "MHL-001",
      "familyId": "65f1a2b3c4d5e6f7890a0010",
      "familyName": "Al-Rashid Family",
      "tenantId": "65f1a2b3c4d5e6f7890a0001"
    },
    "family": {
      "details": {
        "_id": "65f1a2b3c4d5e6f7890a0010",
        "houseName": "Al-Rashid House",
        "mahallId": "MHL-001",
        "contactNo": "9876543210",
        "address": "123 Main Street",
        "varisangyaGrade": "A",
        "wardNumber": "3",
        "houseNo": "45",
        "area": "North Block",
        "place": "Kozhikode",
        "status": "active"
      },
      "members": [
        {
          "_id": "65f1a2b3c4d5e6f7890a5678",
          "name": "Ahmed Rashid",
          "phone": "9567374733",
          "age": 35,
          "gender": "male",
          "mahallId": "MHL-001",
          "familyName": "Al-Rashid Family",
          "status": "active",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ],
      "financialSummary": {
        "varisangyaTotal": 5000,
        "varisangyaCount": 10,
        "zakatTotal": 2500,
        "zakatCount": 2
      }
    },
    "mahalluStatistics": {
      "users": 120,
      "families": 85,
      "members": 430
    },
    "varusankhyaDetails": {
      "familyMahallId": "MHL-001",
      "memberMahallId": "MHL-001",
      "varisangyaGrade": "A",
      "latestVarisangyaReceiptNo": "RCP-2026-001",
      "latestZakatReceiptNo": "ZKT-2026-001",
      "latestVarisangyaPaymentDate": "2026-02-15T00:00:00.000Z",
      "latestZakatPaymentDate": "2026-01-20T00:00:00.000Z"
    },
    "assignedOptions": {
      "view": true,
      "add": false,
      "edit": false,
      "delete": false
    }
  }
}
```

---

## 3. Profile

### 3.1 GET `/api/member-user/profile`

Returns the authenticated member's full profile.

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a5678",
    "name": "Ahmed Rashid",
    "phone": "9567374733",
    "age": 35,
    "gender": "male",
    "bloodGroup": "B +ve",
    "healthStatus": "Good",
    "education": "Graduation",
    "maritalStatus": "married",
    "marriageCount": 1,
    "isOrphan": false,
    "isDead": false,
    "status": "active",
    "mahallId": "MHL-001",
    "familyId": {
      "_id": "65f1a2b3c4d5e6f7890a0010",
      "houseName": "Al-Rashid House",
      "mahallId": "MHL-001",
      "contactNo": "9876543210",
      "address": "123 Main Street"
    },
    "familyName": "Al-Rashid Family",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  }
}
```

#### Error Responses

| Status | Message |
|--------|---------|
| `404`  | `Member profile not linked to user account` |
| `404`  | `Member not found` |

---

### 3.2 PUT `/api/member-user/profile`

Updates the member's own profile. Only `phone` and `email` fields are allowed for self-update.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```json
{
  "phone": "9567374733",
  "email": "ahmed@example.com"
}
```

#### Field Rules

| Field   | Type   | Required | Notes                        |
|---------|--------|----------|------------------------------|
| `phone` | string | No       | New phone number             |
| `email` | string | No       | Email address                |

> Only `phone` and `email` are writable by members. All other fields are managed by mahallu admins only.

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a5678",
    "name": "Ahmed Rashid",
    "phone": "9567374733",
    "email": "ahmed@example.com",
    "familyId": {
      "houseName": "Al-Rashid House",
      "mahallId": "MHL-001"
    },
    "status": "active"
  }
}
```

---

## 4. Payments

### 4.1 GET `/api/member-user/payments`

Returns combined Varisangya and Zakat payment history for the logged-in member.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description                             |
|---------|---------|----------|-----------------------------------------|
| `type`  | string  | No       | Filter: `varisangya` or `zakat`         |
| `page`  | integer | No       | Page number (default: 1)                |
| `limit` | integer | No       | Items per page (default: 10)            |

#### Example Request

```
GET /api/member-user/payments?type=varisangya&page=1&limit=5
```

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a9001",
      "amount": 500,
      "paymentDate": "2026-02-15T00:00:00.000Z",
      "paymentMethod": "cash",
      "receiptNo": "RCP-2026-001",
      "remarks": "Monthly payment",
      "familyId": {
        "houseName": "Al-Rashid House"
      },
      "type": "varisangya",
      "createdAt": "2026-02-15T10:00:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7890a9002",
      "amount": 2500,
      "paymentDate": "2026-01-20T00:00:00.000Z",
      "paymentMethod": "bank_transfer",
      "receiptNo": "ZKT-2026-001",
      "category": "annual",
      "type": "zakat",
      "createdAt": "2026-01-20T08:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 5,
    "pages": 1
  }
}
```

---

### 4.2 GET `/api/member-user/varisangya`

Returns detailed Varisangya payment breakdown (member-level and family-level) with optional year filter.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param  | Type    | Required | Description                    |
|--------|---------|----------|--------------------------------|
| `year` | integer | No       | Filter by year e.g. `2026`     |

#### Example Request

```
GET /api/member-user/varisangya?year=2026
```

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "memberVarisangya": [
      {
        "_id": "65f1a2b3c4d5e6f7890a9001",
        "amount": 500,
        "paymentDate": "2026-02-15T00:00:00.000Z",
        "paymentMethod": "cash",
        "receiptNo": "RCP-2026-001",
        "status": "paid"
      }
    ],
    "familyVarisangya": [
      {
        "_id": "65f1a2b3c4d5e6f7890a9010",
        "amount": 1000,
        "paymentDate": "2026-01-10T00:00:00.000Z",
        "paymentMethod": "online",
        "receiptNo": "RCP-2026-FAM-001",
        "status": "paid"
      }
    ],
    "summary": {
      "memberTotal": 500,
      "memberCount": 1,
      "familyTotal": 1000,
      "familyCount": 1
    }
  }
}
```

---

### 4.3 POST `/api/member-user/payments/varisangya`

Submits a new Varisangya payment request for the logged-in member.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```json
{
  "amount": 500,
  "paymentDate": "2026-03-01",
  "paymentMethod": "cash",
  "receiptNo": "RCP-2026-002",
  "remarks": "Monthly Varisangya"
}
```

#### Field Rules

| Field           | Type   | Required | Description                          |
|-----------------|--------|----------|--------------------------------------|
| `amount`        | number | **Yes**  | Payment amount (min: 0)              |
| `paymentDate`   | string | **Yes**  | Date in `YYYY-MM-DD` format          |
| `paymentMethod` | string | No       | e.g. `cash`, `bank_transfer`, `online` |
| `receiptNo`     | string | No       | Receipt number                       |
| `remarks`       | string | No       | Additional remarks                   |

> `tenantId`, `memberId`, `familyId` are auto-filled from the authenticated member session.

#### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a9003",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "memberId": "65f1a2b3c4d5e6f7890a5678",
    "familyId": "65f1a2b3c4d5e6f7890a0010",
    "amount": 500,
    "paymentDate": "2026-03-01T00:00:00.000Z",
    "paymentMethod": "cash",
    "receiptNo": "RCP-2026-002",
    "remarks": "Monthly Varisangya",
    "createdAt": "2026-03-03T08:00:00.000Z"
  },
  "message": "Varisangya payment request submitted successfully"
}
```

---

### 4.4 POST `/api/member-user/payments/zakat`

Submits a new Zakat payment request for the logged-in member.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```json
{
  "amount": 2500,
  "paymentDate": "2026-03-01",
  "paymentMethod": "bank_transfer",
  "receiptNo": "ZKT-2026-002",
  "category": "annual",
  "remarks": "Zakat al-Mal"
}
```

#### Field Rules

| Field           | Type   | Required | Description                              |
|-----------------|--------|----------|------------------------------------------|
| `amount`        | number | **Yes**  | Payment amount (min: 0)                  |
| `paymentDate`   | string | **Yes**  | Date in `YYYY-MM-DD` format              |
| `paymentMethod` | string | No       | e.g. `cash`, `bank_transfer`, `online`   |
| `receiptNo`     | string | No       | Receipt number                           |
| `category`      | string | No       | e.g. `annual`, `fitrah`, `general`       |
| `remarks`       | string | No       | Additional remarks                       |

> `tenantId`, `payerId`, `payerName` are auto-filled from the authenticated member session.

#### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a9004",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "payerId": "65f1a2b3c4d5e6f7890a5678",
    "payerName": "Ahmed Rashid",
    "amount": 2500,
    "paymentDate": "2026-03-01T00:00:00.000Z",
    "paymentMethod": "bank_transfer",
    "receiptNo": "ZKT-2026-002",
    "category": "annual",
    "remarks": "Zakat al-Mal",
    "createdAt": "2026-03-03T08:05:00.000Z"
  },
  "message": "Zakat payment request submitted successfully"
}
```

---

## 5. Wallet

### 5.1 GET `/api/member-user/wallet`

Returns the member's wallet balance. A wallet is created automatically if it doesn't exist.

#### Headers

```
Authorization: Bearer <token>
```

#### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a8001",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "memberId": "65f1a2b3c4d5e6f7890a5678",
    "balance": 1500,
    "lastTransactionDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2026-02-20T00:00:00.000Z"
  }
}
```

---

### 5.2 GET `/api/member-user/wallet/transactions`

Returns the member's wallet transaction history.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description               |
|---------|---------|----------|---------------------------|
| `page`  | integer | No       | Page number (default: 1)  |
| `limit` | integer | No       | Items per page (default: 10) |

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a7001",
      "walletId": "65f1a2b3c4d5e6f7890a8001",
      "type": "credit",
      "amount": 500,
      "description": "Varisangya refund",
      "referenceId": "65f1a2b3c4d5e6f7890a9001",
      "referenceType": "varisangya",
      "createdAt": "2026-02-20T00:00:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7890a7002",
      "walletId": "65f1a2b3c4d5e6f7890a8001",
      "type": "debit",
      "amount": 200,
      "description": "Zakat payment",
      "referenceId": "65f1a2b3c4d5e6f7890a9004",
      "referenceType": "zakat",
      "createdAt": "2026-02-18T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 6. Registrations

### 6.1 GET `/api/member-user/registrations`

Returns all registrations (Nikah, Death, NOC) for the logged-in member.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description                              |
|---------|---------|----------|------------------------------------------|
| `type`  | string  | No       | Filter: `nikah`, `death`, or `noc`       |
| `page`  | integer | No       | Page number (default: 1)                 |
| `limit` | integer | No       | Items per page (default: 10)             |

#### Example — Get only NOC registrations

```
GET /api/member-user/registrations?type=noc
```

#### Success Response `200` — All types

```json
{
  "success": true,
  "data": {
    "nikah": [
      {
        "_id": "65f1a2b3c4d5e6f7890a6001",
        "groomName": "Ahmed Rashid",
        "brideName": "Fatima Noor",
        "nikahDate": "2026-04-10T00:00:00.000Z",
        "status": "pending",
        "createdAt": "2026-03-01T00:00:00.000Z"
      }
    ],
    "death": [],
    "noc": [
      {
        "_id": "65f1a2b3c4d5e6f7890a6100",
        "applicantName": "Ahmed Rashid",
        "type": "common",
        "purposeTitle": "Bank Loan",
        "purposeDescription": "NOC required for housing loan",
        "status": "approved",
        "approvedBy": "Admin User",
        "issuedDate": "2026-02-20T00:00:00.000Z",
        "expiryDate": "2026-08-20T00:00:00.000Z",
        "createdAt": "2026-02-15T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 6.2 POST `/api/member-user/registrations/nikah`

Submits a Nikah (marriage) registration request. The logged-in member is automatically set as the groom.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```json
{
  "brideName": "Fatima Noor",
  "brideAge": 24,
  "brideId": "65f1a2b3c4d5e6f7890a5900",
  "nikahDate": "2026-04-10",
  "venue": "Town Hall, Kozhikode",
  "waliName": "Ibrahim Noor",
  "witness1": "Abdullah Khan",
  "witness2": "Hassan Ali",
  "mahrAmount": 10000,
  "mahrDescription": "Gold 10g + cash"
}
```

#### Field Rules

| Field              | Type   | Required | Description                                    |
|--------------------|--------|----------|------------------------------------------------|
| `brideName`        | string | **Yes**  | Bride's full name                              |
| `nikahDate`        | string | **Yes**  | Date in `YYYY-MM-DD` format                    |
| `brideAge`         | number | No       | Bride's age                                    |
| `brideId`          | string | No       | Member ObjectId of bride (if registered member)|
| `venue`            | string | No       | Ceremony venue                                 |
| `waliName`         | string | No       | Name of wali (guardian)                        |
| `witness1`         | string | No       | First witness name                             |
| `witness2`         | string | No       | Second witness name                            |
| `mahrAmount`       | number | No       | Mahr/dowry amount                              |
| `mahrDescription`  | string | No       | Description of mahr                            |

> Auto-filled: `tenantId`, `groomId`, `groomName`, `status = "pending"`

#### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6001",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "groomId": "65f1a2b3c4d5e6f7890a5678",
    "groomName": "Ahmed Rashid",
    "brideName": "Fatima Noor",
    "brideAge": 24,
    "nikahDate": "2026-04-10T00:00:00.000Z",
    "venue": "Town Hall, Kozhikode",
    "waliName": "Ibrahim Noor",
    "witness1": "Abdullah Khan",
    "witness2": "Hassan Ali",
    "mahrAmount": 10000,
    "mahrDescription": "Gold 10g + cash",
    "status": "pending",
    "createdAt": "2026-03-03T08:10:00.000Z"
  },
  "message": "Nikah registration request submitted successfully"
}
```

---

### 6.3 POST `/api/member-user/registrations/death`

Submits a death registration request. The logged-in member is set as the deceased.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```json
{
  "deathDate": "2026-03-03",
  "placeOfDeath": "General Hospital, Kozhikode",
  "causeOfDeath": "Natural causes",
  "informantName": "Ibrahim Rashid",
  "informantRelation": "Son",
  "informantPhone": "9876543210"
}
```

#### Field Rules

| Field               | Type   | Required | Description                           |
|---------------------|--------|----------|---------------------------------------|
| `deathDate`         | string | **Yes**  | Date in `YYYY-MM-DD` format           |
| `placeOfDeath`      | string | No       | Location/hospital of death            |
| `causeOfDeath`      | string | No       | Cause description                     |
| `informantName`     | string | No       | Name of person reporting the death    |
| `informantRelation` | string | No       | Relation to deceased                  |
| `informantPhone`    | string | No       | Contact number of informant           |

> Auto-filled: `tenantId`, `deceasedId`, `deceasedName`, `familyId`, `status = "pending"`

#### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6050",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "deceasedId": "65f1a2b3c4d5e6f7890a5678",
    "deceasedName": "Ahmed Rashid",
    "familyId": "65f1a2b3c4d5e6f7890a0010",
    "deathDate": "2026-03-03T00:00:00.000Z",
    "placeOfDeath": "General Hospital, Kozhikode",
    "causeOfDeath": "Natural causes",
    "informantName": "Ibrahim Rashid",
    "informantRelation": "Son",
    "informantPhone": "9876543210",
    "status": "pending",
    "createdAt": "2026-03-03T09:00:00.000Z"
  },
  "message": "Death registration request submitted successfully"
}
```

---

### 6.4 POST `/api/member-user/registrations/noc`

Submits a NOC (No Objection Certificate) request. Supports both `common` and `nikah` types.

#### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body — Common NOC

```json
{
  "type": "common",
  "purposeTitle": "Bank Loan",
  "purposeDescription": "Need NOC for housing loan from SBI Bank",
  "remarks": "Urgent — loan deadline March 15"
}
```

#### Request Body — Nikah NOC

```json
{
  "type": "nikah",
  "brideName": "Fatima Noor",
  "brideAge": 24,
  "nikahDate": "2026-04-10",
  "venue": "Town Hall, Kozhikode",
  "purposeTitle": "Nikah NOC",
  "purposeDescription": "NOC required for marriage registration at civil office",
  "remarks": ""
}
```

#### Field Rules

| Field                | Type   | Required for nikah | Required for common | Description                                       |
|----------------------|--------|--------------------|---------------------|---------------------------------------------------|
| `type`               | string | **Yes**            | **Yes**             | `common` or `nikah`                               |
| `purposeTitle`       | string | No                 | No                  | Short title for the NOC purpose                   |
| `purposeDescription` | string | No                 | No                  | Detailed purpose description                      |
| `remarks`            | string | No                 | No                  | Additional remarks                                |
| `brideName`          | string | **Yes**            | N/A                 | Required only when `type = "nikah"`               |
| `nikahDate`          | string | **Yes**            | N/A                 | Required when `type = "nikah"` (`YYYY-MM-DD`)     |
| `brideAge`           | number | No                 | N/A                 | Bride's age (nikah only)                          |
| `venue`              | string | No                 | N/A                 | Ceremony venue (nikah only)                       |

> Auto-filled: `tenantId`, `applicantId`, `applicantName`, `applicantPhone`, `status = "pending"`  
> For `type = "nikah"`, a linked `NikahRegistration` record is automatically created and linked via `nikahRegistrationId`.

#### Success Response `201` — Common NOC

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6100",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "applicantId": "65f1a2b3c4d5e6f7890a5678",
    "applicantName": "Ahmed Rashid",
    "applicantPhone": "9567374733",
    "type": "common",
    "purposeTitle": "Bank Loan",
    "purposeDescription": "Need NOC for housing loan from SBI Bank",
    "remarks": "Urgent — loan deadline March 15",
    "status": "pending",
    "createdAt": "2026-03-03T09:10:00.000Z"
  },
  "message": "NOC request submitted successfully"
}
```

#### Success Response `201` — Nikah NOC

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6200",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "applicantId": "65f1a2b3c4d5e6f7890a5678",
    "applicantName": "Ahmed Rashid",
    "applicantPhone": "9567374733",
    "type": "nikah",
    "purposeTitle": "Nikah NOC",
    "purposeDescription": "NOC required for marriage registration at civil office",
    "nikahRegistrationId": {
      "_id": "65f1a2b3c4d5e6f7890a6001",
      "groomName": "Ahmed Rashid",
      "brideName": "Fatima Noor",
      "brideAge": 24,
      "nikahDate": "2026-04-10T00:00:00.000Z",
      "venue": "Town Hall, Kozhikode",
      "status": "pending"
    },
    "status": "pending",
    "createdAt": "2026-03-03T09:15:00.000Z"
  },
  "message": "NOC request submitted successfully"
}
```

#### NOC Status Values

| Status     | Meaning                              |
|------------|--------------------------------------|
| `pending`  | Submitted, awaiting admin review     |
| `approved` | Approved by mahallu admin           |
| `rejected` | Rejected by mahallu admin            |

---

## 7. Notifications

### GET `/api/member-user/notifications`

Returns notifications sent directly to the member or broadcast to all members.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description               |
|---------|---------|----------|---------------------------|
| `page`  | integer | No       | Page number (default: 1)  |
| `limit` | integer | No       | Items per page (default: 10) |

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a5001",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "recipientId": "65f1a2b3c4d5e6f7890a5678",
      "recipientType": "member",
      "title": "NOC Approved",
      "message": "Your NOC request for Bank Loan has been approved.",
      "type": "success",
      "isRead": false,
      "link": "/registrations/noc/65f1a2b3c4d5e6f7890a6100",
      "createdAt": "2026-02-20T10:00:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7890a5002",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "recipientType": "all",
      "title": "Mahallu Meeting",
      "message": "General body meeting scheduled for March 10, 2026 at 7 PM.",
      "type": "info",
      "isRead": false,
      "createdAt": "2026-02-19T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Notification Type Values

| Type      | Meaning                  |
|-----------|--------------------------|
| `info`    | General information      |
| `success` | Positive event/approval  |
| `warning` | Caution or reminder      |
| `error`   | Failure or rejection     |

#### Recipient Type Values

| recipientType | Meaning                                     |
|---------------|---------------------------------------------|
| `member`      | Sent to a specific member (uses `recipientId`) |
| `all`         | Broadcast to all members of the mahallu     |

---

## 8. Community

### 8.1 GET `/api/member-user/programs`

Returns active community programs (view-only) for the member's mahallu.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description               |
|---------|---------|----------|---------------------------|
| `page`  | integer | No       | Page number (default: 1)  |
| `limit` | integer | No       | Items per page (default: 10) |

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a4001",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "name": "Quran Recitation Program",
      "type": "program",
      "status": "active",
      "description": "Weekly Quran recitation every Friday",
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 8.2 GET `/api/member-user/feeds`

Returns published community feeds and announcements for the mahallu.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description               |
|---------|---------|----------|---------------------------|
| `page`  | integer | No       | Page number (default: 1)  |
| `limit` | integer | No       | Items per page (default: 10) |

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a3001",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "title": "Eid Celebration Announcement",
      "content": "Eid celebrations will be held at the mahallu mosque on March 30, 2026.",
      "status": "published",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 9. Family Members

### GET `/api/member-user/family-members`

Returns all active members from the logged-in member's family.

#### Headers

```
Authorization: Bearer <token>
```

#### Query Params

| Param   | Type    | Required | Description               |
|---------|---------|----------|---------------------------|
| `page`  | integer | No       | Page number (default: 1)  |
| `limit` | integer | No       | Items per page (default: 10) |

#### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a5678",
      "name": "Ahmed Rashid",
      "phone": "9567374733",
      "age": 35,
      "gender": "male",
      "maritalStatus": "married",
      "status": "active",
      "familyId": {
        "_id": "65f1a2b3c4d5e6f7890a0010",
        "houseName": "Al-Rashid House",
        "mahallId": "MHL-001",
        "contactNo": "9876543210"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7890a5679",
      "name": "Zainab Rashid",
      "age": 30,
      "gender": "female",
      "maritalStatus": "married",
      "status": "active",
      "familyId": {
        "_id": "65f1a2b3c4d5e6f7890a0010",
        "houseName": "Al-Rashid House",
        "mahallId": "MHL-001",
        "contactNo": "9876543210"
      }
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Error Responses

| Status | Message |
|--------|---------|
| `404`  | `Member is not linked to a family` |
| `404`  | `Member not found` |

---

## 10. Data Models Reference

### Member

| Field           | Type    | Enum Values                                                        | Notes                 |
|-----------------|---------|--------------------------------------------------------------------|-----------------------|
| `_id`           | ObjectId |                                                                   | Auto-generated        |
| `tenantId`      | ObjectId |                                                                   | Required              |
| `mahallId`      | string  |                                                                    |                       |
| `name`          | string  |                                                                    | Required              |
| `familyId`      | ObjectId |                                                                   | Required              |
| `familyName`    | string  |                                                                    | Required              |
| `age`           | number  |                                                                    | min: 0                |
| `gender`        | string  | `male`, `female`                                                   |                       |
| `bloodGroup`    | string  | `A +ve`, `A -ve`, `B +ve`, `B -ve`, `AB +ve`, `AB -ve`, `O +ve`, `O -ve` |              |
| `healthStatus`  | string  |                                                                    |                       |
| `phone`         | string  |                                                                    |                       |
| `email`         | string  |                                                                    |                       |
| `education`     | string  |                                                                    |                       |
| `maritalStatus` | string  | `single`, `married`, `divorced`, `widowed`                         |                       |
| `marriageCount` | number  |                                                                    | default: 0            |
| `isOrphan`      | boolean |                                                                    | default: false        |
| `isDead`        | boolean |                                                                    | default: false        |
| `status`        | string  | `active`, `inactive`, `deleted`                                    | default: `active`     |

### Varisangya

| Field           | Type     | Required | Notes                  |
|-----------------|----------|----------|------------------------|
| `tenantId`      | ObjectId | Yes      | Auto-filled            |
| `familyId`      | ObjectId | No       | Auto-filled            |
| `memberId`      | ObjectId | No       | Auto-filled            |
| `amount`        | number   | Yes      | min: 0                 |
| `paymentDate`   | Date     | Yes      |                        |
| `paymentMethod` | string   | No       |                        |
| `receiptNo`     | string   | No       |                        |
| `remarks`       | string   | No       |                        |

### Zakat

| Field           | Type     | Required | Notes                  |
|-----------------|----------|----------|------------------------|
| `tenantId`      | ObjectId | Yes      | Auto-filled            |
| `payerName`     | string   | Yes      | Auto-filled            |
| `payerId`       | ObjectId | No       | Auto-filled            |
| `amount`        | number   | Yes      | min: 0                 |
| `paymentDate`   | Date     | Yes      |                        |
| `paymentMethod` | string   | No       |                        |
| `receiptNo`     | string   | No       |                        |
| `category`      | string   | No       |                        |
| `remarks`       | string   | No       |                        |

### Wallet

| Field                 | Type     | Required | Notes                  |
|-----------------------|----------|----------|------------------------|
| `tenantId`            | ObjectId | Yes      |                        |
| `memberId`            | ObjectId | No       |                        |
| `familyId`            | ObjectId | No       |                        |
| `balance`             | number   | No       | default: 0, min: 0     |
| `lastTransactionDate` | Date     | No       |                        |

### Transaction

| Field           | Type     | Enum Values              | Notes                  |
|-----------------|----------|--------------------------|------------------------|
| `walletId`      | ObjectId |                          | Required               |
| `type`          | string   | `credit`, `debit`        | Required               |
| `amount`        | number   |                          | Required, min: 0       |
| `description`   | string   |                          | Required               |
| `referenceId`   | ObjectId |                          |                        |
| `referenceType` | string   | `varisangya`, `zakat`    |                        |

### NikahRegistration

| Field               | Type     | Required | Notes                          |
|---------------------|----------|----------|--------------------------------|
| `tenantId`          | ObjectId | Yes      | Auto-filled                    |
| `groomName`         | string   | Yes      | Auto-filled from member        |
| `groomAge`          | number   | No       |                                |
| `groomId`           | ObjectId | No       | Auto-filled from member        |
| `brideName`         | string   | Yes      |                                |
| `brideAge`          | number   | No       |                                |
| `brideId`           | ObjectId | No       |                                |
| `mahallMemberType`  | string   | No       | `groom` or `bride`             |
| `nikahDate`         | Date     | Yes      |                                |
| `venue`             | string   | No       |                                |
| `waliName`          | string   | No       |                                |
| `witness1`          | string   | No       |                                |
| `witness2`          | string   | No       |                                |
| `mahrAmount`        | number   | No       |                                |
| `mahrDescription`   | string   | No       |                                |
| `status`            | string   | No       | `pending`/`approved`/`rejected` default: `pending` |
| `remarks`           | string   | No       |                                |

### DeathRegistration

| Field               | Type     | Required | Notes                          |
|---------------------|----------|----------|--------------------------------|
| `tenantId`          | ObjectId | Yes      | Auto-filled                    |
| `deceasedName`      | string   | Yes      | Auto-filled from member        |
| `deceasedId`        | ObjectId | No       | Auto-filled from member        |
| `deathDate`         | Date     | Yes      |                                |
| `placeOfDeath`      | string   | No       |                                |
| `causeOfDeath`      | string   | No       |                                |
| `mahallId`          | string   | No       |                                |
| `familyId`          | ObjectId | No       | Auto-filled                    |
| `informantName`     | string   | No       |                                |
| `informantRelation` | string   | No       |                                |
| `informantPhone`    | string   | No       |                                |
| `status`            | string   | No       | `pending`/`approved`/`rejected` default: `pending` |
| `remarks`           | string   | No       |                                |

### NOC

| Field                  | Type     | Required | Notes                           |
|------------------------|----------|----------|---------------------------------|
| `tenantId`             | ObjectId | Yes      | Auto-filled                     |
| `applicantName`        | string   | Yes      | Auto-filled from member         |
| `applicantId`          | ObjectId | No       | Auto-filled from member         |
| `applicantPhone`       | string   | No       | Auto-filled from member         |
| `purposeTitle`         | string   | No       |                                 |
| `purposeDescription`   | string   | No       |                                 |
| `type`                 | string   | Yes      | `common` or `nikah`             |
| `nikahRegistrationId`  | ObjectId | No       | Auto-created for nikah NOC      |
| `status`               | string   | No       | `pending`/`approved`/`rejected` |
| `approvedBy`           | string   | No       | Set by admin on approval        |
| `issuedDate`           | Date     | No       | Set by admin on approval        |
| `expiryDate`           | Date     | No       | Set by admin on approval        |
| `remarks`              | string   | No       |                                 |

### Notification

| Field           | Type     | Enum Values                          | Notes           |
|-----------------|----------|--------------------------------------|-----------------|
| `tenantId`      | ObjectId |                                      | Required        |
| `recipientId`   | ObjectId |                                      | Specific member |
| `recipientType` | string   | `user`, `member`, `all`              | default: `all`  |
| `title`         | string   |                                      | Required        |
| `message`       | string   |                                      | Required        |
| `type`          | string   | `info`, `warning`, `success`, `error`| default: `info` |
| `isRead`        | boolean  |                                      | default: false  |
| `link`          | string   |                                      | Optional URL    |

---

## 11. Error Responses

### Common Error Structure

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Status | Meaning                                                  |
|--------|----------------------------------------------------------|
| `200`  | Success                                                  |
| `201`  | Created                                                  |
| `400`  | Bad Request — missing or invalid fields                  |
| `401`  | Unauthorized — invalid or missing token                  |
| `403`  | Forbidden — role not permitted (e.g. password login by member) |
| `404`  | Not Found — resource or linked profile not found         |
| `500`  | Internal Server Error                                    |

### Common 403 Cases for Members

```json
{
  "success": false,
  "message": "Member login is OTP-only. Please use send OTP and verify OTP."
}
```

```json
{
  "success": false,
  "message": "Access denied. Member users only."
}
```

### Common 404 Cases

```json
{
  "success": false,
  "message": "Member profile not linked to user account"
}
```

```json
{
  "success": false,
  "message": "Member not found"
}
```

```json
{
  "success": false,
  "message": "Member is not linked to a family"
}
```

---

---

## 12. Admin Registration CRUD (Mahall Admin / Super Admin)

> **Access:** Routes under `/api/registrations/*` require a logged-in Mahall Admin or Super Admin token.  
> **Tenant isolation:** Each admin can only read/write records belonging to their own `tenantId`.  
> The `x-tenant-id` header allows Super Admins to view a specific tenant's data.

---

### 12.1 Nikah Registration — Admin CRUD

#### GET `/api/registrations/nikah`

List all Nikah registrations with filters and pagination.

##### Headers

```
Authorization: Bearer <admin-token>
```

##### Query Params

| Param      | Type    | Required | Description                              |
|------------|---------|----------|------------------------------------------|
| `status`   | string  | No       | `pending`, `approved`, `rejected`        |
| `search`   | string  | No       | Search by groom name or bride name       |
| `dateFrom` | string  | No       | Filter from date `YYYY-MM-DD`            |
| `dateTo`   | string  | No       | Filter to date `YYYY-MM-DD`              |
| `page`     | integer | No       | Page number (default: 1)                 |
| `limit`    | integer | No       | Items per page (default: 10, max: 100)   |

##### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a6001",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "groomId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
      "groomName": "Ahmed Rashid",
      "groomAge": 35,
      "brideId": null,
      "brideName": "Fatima Noor",
      "brideAge": 24,
      "mahallMemberType": "groom",
      "nikahDate": "2026-04-10T00:00:00.000Z",
      "venue": "Town Hall, Kozhikode",
      "waliName": "Ibrahim Noor",
      "witness1": "Abdullah Khan",
      "witness2": "Hassan Ali",
      "mahrAmount": 10000,
      "mahrDescription": "Gold 10g + cash",
      "status": "pending",
      "remarks": "",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

#### GET `/api/registrations/nikah/:id`

Get a single Nikah registration by ID.

##### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6001",
    "groomId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
    "groomName": "Ahmed Rashid",
    "brideName": "Fatima Noor",
    "nikahDate": "2026-04-10T00:00:00.000Z",
    "status": "pending"
  }
}
```

---

#### POST `/api/registrations/nikah`

Create a Nikah registration directly (admin-created records can have any status).

##### Request Body

```json
{
  "groomName": "Ahmed Rashid",
  "groomAge": 35,
  "groomId": "65f1a2b3c4d5e6f7890a5678",
  "brideName": "Fatima Noor",
  "brideAge": 24,
  "brideId": "65f1a2b3c4d5e6f7890a5900",
  "mahallMemberType": "groom",
  "nikahDate": "2026-04-10",
  "venue": "Town Hall, Kozhikode",
  "mahallId": "MHL-001",
  "waliName": "Ibrahim Noor",
  "witness1": "Abdullah Khan",
  "witness2": "Hassan Ali",
  "mahrAmount": 10000,
  "mahrDescription": "Gold 10g + cash",
  "status": "approved",
  "remarks": ""
}
```

##### Field Rules

| Field              | Type     | Required | Description                                          |
|--------------------|----------|----------|------------------------------------------------------|
| `groomName`        | string   | **Yes**  | Groom's full name                                    |
| `brideName`        | string   | **Yes**  | Bride's full name                                    |
| `nikahDate`        | string   | **Yes**  | Date in `YYYY-MM-DD` format                          |
| `groomAge`         | number   | No       | Groom's age                                          |
| `groomId`          | ObjectId | No       | Member ID of groom (if registered)                   |
| `brideAge`         | number   | No       | Bride's age                                          |
| `brideId`          | ObjectId | No       | Member ID of bride (if registered)                   |
| `mahallMemberType` | string   | No       | `groom` or `bride` — which party belongs to mahallu  |
| `venue`            | string   | No       | Ceremony venue                                       |
| `mahallId`         | string   | No       | Mahallu ID                                           |
| `waliName`         | string   | No       | Wali (guardian) name                                 |
| `witness1`         | string   | No       | First witness name                                   |
| `witness2`         | string   | No       | Second witness name                                  |
| `mahrAmount`       | number   | No       | Mahr/dowry amount                                    |
| `mahrDescription`  | string   | No       | Description of mahr                                  |
| `status`           | string   | No       | `pending`, `approved`, or `rejected` (default: `pending`) |
| `remarks`          | string   | No       | Admin remarks                                        |

> `tenantId` is auto-set from the authenticated admin's session.

##### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6002",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "groomName": "Ahmed Rashid",
    "brideName": "Fatima Noor",
    "nikahDate": "2026-04-10T00:00:00.000Z",
    "status": "approved",
    "createdAt": "2026-03-03T10:00:00.000Z"
  }
}
```

---

#### PUT `/api/registrations/nikah/:id`

Update a Nikah registration (approve, reject, or edit any field).

##### Request Body — Approve

```json
{
  "status": "approved",
  "remarks": "All documents verified"
}
```

##### Request Body — Reject

```json
{
  "status": "rejected",
  "remarks": "Incomplete wali documentation"
}
```

##### Request Body — Full Update

```json
{
  "groomName": "Ahmed Rashid",
  "groomAge": 35,
  "groomId": "65f1a2b3c4d5e6f7890a5678",
  "brideName": "Fatima Noor",
  "brideAge": 24,
  "nikahDate": "2026-04-15",
  "venue": "Mahallu Hall",
  "waliName": "Ibrahim Noor",
  "witness1": "Abdullah Khan",
  "witness2": "Hassan Ali",
  "mahrAmount": 12000,
  "mahrDescription": "Gold 12g",
  "status": "approved",
  "remarks": "Updated nikah date"
}
```

##### Updatable Fields

| Field              | Type     | Description                            |
|--------------------|----------|----------------------------------------|
| `groomName`        | string   | Groom's name                           |
| `groomAge`         | number   | Groom's age                            |
| `groomId`          | ObjectId | Groom member ID                        |
| `brideName`        | string   | Bride's name                           |
| `brideAge`         | number   | Bride's age                            |
| `brideId`          | ObjectId | Bride member ID                        |
| `mahallMemberType` | string   | `groom` or `bride`                     |
| `nikahDate`        | string   | New nikah date                         |
| `venue`            | string   | Updated venue                          |
| `mahallId`         | string   | Mahallu ID                             |
| `waliName`         | string   | Wali name                              |
| `witness1`         | string   | First witness                          |
| `witness2`         | string   | Second witness                         |
| `mahrAmount`       | number   | Mahr amount                            |
| `mahrDescription`  | string   | Mahr description                       |
| `status`           | string   | `pending`, `approved`, `rejected`      |
| `remarks`          | string   | Admin remarks                          |

##### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6001",
    "groomId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
    "groomName": "Ahmed Rashid",
    "brideName": "Fatima Noor",
    "nikahDate": "2026-04-15T00:00:00.000Z",
    "status": "approved",
    "remarks": "All documents verified",
    "updatedAt": "2026-03-03T11:00:00.000Z"
  }
}
```

---

### 12.2 Death Registration — Admin CRUD

#### GET `/api/registrations/death`

List all Death registrations with filters and pagination.

##### Query Params

| Param      | Type    | Required | Description                              |
|------------|---------|----------|------------------------------------------|
| `status`   | string  | No       | `pending`, `approved`, `rejected`        |
| `search`   | string  | No       | Search by deceased name                  |
| `dateFrom` | string  | No       | Filter from date `YYYY-MM-DD`            |
| `dateTo`   | string  | No       | Filter to date `YYYY-MM-DD`              |
| `page`     | integer | No       | Page number (default: 1)                 |
| `limit`    | integer | No       | Items per page (default: 10, max: 100)   |

##### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a6050",
      "tenantId": "65f1a2b3c4d5e6f7890a0001",
      "deceasedId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
      "deceasedName": "Ahmed Rashid",
      "familyId": { "_id": "65f1a2b3c4d5e6f7890a0010", "houseName": "Al-Rashid House" },
      "deathDate": "2026-03-03T00:00:00.000Z",
      "placeOfDeath": "General Hospital, Kozhikode",
      "causeOfDeath": "Natural causes",
      "informantName": "Ibrahim Rashid",
      "informantRelation": "Son",
      "informantPhone": "9876543210",
      "status": "pending",
      "createdAt": "2026-03-03T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

#### GET `/api/registrations/death/:id`

Get a single Death registration by ID.

---

#### POST `/api/registrations/death`

Create a Death registration directly (admin).

> **Side effect:** If `deceasedId` is provided, the linked Member record is automatically updated to `isDead: true` and `status: "inactive"`.

##### Request Body

```json
{
  "deceasedName": "Ahmed Rashid",
  "deceasedId": "65f1a2b3c4d5e6f7890a5678",
  "deathDate": "2026-03-03",
  "placeOfDeath": "General Hospital, Kozhikode",
  "causeOfDeath": "Natural causes",
  "mahallId": "MHL-001",
  "familyId": "65f1a2b3c4d5e6f7890a0010",
  "informantName": "Ibrahim Rashid",
  "informantRelation": "Son",
  "informantPhone": "9876543210",
  "status": "approved",
  "remarks": ""
}
```

##### Field Rules

| Field               | Type     | Required | Description                            |
|---------------------|----------|----------|----------------------------------------|
| `deceasedName`      | string   | **Yes**  | Deceased's full name                   |
| `deathDate`         | string   | **Yes**  | Date in `YYYY-MM-DD` format            |
| `deceasedId`        | ObjectId | No       | Member ID (triggers isDead side effect)|
| `placeOfDeath`      | string   | No       | Location/hospital of death             |
| `causeOfDeath`      | string   | No       | Cause of death                         |
| `mahallId`          | string   | No       | Mahallu ID                             |
| `familyId`          | ObjectId | No       | Family ID                              |
| `informantName`     | string   | No       | Informant's name                       |
| `informantRelation` | string   | No       | Relation to deceased                   |
| `informantPhone`    | string   | No       | Informant's phone                      |
| `status`            | string   | No       | `pending`, `approved`, `rejected`      |
| `remarks`           | string   | No       | Admin remarks                          |

##### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6051",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "deceasedName": "Ahmed Rashid",
    "deceasedId": "65f1a2b3c4d5e6f7890a5678",
    "deathDate": "2026-03-03T00:00:00.000Z",
    "status": "approved",
    "createdAt": "2026-03-03T10:30:00.000Z"
  }
}
```

---

#### PUT `/api/registrations/death/:id`

Update a Death registration.

##### Request Body — Approve

```json
{
  "status": "approved",
  "remarks": "Verified with hospital records"
}
```

##### Request Body — Reject

```json
{
  "status": "rejected",
  "remarks": "Death certificate not submitted"
}
```

##### Updatable Fields

| Field               | Type     | Description                        |
|---------------------|----------|------------------------------------|
| `deceasedName`      | string   | Updated name                       |
| `deceasedId`        | ObjectId | Link to member                     |
| `deathDate`         | string   | Updated date                       |
| `placeOfDeath`      | string   | Updated location                   |
| `causeOfDeath`      | string   | Updated cause                      |
| `mahallId`          | string   | Mahallu ID                         |
| `familyId`          | ObjectId | Family link                        |
| `informantName`     | string   | Informant name                     |
| `informantRelation` | string   | Informant relation                 |
| `informantPhone`    | string   | Informant phone                    |
| `status`            | string   | `pending`, `approved`, `rejected`  |
| `remarks`           | string   | Admin remarks                      |

---

### 12.3 NOC — Admin CRUD

#### GET `/api/registrations/noc`

List all NOCs with filters and pagination.

##### Query Params

| Param    | Type    | Required | Description                              |
|----------|---------|----------|------------------------------------------|
| `type`   | string  | No       | `common` or `nikah`                      |
| `status` | string  | No       | `pending`, `approved`, `rejected`        |
| `search` | string  | No       | Search by applicant name                 |
| `page`   | integer | No       | Page number (default: 1)                 |
| `limit`  | integer | No       | Items per page (default: 10, max: 100)   |

##### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7890a6100",
      "tenantId": { "_id": "65f1a2b3c4d5e6f7890a0001", "name": "Al-Noor Mahallu" },
      "applicantId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
      "applicantName": "Ahmed Rashid",
      "applicantPhone": "9567374733",
      "type": "common",
      "purposeTitle": "Bank Loan",
      "purposeDescription": "NOC required for housing loan from SBI Bank",
      "status": "pending",
      "approvedBy": null,
      "issuedDate": null,
      "expiryDate": null,
      "remarks": "",
      "createdAt": "2026-03-03T09:10:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7890a6200",
      "applicantName": "Ahmed Rashid",
      "type": "nikah",
      "nikahRegistrationId": {
        "_id": "65f1a2b3c4d5e6f7890a6001",
        "groomName": "Ahmed Rashid",
        "brideName": "Fatima Noor",
        "nikahDate": "2026-04-10T00:00:00.000Z",
        "status": "pending"
      },
      "status": "pending",
      "createdAt": "2026-03-03T09:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

#### GET `/api/registrations/noc/:id`

Get a single NOC by ID, with populated `applicantId` and `nikahRegistrationId`.

##### Success Response `200`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6100",
    "applicantId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
    "applicantName": "Ahmed Rashid",
    "applicantPhone": "9567374733",
    "type": "common",
    "purposeTitle": "Bank Loan",
    "purposeDescription": "NOC required for housing loan from SBI Bank",
    "status": "approved",
    "approvedBy": "Admin User",
    "issuedDate": "2026-03-03T00:00:00.000Z",
    "expiryDate": "2026-09-03T00:00:00.000Z",
    "remarks": "Approved for SBI housing loan",
    "createdAt": "2026-03-03T09:10:00.000Z",
    "updatedAt": "2026-03-03T11:00:00.000Z"
  }
}
```

---

#### POST `/api/registrations/noc`

Create a NOC directly (admin-created).

> **Defaults:** Admin-created NOCs default to `status: "approved"`, with `issuedDate` auto-set to today and `approvedBy` set to the logged-in admin's name.

##### Request Body — Common NOC (Admin Direct Issue)

```json
{
  "applicantName": "Ahmed Rashid",
  "applicantId": "65f1a2b3c4d5e6f7890a5678",
  "applicantPhone": "9567374733",
  "type": "common",
  "purposeTitle": "Travel NOC",
  "purposeDescription": "NOC for travel to Saudi Arabia for Hajj",
  "issuedDate": "2026-03-03",
  "expiryDate": "2026-09-03",
  "remarks": "Issued for Hajj travel"
}
```

##### Request Body — Nikah NOC (Admin Direct Issue)

```json
{
  "applicantName": "Ahmed Rashid",
  "applicantId": "65f1a2b3c4d5e6f7890a5678",
  "applicantPhone": "9567374733",
  "type": "nikah",
  "purposeTitle": "Nikah NOC",
  "purposeDescription": "NOC for marriage registration",
  "nikahRegistrationId": "65f1a2b3c4d5e6f7890a6001",
  "issuedDate": "2026-03-03",
  "expiryDate": "2026-06-03",
  "status": "approved",
  "remarks": "Nikah documents verified"
}
```

##### Field Rules

| Field                  | Type     | Required        | Description                                                            |
|------------------------|----------|-----------------|------------------------------------------------------------------------|
| `applicantName`        | string   | **Yes**         | Applicant's full name                                                  |
| `type`                 | string   | **Yes**         | `common` or `nikah`                                                    |
| `purposeTitle`         | string   | **Yes*** or `purpose` | Short title. Can use `purpose` field instead                    |
| `purposeDescription`   | string   | **Yes*** or `purpose` | Detailed description. Can use `purpose` field instead           |
| `purpose`              | string   | Alt for above   | Single field used for both `purposeTitle` and `purposeDescription`     |
| `applicantId`          | ObjectId | No              | Member ID of applicant                                                 |
| `applicantPhone`       | string   | No              | Applicant's phone                                                      |
| `nikahRegistrationId`  | ObjectId | No (nikah only) | Linked NikahRegistration ID                                            |
| `issuedDate`           | string   | No              | Issue date (default: today when admin creates)                         |
| `expiryDate`           | string   | No              | Expiry date                                                            |
| `status`               | string   | No              | Default: `approved` for admin-created NOCs                             |
| `remarks`              | string   | No              | Admin remarks                                                          |

> `tenantId` is auto-set from admin session. `approvedBy` is auto-set to the admin's name.

##### Success Response `201`

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6300",
    "tenantId": "65f1a2b3c4d5e6f7890a0001",
    "applicantName": "Ahmed Rashid",
    "applicantId": "65f1a2b3c4d5e6f7890a5678",
    "applicantPhone": "9567374733",
    "type": "common",
    "purposeTitle": "Travel NOC",
    "purposeDescription": "NOC for travel to Saudi Arabia for Hajj",
    "status": "approved",
    "approvedBy": "Admin User",
    "issuedDate": "2026-03-03T00:00:00.000Z",
    "expiryDate": "2026-09-03T00:00:00.000Z",
    "remarks": "Issued for Hajj travel",
    "createdAt": "2026-03-03T10:00:00.000Z"
  }
}
```

---

#### PUT `/api/registrations/noc/:id`

Update a NOC — approve, reject, or edit details.

> **Auto behaviour on approve:** `approvedBy` is set to the logged-in admin's name. If `issuedDate` is not provided, it defaults to today's date.

##### Request Body — Approve NOC

```json
{
  "status": "approved",
  "issuedDate": "2026-03-03",
  "expiryDate": "2026-09-03",
  "remarks": "All documents verified and NOC approved"
}
```

##### Request Body — Reject NOC

```json
{
  "status": "rejected",
  "remarks": "Incomplete documentation. Please resubmit with required documents."
}
```

##### Request Body — Update Details Only

```json
{
  "purposeTitle": "Updated Purpose",
  "purposeDescription": "Corrected description for the NOC request",
  "expiryDate": "2026-12-31",
  "remarks": "Updated by admin"
}
```

##### Updatable Fields

| Field                | Type   | Description                                     |
|----------------------|--------|-------------------------------------------------|
| `status`             | string | `pending`, `approved`, `rejected`               |
| `issuedDate`         | string | Issue date (auto-set on approve if not given)   |
| `expiryDate`         | string | Expiry date                                     |
| `purposeTitle`       | string | Updated purpose title                           |
| `purposeDescription` | string | Updated purpose description                     |
| `purpose`            | string | Alternative for both title + description        |
| `remarks`            | string | Admin remarks                                   |

> `approvedBy` is auto-set to the logged-in admin's name when `status = "approved"`.

##### Success Response `200` — Approved

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6100",
    "applicantId": { "_id": "65f1a2b3c4d5e6f7890a5678", "name": "Ahmed Rashid" },
    "applicantName": "Ahmed Rashid",
    "applicantPhone": "9567374733",
    "type": "common",
    "purposeTitle": "Bank Loan",
    "purposeDescription": "NOC required for housing loan from SBI Bank",
    "status": "approved",
    "approvedBy": "Admin User",
    "issuedDate": "2026-03-03T00:00:00.000Z",
    "expiryDate": "2026-09-03T00:00:00.000Z",
    "remarks": "All documents verified and NOC approved",
    "nikahRegistrationId": null,
    "updatedAt": "2026-03-03T11:00:00.000Z"
  }
}
```

##### Success Response `200` — Rejected

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6101",
    "applicantName": "Ahmed Rashid",
    "type": "common",
    "status": "rejected",
    "approvedBy": null,
    "remarks": "Incomplete documentation. Please resubmit with required documents.",
    "updatedAt": "2026-03-03T11:05:00.000Z"
  }
}
```

---

### NOC Full Lifecycle Summary

```
Member submits  →  status: "pending"   (via POST /member-user/registrations/noc)
Admin reviews   →  status: "approved"  (via PUT /registrations/noc/:id)
                   • approvedBy = admin name
                   • issuedDate = today (if not specified)
                OR  status: "rejected"
                   • remarks = rejection reason
Member views    →  GET /member-user/registrations?type=noc
```

### Nikah NOC Lifecycle (Auto-linked NikahRegistration)

```
Member submits Nikah NOC  →  Creates NikahRegistration + NOC (both pending)
                              (via POST /member-user/registrations/noc  with type="nikah")

Admin approves Nikah   →  PUT /registrations/nikah/:nikahRegId  { status: "approved" }
Admin approves NOC     →  PUT /registrations/noc/:nocId          { status: "approved" }

Member sees linked data  →  GET /member-user/registrations?type=noc
                             returns NOC with nikahRegistrationId populated
```

### Admin Access Levels

| Role         | Can See           | Can Create | Can Approve/Reject |
|--------------|-------------------|------------|--------------------|
| Super Admin  | All tenants       | Any tenant | Any tenant         |
| Mahall Admin | Own tenant only   | Own tenant | Own tenant         |
| Member       | Own records only  | Own (via member-user routes) | No |

---

## Quick Reference — All Member Portal Endpoints

| Method | Endpoint                                           | Description                          |
|--------|----------------------------------------------------|--------------------------------------|
| POST   | `/api/auth/send-otp`                               | Send OTP to member phone             |
| POST   | `/api/auth/verify-otp`                             | Verify OTP and get JWT token         |
| GET    | `/api/auth/me`                                     | Get current user info                |
| GET    | `/api/member-user/overview`                        | Full dashboard overview              |
| GET    | `/api/member-user/profile`                         | Get own member profile               |
| PUT    | `/api/member-user/profile`                         | Update phone/email                   |
| GET    | `/api/member-user/payments`                        | Payment history (varisangya + zakat) |
| GET    | `/api/member-user/varisangya`                      | Varisangya details with year filter  |
| POST   | `/api/member-user/payments/varisangya`             | Submit varisangya payment request    |
| POST   | `/api/member-user/payments/zakat`                  | Submit zakat payment request         |
| GET    | `/api/member-user/wallet`                          | Get wallet balance                   |
| GET    | `/api/member-user/wallet/transactions`             | Get wallet transaction history       |
| GET    | `/api/member-user/registrations`                   | All registrations (nikah/death/noc)  |
| POST   | `/api/member-user/registrations/nikah`             | Submit nikah registration            |
| POST   | `/api/member-user/registrations/death`             | Submit death registration            |
| POST   | `/api/member-user/registrations/noc`               | Submit NOC request                   |
| GET    | `/api/member-user/notifications`                   | Get notifications                    |
| GET    | `/api/member-user/programs`                        | View community programs              |
| GET    | `/api/member-user/feeds`                           | View community feeds                 |
| GET    | `/api/member-user/family-members`                  | Get family members list              |

---

## Quick Reference — Admin Registration CRUD Endpoints

| Method | Endpoint                             | Description                              |
|--------|--------------------------------------|------------------------------------------|
| GET    | `/api/registrations/nikah`           | List all nikah registrations             |
| GET    | `/api/registrations/nikah/:id`       | Get nikah registration by ID            |
| POST   | `/api/registrations/nikah`           | Create nikah registration (admin)       |
| PUT    | `/api/registrations/nikah/:id`       | Update / approve / reject nikah         |
| GET    | `/api/registrations/death`           | List all death registrations             |
| GET    | `/api/registrations/death/:id`       | Get death registration by ID            |
| POST   | `/api/registrations/death`           | Create death registration (admin)       |
| PUT    | `/api/registrations/death/:id`       | Update / approve / reject death         |
| GET    | `/api/registrations/noc`             | List all NOCs                            |
| GET    | `/api/registrations/noc/:id`         | Get NOC by ID                            |
| POST   | `/api/registrations/noc`             | Create NOC (admin direct issue)         |
| PUT    | `/api/registrations/noc/:id`         | Approve / reject / update NOC           |
