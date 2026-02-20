# Mahallu Management API — Full Endpoint Documentation

Base URL: `http://localhost:5000` (or your deployed URL)

**Common headers (authenticated routes):**
- `Accept: application/json`
- `Content-Type: application/json` (for POST/PUT)
- `Authorization: Bearer <token>`
- `x-tenant-id: <tenantId>` (where tenant context is required)

---

## Table of Contents
1. [Public](#1-public)
2. [Auth](#2-auth)
3. [Dashboard](#3-dashboard)
4. [Tenants (Super Admin)](#4-tenants-super-admin)
5. [Users](#5-users)
6. [Families](#6-families)
7. [Members](#7-members)
8. [Institutes](#8-institutes)
9. [Programs](#9-programs)
10. [Madrasa](#10-madrasa)
11. [Committees](#11-committees)
12. [Meetings](#12-meetings)
13. [Registrations](#13-registrations)
14. [Collectibles](#14-collectibles)
15. [Social](#15-social)
16. [Reports](#16-reports)
17. [Notifications](#17-notifications)
18. [Master Accounts](#18-master-accounts)
19. [Member User](#19-member-user)

---

## 1. Public

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Health check | No |
| `GET` | `/api-docs` | Swagger UI | No |

### GET /api/health
- **Description:** Server health check.
- **Headers:** `Accept: application/json`
- **Response:** Health status payload.

### GET /api-docs
- **Description:** Interactive API documentation (Swagger).

---

## 2. Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login with phone & password | No |
| `POST` | `/api/auth/send-otp` | Send OTP to phone | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP | No |
| `GET` | `/api/auth/me` | Current user profile | Yes |
| `POST` | `/api/auth/change-password` | Change password | Yes |

### POST /api/auth/login
- **Body:**
```json
{
  "phone": "9999999999",
  "password": "admin123"
}
```
- **Response:** JWT token and user/tenant info.

### POST /api/auth/send-otp
- **Body:**
```json
{
  "phone": "9999999999"
}
```

### POST /api/auth/verify-otp
- **Body:**
```json
{
  "phone": "9999999999",
  "otp": "123456"
}
```

### GET /api/auth/me
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Response:** Current user and tenant context.

### POST /api/auth/change-password
- **Headers:** `Authorization`, `x-tenant-id`
- **Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## 3. Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dashboard/stats` | Dashboard statistics | Yes |
| `GET` | `/api/dashboard/recent-families` | Recent families | Yes |
| `GET` | `/api/dashboard/activity-timeline` | Activity timeline | Yes |
| `GET` | `/api/dashboard/financial-summary` | Financial balance summary | Yes |

All require: `Authorization`, `x-tenant-id`.

---

## 4. Tenants (Super Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tenants` | List tenants | Yes |
| `GET` | `/api/tenants/:tenantId` | Get tenant by ID | Yes |
| `GET` | `/api/tenants/:tenantId/stats` | Get tenant stats | Yes |
| `POST` | `/api/tenants` | Create tenant | Yes |
| `PUT` | `/api/tenants/:tenantId` | Update tenant | Yes |
| `DELETE` | `/api/tenants/:tenantId` | Delete tenant | Yes |
| `POST` | `/api/tenants/:tenantId/suspend` | Suspend tenant | Yes |
| `POST` | `/api/tenants/:tenantId/activate` | Activate tenant | Yes |

### POST /api/tenants
- **Body:**
```json
{
  "name": "Kozhikode Mahallu",
  "code": "KOZ001",
  "address": {
    "state": "Kerala",
    "district": "Kozhikode",
    "lsgName": "Kozhikode Corporation",
    "village": "Kozhikode"
  }
}
```

### PUT /api/tenants/:tenantId
- **Body (example):**
```json
{
  "name": "Kozhikode Mahallu Updated",
  "status": "active"
}
```

---

## 5. Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users` | List users | Yes |
| `GET` | `/api/users/:userId` | Get user by ID | Yes |
| `POST` | `/api/users` | Create user | Yes |
| `PUT` | `/api/users/:userId` | Update user | Yes |
| `PUT` | `/api/users/:userId/status` | Update user status | Yes |
| `DELETE` | `/api/users/:userId` | Delete user (soft) | Yes |

### POST /api/users
- **Body:**
```json
{
  "name": "Ahmed Ali",
  "phone": "9876543210",
  "email": "ahmed@example.com",
  "role": "mahall",
  "password": "password123",
  "permissions": {
    "view": true,
    "add": true,
    "edit": true,
    "delete": false
  }
}
```

### PUT /api/users/:userId/status
- **Body:** `{ "status": "inactive" }`

---

## 6. Families

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/families` | List families | Yes |
| `GET` | `/api/families/:familyId` | Get family by ID | Yes |
| `POST` | `/api/families` | Create family | Yes |
| `PUT` | `/api/families/:familyId` | Update family | Yes |
| `DELETE` | `/api/families/:familyId` | Delete family | Yes |

### POST /api/families
- **Body:**
```json
{
  "houseName": "Al-Hamd House",
  "state": "Kerala",
  "district": "Kozhikode",
  "lsgName": "Kozhikode Corporation",
  "village": "Kozhikode"
}
```

### PUT /api/families/:familyId
- **Body (example):** `{ "status": "approved" }`

---

## 7. Members

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/members` | List members | Yes |
| `GET` | `/api/members/family/:familyId` | Get members by family | Yes |
| `GET` | `/api/members/:memberId` | Get member by ID | Yes |
| `POST` | `/api/members` | Create member | Yes |
| `PUT` | `/api/members/:memberId` | Update member | Yes |
| `PUT` | `/api/members/:memberId/status` | Update member status | Yes |
| `DELETE` | `/api/members/:memberId` | Delete member (soft) | Yes |

### POST /api/members
- **Body:**
```json
{
  "name": "Ahmed Ali",
  "familyId": "<familyId>",
  "familyName": "Al-Hamd House"
}
```

### PUT /api/members/:memberId/status
- **Body:** `{ "status": "inactive" }`

---

## 8. Institutes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/institutes` | List institutes | Yes |
| `GET` | `/api/institutes/:instituteId` | Get institute by ID | Yes |
| `POST` | `/api/institutes` | Create institute | Yes |
| `PUT` | `/api/institutes/:instituteId` | Update institute | Yes |
| `DELETE` | `/api/institutes/:instituteId` | Delete institute | Yes |

### POST /api/institutes
- **Body:**
```json
{
  "name": "Al-Azhar Institute",
  "place": "Kozhikode",
  "type": "institute"
}
```

### PUT /api/institutes/:instituteId
- **Body (example):** `{ "status": "active" }`

---

## 9. Programs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/programs` | List programs | Yes |
| `GET` | `/api/programs/:programId` | Get program by ID | Yes |
| `POST` | `/api/programs` | Create program | Yes |
| `PUT` | `/api/programs/:programId` | Update program | Yes |
| `DELETE` | `/api/programs/:programId` | Delete program | Yes |

### POST /api/programs
- **Body:**
```json
{
  "name": "Youth Education Program",
  "place": "Kozhikode",
  "type": "program"
}
```

### PUT /api/programs/:programId
- **Body (example):** `{ "status": "active" }`

---

## 10. Madrasa

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/madrasa` | List madrasas | Yes |
| `GET` | `/api/madrasa/:madrasaId` | Get madrasa by ID | Yes |
| `POST` | `/api/madrasa` | Create madrasa | Yes |
| `PUT` | `/api/madrasa/:madrasaId` | Update madrasa | Yes |
| `DELETE` | `/api/madrasa/:madrasaId` | Delete madrasa | Yes |

### POST /api/madrasa
- **Body:**
```json
{
  "name": "Darul Uloom Madrasa",
  "place": "Kozhikode",
  "type": "madrasa"
}
```

### PUT /api/madrasa/:madrasaId
- **Body (example):** `{ "status": "active" }`

---

## 11. Committees

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/committees` | List committees | Yes |
| `GET` | `/api/committees/:committeeId` | Get committee by ID | Yes |
| `GET` | `/api/committees/:committeeId/meetings` | Get committee meetings | Yes |
| `POST` | `/api/committees` | Create committee | Yes |
| `PUT` | `/api/committees/:committeeId` | Update committee | Yes |
| `DELETE` | `/api/committees/:committeeId` | Delete committee | Yes |

### POST /api/committees
- **Body:**
```json
{
  "name": "Finance Committee",
  "description": "Manages financial matters"
}
```

### PUT /api/committees/:committeeId
- **Body (example):** `{ "status": "active" }`

---

## 12. Meetings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/meetings` | List meetings | Yes |
| `GET` | `/api/meetings/:meetingId` | Get meeting by ID | Yes |
| `POST` | `/api/meetings` | Create meeting | Yes |
| `PUT` | `/api/meetings/:meetingId` | Update meeting | Yes |
| `DELETE` | `/api/meetings/:meetingId` | Delete meeting | Yes |

### POST /api/meetings
- **Body:**
```json
{
  "committeeId": "<committeeId>",
  "title": "Monthly Meeting",
  "meetingDate": "2024-02-01T10:00:00.000Z"
}
```

### PUT /api/meetings/:meetingId
- **Body (example):** `{ "status": "completed" }`

---

## 13. Registrations

### Nikah
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/nikah` | List nikah registrations | Yes |
| `GET` | `/api/registrations/nikah/:nikahId` | Get nikah by ID | Yes |
| `POST` | `/api/registrations/nikah` | Create nikah registration | Yes |

**POST body (nikah):**
```json
{
  "groomName": "Ahmed Ali",
  "brideName": "Fatima Khan",
  "nikahDate": "2024-02-14T10:00:00.000Z"
}
```

### Death
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/death` | List death registrations | Yes |
| `GET` | `/api/registrations/death/:deathId` | Get death by ID | Yes |
| `POST` | `/api/registrations/death` | Create death registration | Yes |

**POST body (death):**
```json
{
  "deceasedName": "Ahmed Ali",
  "deathDate": "2024-02-10T00:00:00.000Z"
}
```

### NOC
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/noc` | List NOCs | Yes |
| `GET` | `/api/registrations/noc/:nocId` | Get NOC by ID | Yes |
| `POST` | `/api/registrations/noc` | Create NOC | Yes |
| `PUT` | `/api/registrations/noc/:nocId` | Update NOC | Yes |

**POST body (NOC):**
```json
{
  "applicantName": "Ahmed Ali",
  "purpose": "Travel abroad for business",
  "type": "common"
}
```

**PUT body (NOC):**
```json
{
  "status": "approved",
  "remarks": "Approved"
}
```

---

## 14. Collectibles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/collectibles/varisangya` | List varisangya | Yes |
| `POST` | `/api/collectibles/varisangya` | Create varisangya | Yes |
| `GET` | `/api/collectibles/zakat` | List zakat | Yes |
| `POST` | `/api/collectibles/zakat` | Create zakat | Yes |
| `GET` | `/api/collectibles/wallet` | Get wallets | Yes |
| `GET` | `/api/collectibles/wallet/:walletId/transactions` | Get wallet transactions | Yes |

### POST /api/collectibles/varisangya
- **Body:**
```json
{
  "familyId": "<familyId>",
  "amount": 500,
  "paymentDate": "2024-02-01T00:00:00.000Z",
  "paymentMethod": "Cash"
}
```

### POST /api/collectibles/zakat
- **Body:**
```json
{
  "payerName": "Ahmed Ali",
  "amount": 1000,
  "paymentDate": "2024-02-01T00:00:00.000Z"
}
```

---

## 15. Social

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/social/banners` | List banners | Yes |
| `POST` | `/api/social/banners` | Create banner | Yes |
| `GET` | `/api/social/feeds` | List feeds | Yes |
| `POST` | `/api/social/feeds` | Create feed | Yes |
| `GET` | `/api/social/activity-logs` | Activity logs | Yes |
| `GET` | `/api/social/support` | List support tickets | Yes |
| `POST` | `/api/social/support` | Create support ticket | Yes |
| `PUT` | `/api/social/support/:supportId` | Update support ticket | Yes |

### POST /api/social/banners
- **Body:**
```json
{
  "title": "Ramadan Mubarak",
  "image": "https://example.com/banner.jpg"
}
```

### POST /api/social/feeds
- **Body:**
```json
{
  "title": "Announcement",
  "content": "Message",
  "authorId": "<userId>"
}
```

### POST /api/social/support
- **Body:**
```json
{
  "subject": "Login Issue",
  "message": "Unable to login"
}
```

### PUT /api/social/support/:supportId
- **Body:**
```json
{
  "status": "in_progress",
  "response": "We are checking"
}
```

---

## 16. Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/reports/area` | Area report | Yes |
| `GET` | `/api/reports/blood-bank` | Blood bank report | Yes |
| `GET` | `/api/reports/orphans` | Orphans report | Yes |

All require: `Authorization`, `x-tenant-id`.

### Accounting Reports (Balance Details)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/accounting-reports/trial-balance` | Trial balance (debit/credit totals) | Yes |
| `GET` | `/api/accounting-reports/balance-sheet` | Balance sheet (assets, liabilities, summary) | Yes |

### GET /api/accounting-reports/trial-balance
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Query params (optional):**
  - `instituteId` (string)
  - `asOfDate` (date in `YYYY-MM-DD`)
- **Response:** Trial balance with debit and credit columns by ledger.

### GET /api/accounting-reports/balance-sheet
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Query params (optional):**
  - `instituteId` (string)
  - `asOfDate` (date in `YYYY-MM-DD`)
- **Response:** Balance sheet with assets, liabilities, income, expenses, and summary.

---

## 17. Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | List notifications | Yes |
| `POST` | `/api/notifications` | Create notification | Yes |
| `PUT` | `/api/notifications/:notificationId/read` | Mark as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all as read | Yes |

### POST /api/notifications
- **Body:**
```json
{
  "recipientType": "all",
  "title": "Announcement",
  "message": "Message",
  "type": "info"
}
```

---

## 18. Master Accounts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/master-accounts/institute` | List institute accounts | Yes |
| `POST` | `/api/master-accounts/institute` | Create institute account | Yes |
| `GET` | `/api/master-accounts/categories` | List categories | Yes |
| `POST` | `/api/master-accounts/categories` | Create category | Yes |
| `GET` | `/api/master-accounts/wallets` | List master wallets | Yes |
| `POST` | `/api/master-accounts/wallets` | Create master wallet | Yes |
| `GET` | `/api/master-accounts/ledgers` | List ledgers | Yes |
| `POST` | `/api/master-accounts/ledgers` | Create ledger | Yes |
| `GET` | `/api/master-accounts/ledger-items` | List ledger items | Yes |
| `POST` | `/api/master-accounts/ledger-items` | Create ledger item | Yes |

### POST /api/master-accounts/institute
- **Body:** `{ "instituteId": "<instituteId>", "accountName": "Main Account" }`

### POST /api/master-accounts/categories
- **Body:** `{ "name": "Donations", "type": "income" }`

### POST /api/master-accounts/wallets
- **Body:** `{ "name": "Main Wallet", "type": "main", "balance": 0 }`

### POST /api/master-accounts/ledgers
- **Body:** `{ "name": "Monthly Income", "type": "income" }`

### POST /api/master-accounts/ledger-items
- **Body:**
```json
{
  "ledgerId": "<ledgerId>",
  "date": "2024-02-01T00:00:00.000Z",
  "amount": 5000,
  "description": "Monthly donation collection"
}
```

---

## 19. Member User

Member-facing endpoints (use `Authorization: Bearer <token>`; `x-tenant-id` typically not required).

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/member-user/profile` | Get own profile | Yes |
| `PUT` | `/api/member-user/profile` | Update own profile | Yes |
| `GET` | `/api/member-user/payments` | Get own payments | Yes |
| `GET` | `/api/member-user/wallet` | Get own wallet | Yes |
| `GET` | `/api/member-user/wallet/transactions` | Get own wallet transactions | Yes |
| `POST` | `/api/member-user/payments/varisangya` | Request varisangya payment | Yes |
| `POST` | `/api/member-user/payments/zakat` | Request zakat payment | Yes |
| `GET` | `/api/member-user/registrations` | Get own registrations | Yes |
| `POST` | `/api/member-user/registrations/nikah` | Request nikah registration | Yes |
| `POST` | `/api/member-user/registrations/death` | Request death registration | Yes |
| `POST` | `/api/member-user/registrations/noc` | Request NOC | Yes |
| `GET` | `/api/member-user/notifications` | Get own notifications | Yes |
| `GET` | `/api/member-user/programs` | Get community programs | Yes |
| `GET` | `/api/member-user/feeds` | Get public feeds | Yes |
| `GET` | `/api/member-user/family-members` | Get own family members | Yes |

### PUT /api/member-user/profile
- **Body:** `{ "phone": "9876543210", "email": "me@example.com" }`

### POST /api/member-user/payments/varisangya
- **Body:** `{ "amount": 500, "paymentDate": "2024-02-01" }`

### POST /api/member-user/payments/zakat
- **Body:** `{ "amount": 1000, "paymentDate": "2024-02-01" }`

### POST /api/member-user/registrations/nikah
- **Body:** `{ "brideName": "Fatima Khan", "nikahDate": "2024-02-14" }`

### POST /api/member-user/registrations/death
- **Body:** `{ "deathDate": "2024-02-10" }`

### POST /api/member-user/registrations/noc
- **Body:** `{ "purpose": "Travel", "type": "common" }`

---

## Summary: Total Endpoints by Section

| Section | Count |
|---------|-------|
| Public | 2 |
| Auth | 5 |
| Dashboard | 4 |
| Tenants | 8 |
| Users | 6 |
| Families | 5 |
| Members | 7 |
| Institutes | 5 |
| Programs | 5 |
| Madrasa | 5 |
| Committees | 6 |
| Meetings | 5 |
| Registrations | 10 |
| Collectibles | 6 |
| Social | 8 |
| Reports | 5 |
| Notifications | 4 |
| Master Accounts | 10 |
| Member User | 15 |
| **Total** | **~125** |

---

*Generated from Mahallu API Postman Collection (AUTO). For interactive docs, use `GET /api-docs`.*
