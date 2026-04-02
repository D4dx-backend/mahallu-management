# Mahallu Management API — Full Endpoint Documentation

Base URL: `http://localhost:5000` (or your deployed URL)

**Common headers (authenticated routes):**
- `Accept: application/json`
- `Content-Type: application/json` (for POST/PUT)
- `Authorization: Bearer <token>`
- `x-tenant-id: <tenantId>` (where tenant context is required)

## Authentication & Authorization

- **Auth mechanism:** JWT Bearer tokens (`Authorization: Bearer <token>`).
- **Token issuance:**
  - Password login: `POST /api/auth/login` (non-member roles).
  - OTP login: `POST /api/auth/verify-otp` (member + multi-role aware).
  - Multi-role handoff: `POST /api/auth/select-account` using `preAuthToken` (expires in 5 minutes).
- **Tenant context:** `x-tenant-id` can be provided, especially for super admin tenant-scoped access.
- **Institute context (optional):** `x-institute-id` is supported for super admin / mahall role filtering where applicable.
- **Role protection:**
  - `superAdminOnly` middleware on super-admin resources.
  - `allowRoles([...])` middleware on role-scoped endpoints.
  - `memberUserOnly` middleware on member portal routes.

## Standard Response Envelope

### Success Example
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Example
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "msg": "Validation message",
      "path": "fieldName",
      "location": "body"
    }
  ]
}
```

## Status Code Conventions

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation or malformed request |
| `401` | Authentication failed / invalid token / invalid OTP |
| `403` | Authenticated but forbidden (inactive/role mismatch) |
| `404` | Resource not found |
| `409` | Conflict (duplicate/uniqueness issues where implemented) |
| `429` | Rate limited |
| `500` | Internal server error |

## CRUD Quick Matrix

| Resource | Create | Read (List/Single) | Update | Delete |
|----------|--------|--------------------|--------|--------|
| Tenants | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ |
| Families | ✅ | ✅ | ✅ | ✅ |
| Members | ✅ | ✅ | ✅ | ✅ |
| Institutes | ✅ | ✅ | ✅ | ✅ |
| Programs | ✅ | ✅ | ✅ | ✅ |
| Committees | ✅ | ✅ | ✅ | ✅ |
| Meetings | ✅ | ✅ | ✅ | ✅ |
| Registrations (Nikah/Death/NOC) | ✅ | ✅ | ✅ | ❌ |
| Collectibles (Varisangya/Zakat) | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | ✅ | ✅ |
| Assets (+ maintenance) | ✅ | ✅ | ✅ | ✅ |
| Petty Cash | ✅ | ✅ | ✅ | ❌ |
| Salary Payments | ✅ | ✅ | ✅ | ✅ |
| Social | ✅ | ✅ | ✅ (support status) | ❌ |
| Notifications | ✅ | ✅ | ✅ (read/read-all) | ❌ |
| Master Accounts | ✅ | ✅ | ✅ | ✅ |
| Member User | Request/Action APIs | ✅ | ✅ (profile) | ❌ |
| Upload | ✅ | ❌ | ❌ | ❌ |

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
10. [Committees](#10-committees)
11. [Meetings](#11-meetings)
12. [Registrations](#12-registrations)
13. [Collectibles](#13-collectibles)
14. [Employees](#14-employees)
15. [Assets](#15-assets)
16. [Petty Cash](#16-petty-cash)
17. [Salary](#17-salary)
18. [Social](#18-social)
19. [Reports](#19-reports)
20. [Accounting Reports](#20-accounting-reports)
21. [Notifications](#21-notifications)
22. [Master Accounts](#22-master-accounts)
23. [Member User](#23-member-user)
24. [Upload](#24-upload)

---

## 1. Public

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Health check | No |
| `GET` | `/api-docs` | Swagger UI | No |

### GET /api/health
- **Response:** Server health status.

### GET /api-docs
- **Description:** Interactive Swagger UI documentation.

---

## 2. Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login with phone & password | No |
| `POST` | `/api/auth/send-otp` | Send OTP to phone | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP (returns role selector if multi-role) | No |
| `POST` | `/api/auth/select-account` | Select account role after multi-role OTP login | No |
| `GET` | `/api/auth/me` | Current user profile | Yes |
| `POST` | `/api/auth/change-password` | Change password | Yes |
| `PUT` | `/api/auth/register-device` | Register OneSignal device ID | Yes |

> **Multi-Role Login Flow:** If the same phone number is linked to multiple roles (e.g. Community Member + Mahallu Admin + Institute Admin) within the same mahallu, `verify-otp` returns `requiresRoleSelection: true` instead of a token. The client must then call `select-account` with the chosen `userId` and the `preAuthToken` to receive the session JWT.

### POST /api/auth/login
- **Note:** For non-member roles only. Members must use OTP login.
- **Body:**
```json
{
  "phone": "9999999999",
  "password": "admin123"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Ahmed Ali", "phone": "9999999999", "role": "mahall", "tenantId": "...", "status": "active" },
    "token": "eyJhbGci..."
  }
}
```
- **Errors:** `400` validation, `401` invalid credentials, `403` inactive/member account

### POST /api/auth/send-otp
- **Body:**
```json
{
  "phone": "9999999999"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```
- `otp` field is only returned in **development** mode.
- **Errors:** `400` validation, `403` inactive, `404` user not found, `429` rate limited (max 1/min)

#### Special Behavior: App Store Test User Auto-Provisioning (New)

There is **no separate endpoint** for test-user creation. The logic is built into `POST /api/auth/send-otp`.

- If phone is `8877665544` (normalized as `918877665544`):
  - System auto-creates test tenant + 3 role accounts (mahall, institute, member) on first request.
  - OTP is fixed to `123456`.
  - This allows deterministic review/testing without running a separate seed script.

**Test Request:**
```json
{
  "phone": "8877665544"
}
```

**Test Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
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
- **Response — single role (direct login, 200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Ahmed Ali", "role": "member", "tenantId": "...", "memberId": "..." },
    "token": "eyJhbGci..."
  }
}
```
- **Response — multiple roles (role selection required, 200):**
```json
{
  "success": true,
  "data": {
    "requiresRoleSelection": true,
    "preAuthToken": "eyJhbGci...",
    "accounts": [
      {
        "userId": "<userId>",
        "role": "member",
        "name": "Jahfar Swadikh K",
        "tenantId": "<tenantId>",
        "tenantName": "Al-Huda Mahallu"
      },
      {
        "userId": "<userId>",
        "role": "institute",
        "name": "Jahfar Swadikh K",
        "tenantId": "<tenantId>",
        "tenantName": "Al-Huda Mahallu",
        "instituteId": "<instituteId>",
        "instituteName": "Al-Huda Madrasa"
      }
    ]
  }
}
```
- `preAuthToken` expires in **5 minutes**. Pass it to `select-account`.
- **Errors:** `400` validation, `401` invalid/expired OTP, `403` inactive, `429` >5 failed attempts

### POST /api/auth/select-account
- **Body:**
```json
{
  "preAuthToken": "eyJhbGci...",
  "userId": "<userId from accounts list>"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Jahfar Swadikh K", "role": "member" },
    "token": "eyJhbGci..."
  }
}
```
- Issues a full **7-day** session JWT for the selected role.
- **Errors:** `400` missing fields, `401` expired/invalid preAuthToken or phone mismatch, `403` inactive, `404` user not found

### GET /api/auth/me
- **Headers:** `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Response (200):** `{ "success": true, "data": { <user object> } }`

### POST /api/auth/change-password
- **Headers:** `Authorization`, `x-tenant-id`
- **Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```
- **Response (200):** `{ "success": true, "message": "Password changed successfully" }`
- **Errors:** `400` validation, `401` wrong current password

### PUT /api/auth/register-device
- **Headers:** `Authorization`
- **Body:**
```json
{
  "oneSignalPlayerId": "<onesignal-player-id>"
}
```
- **Response (200):** `{ "success": true, "message": "Device registered successfully" }`

---

## 3. Dashboard

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dashboard/stats` | Dashboard statistics | Yes |
| `GET` | `/api/dashboard/recent-families` | Recent families | Yes |
| `GET` | `/api/dashboard/activity-timeline` | Activity timeline | Yes |
| `GET` | `/api/dashboard/financial-summary` | Financial balance summary | Yes |

### GET /api/dashboard/stats
- **Roles:** all
- **Response:** Total members, families, collections, programs, etc.

### GET /api/dashboard/recent-families
- **Roles:** super_admin, mahall, survey, institute

### GET /api/dashboard/activity-timeline
- **Roles:** super_admin, mahall, survey, institute

### GET /api/dashboard/financial-summary
- **Roles:** super_admin, mahall, institute

---

## 4. Tenants (Super Admin)

All require: `Authorization`. Super admin only unless noted.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tenants` | List all tenants | Yes |
| `GET` | `/api/tenants/:id` | Get tenant by ID | Yes |
| `GET` | `/api/tenants/:id/stats` | Get tenant statistics | Yes |
| `POST` | `/api/tenants` | Create tenant | Yes |
| `PUT` | `/api/tenants/:id` | Update tenant | Yes |
| `DELETE` | `/api/tenants/:id` | Delete tenant | Yes |
| `POST` | `/api/tenants/:id/suspend` | Suspend tenant | Yes |
| `POST` | `/api/tenants/:id/activate` | Activate tenant | Yes |

### POST /api/tenants
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

### PUT /api/tenants/:id
```json
{
  "name": "Kozhikode Mahallu Updated",
  "status": "active"
}
```

---

## 5. Users

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users` | List users | Yes |
| `GET` | `/api/users/:id` | Get user by ID | Yes |
| `POST` | `/api/users` | Create user | Yes |
| `PUT` | `/api/users/:id` | Update user | Yes |
| `PUT` | `/api/users/:id/status` | Update user status | Yes |
| `DELETE` | `/api/users/:id` | Delete user | Yes |

### POST /api/users
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
- `role` values: `mahall` | `survey` | `institute` | `member`
- For `institute` role, also include `"instituteId": "<id>"`

### PUT /api/users/:id
- Same fields as POST (all optional).

### PUT /api/users/:id/status
```json
{ "status": "inactive" }
```

---

## 6. Families

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/families` | List families | Yes |
| `GET` | `/api/families/:id` | Get family by ID | Yes |
| `POST` | `/api/families` | Create family | Yes |
| `PUT` | `/api/families/:id` | Update family | Yes |
| `DELETE` | `/api/families/:id` | Delete family | Yes |

### POST /api/families
```json
{
  "houseName": "Al-Hamd House",
  "state": "Kerala",
  "district": "Kozhikode",
  "lsgName": "Kozhikode Corporation",
  "village": "Kozhikode",
  "panchayathWardNo": "12",
  "postOffice": "Kozhikode",
  "pinCode": "673001"
}
```

### PUT /api/families/:id
```json
{
  "houseName": "Al-Hamd House Updated",
  "status": "approved"
}
```
- `status` values: `pending` | `approved` | `rejected`

---

## 7. Members

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/members` | List members | Yes |
| `GET` | `/api/members/family/:familyId` | Get members by family | Yes |
| `GET` | `/api/members/:id` | Get member by ID | Yes |
| `POST` | `/api/members` | Create member | Yes |
| `PUT` | `/api/members/:id` | Update member | Yes |
| `PUT` | `/api/members/:id/status` | Update member status | Yes |
| `DELETE` | `/api/members/:id` | Delete member | Yes |

### POST /api/members
```json
{
  "name": "Ahmed Ali",
  "familyId": "<familyId>",
  "familyName": "Al-Hamd House",
  "age": 30,
  "gender": "male",
  "bloodGroup": "A+ve",
  "phone": "9876543210",
  "email": "ahmed@example.com",
  "healthStatus": "Healthy",
  "education": "Degree",
  "maritalStatus": "Married",
  "numberOfMarriages": 1,
  "occupation": "Engineer",
  "monthlyIncome": 25000,
  "isOrphan": false,
  "isHandicapped": false,
  "isPensioner": false
}
```
- A member User account (`role: member`) is auto-created if `phone` is provided.
- A phone already used by another **member** account in the same tenant is rejected. Phones shared with other roles (e.g. institute admin) are allowed.

### PUT /api/members/:id
- Same fields as POST (all optional).

### PUT /api/members/:id/status
```json
{ "status": "inactive" }
```

---

## 8. Institutes

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/institutes` | List institutes | Yes |
| `GET` | `/api/institutes/:id` | Get institute by ID | Yes |
| `POST` | `/api/institutes` | Create institute | Yes |
| `PUT` | `/api/institutes/:id` | Update institute | Yes |
| `DELETE` | `/api/institutes/:id` | Delete institute | Yes |

### POST /api/institutes
```json
{
  "name": "Al-Azhar Institute",
  "place": "Kozhikode",
  "type": "institute",
  "description": "Educational institute",
  "phone": "9876540000",
  "email": "institute@example.com"
}
```
- `type` values: `institute` | `madrasa` | `orphanage` | `other`

### PUT /api/institutes/:id
```json
{
  "name": "Updated Name",
  "status": "active"
}
```

---

## 9. Programs

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/programs` | List programs | Yes |
| `GET` | `/api/programs/:id` | Get program by ID | Yes |
| `POST` | `/api/programs` | Create program | Yes |
| `PUT` | `/api/programs/:id` | Update program | Yes |
| `DELETE` | `/api/programs/:id` | Delete program | Yes |

### POST /api/programs
```json
{
  "name": "Youth Education Program",
  "description": "Annual education initiative",
  "place": "Kozhikode",
  "startDate": "2024-03-01T09:00:00.000Z",
  "endDate": "2024-03-01T17:00:00.000Z",
  "organizer": "Mahallu Committee",
  "type": "educational"
}
```

### PUT /api/programs/:id
```json
{
  "name": "Updated Program Name",
  "status": "completed"
}
```

---

## 10. Committees

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/committees` | List committees | Yes |
| `GET` | `/api/committees/:id` | Get committee by ID | Yes |
| `GET` | `/api/committees/:id/meetings` | Get meetings of a committee | Yes |
| `POST` | `/api/committees` | Create committee | Yes |
| `PUT` | `/api/committees/:id` | Update committee | Yes |
| `DELETE` | `/api/committees/:id` | Delete committee | Yes |

### POST /api/committees
```json
{
  "name": "Finance Committee",
  "description": "Manages financial matters of the mahallu",
  "members": [
    { "memberId": "<memberId>", "role": "chairman" },
    { "memberId": "<memberId>", "role": "secretary" }
  ]
}
```

### PUT /api/committees/:id
```json
{
  "name": "Updated Committee Name",
  "status": "active"
}
```

---

## 11. Meetings

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/meetings` | List meetings | Yes |
| `GET` | `/api/meetings/:id` | Get meeting by ID | Yes |
| `POST` | `/api/meetings` | Create meeting | Yes |
| `PUT` | `/api/meetings/:id` | Update meeting | Yes |
| `DELETE` | `/api/meetings/:id` | Delete meeting | Yes |

### POST /api/meetings
```json
{
  "committeeId": "<committeeId>",
  "title": "Monthly Finance Meeting",
  "description": "Review monthly finances",
  "meetingDate": "2024-02-01T10:00:00.000Z",
  "venue": "Mahallu Office",
  "agenda": "Financial review, upcoming programs"
}
```

### PUT /api/meetings/:id
```json
{
  "title": "Updated Meeting Title",
  "status": "completed",
  "minutes": "Meeting concluded with approval of budget."
}
```

---

## 12. Registrations

All require: `Authorization`, `x-tenant-id`.

### Nikah

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/nikah` | List nikah registrations | Yes |
| `GET` | `/api/registrations/nikah/:id` | Get nikah by ID | Yes |
| `POST` | `/api/registrations/nikah` | Create nikah registration | Yes |
| `PUT` | `/api/registrations/nikah/:id` | Update nikah registration | Yes |

#### POST /api/registrations/nikah
```json
{
  "groomName": "Ahmed Ali",
  "groomAge": 28,
  "groomAddress": "Kozhikode",
  "brideName": "Fatima Khan",
  "brideAge": 24,
  "brideAddress": "Malappuram",
  "nikahDate": "2024-02-14T10:00:00.000Z",
  "venue": "Mahallu Mosque",
  "mahr": 10000,
  "witnesses": ["Witness 1", "Witness 2"]
}
```

#### PUT /api/registrations/nikah/:id
```json
{
  "status": "approved",
  "remarks": "Documents verified"
}
```

### Death

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/death` | List death registrations | Yes |
| `GET` | `/api/registrations/death/:id` | Get death by ID | Yes |
| `POST` | `/api/registrations/death` | Create death registration | Yes |
| `PUT` | `/api/registrations/death/:id` | Update death registration | Yes |

#### POST /api/registrations/death
```json
{
  "deceasedName": "Ahmed Ali",
  "age": 65,
  "gender": "male",
  "deathDate": "2024-02-10T00:00:00.000Z",
  "causeOfDeath": "Natural causes",
  "familyId": "<familyId>",
  "memberId": "<memberId>"
}
```

#### PUT /api/registrations/death/:id
```json
{
  "status": "approved",
  "remarks": "Certificate issued"
}
```

### NOC

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/registrations/noc` | List NOCs | Yes |
| `GET` | `/api/registrations/noc/:id` | Get NOC by ID | Yes |
| `POST` | `/api/registrations/noc` | Create NOC | Yes |
| `PUT` | `/api/registrations/noc/:id` | Update NOC | Yes |

#### POST /api/registrations/noc
```json
{
  "applicantName": "Ahmed Ali",
  "memberId": "<memberId>",
  "purpose": "Travel abroad for employment",
  "type": "travel",
  "destination": "UAE",
  "requestDate": "2024-02-01T00:00:00.000Z"
}
```
- `type` values: `common` | `travel` | `employment` | `other`

#### PUT /api/registrations/noc/:id
```json
{
  "status": "approved",
  "remarks": "NOC granted"
}
```
- `status` values: `pending` | `approved` | `rejected`

---

## 13. Collectibles

All require: `Authorization`, `x-tenant-id`.

### Varisangya

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/collectibles/varisangya` | List varisangya collections | Yes |
| `GET` | `/api/collectibles/receipt-next` | Get next receipt number | Yes |
| `POST` | `/api/collectibles/varisangya` | Create varisangya | Yes |
| `PUT` | `/api/collectibles/varisangya/:id` | Update varisangya | Yes |
| `DELETE` | `/api/collectibles/varisangya/:id` | Delete varisangya | Yes |

#### POST /api/collectibles/varisangya
```json
{
  "familyId": "<familyId>",
  "amount": 500,
  "paymentDate": "2024-02-01T00:00:00.000Z",
  "paymentMethod": "Cash",
  "receiptNo": "REC-001",
  "collectedBy": "<userId>",
  "remarks": "Monthly collection"
}
```

#### PUT /api/collectibles/varisangya/:id
```json
{
  "amount": 600,
  "paymentMethod": "Bank Transfer",
  "remarks": "Updated amount"
}
```

### Zakat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/collectibles/zakat` | List zakat collections | Yes |
| `POST` | `/api/collectibles/zakat` | Create zakat | Yes |
| `PUT` | `/api/collectibles/zakat/:id` | Update zakat | Yes |
| `DELETE` | `/api/collectibles/zakat/:id` | Delete zakat | Yes |

#### POST /api/collectibles/zakat
```json
{
  "payerName": "Ahmed Ali",
  "memberId": "<memberId>",
  "amount": 1000,
  "paymentDate": "2024-02-01T00:00:00.000Z",
  "paymentMethod": "Cash",
  "zakatType": "fitr",
  "remarks": "Zakat al-Fitr"
}
```
- `zakatType` values: `fitr` | `mal` | `other`

#### PUT /api/collectibles/zakat/:id
```json
{
  "amount": 1200,
  "remarks": "Updated"
}
```

### Wallet

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/collectibles/wallet` | Get tenant wallet | Yes |
| `GET` | `/api/collectibles/wallet/:walletId/transactions` | Get wallet transactions | Yes |

#### GET /api/collectibles/wallet/:walletId/transactions
- **Query params (optional):** `page`, `limit`, `startDate`, `endDate`

---

## 14. Employees

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/employees` | List employees | Yes |
| `GET` | `/api/employees/:id` | Get employee by ID | Yes |
| `POST` | `/api/employees` | Create employee | Yes |
| `PUT` | `/api/employees/:id` | Update employee | Yes |
| `DELETE` | `/api/employees/:id` | Delete employee | Yes |

### POST /api/employees
```json
{
  "instituteId": "<instituteId>",
  "name": "Mohammed Rashid",
  "phone": "9876540001",
  "email": "rashid@example.com",
  "designation": "Teacher",
  "joiningDate": "2023-06-01T00:00:00.000Z",
  "salary": 15000,
  "status": "active",
  "address": "Kozhikode",
  "qualification": "B.Ed"
}
```
- `status` values: `active` | `inactive`

### PUT /api/employees/:id
```json
{
  "designation": "Senior Teacher",
  "salary": 18000,
  "status": "active"
}
```

---

## 15. Assets

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/assets` | List assets | Yes |
| `GET` | `/api/assets/:id` | Get asset by ID | Yes |
| `POST` | `/api/assets` | Create asset | Yes |
| `PUT` | `/api/assets/:id` | Update asset | Yes |
| `DELETE` | `/api/assets/:id` | Delete asset | Yes |
| `GET` | `/api/assets/:id/maintenance` | Get maintenance records | Yes |
| `POST` | `/api/assets/:id/maintenance` | Add maintenance record | Yes |
| `PUT` | `/api/assets/:id/maintenance/:maintenanceId` | Update maintenance record | Yes |
| `DELETE` | `/api/assets/:id/maintenance/:maintenanceId` | Delete maintenance record | Yes |

### POST /api/assets
```json
{
  "name": "Dell Laptop",
  "description": "Office laptop for admin use",
  "purchaseDate": "2023-01-15T00:00:00.000Z",
  "estimatedValue": 55000,
  "category": "electronics",
  "status": "in_use",
  "location": "Mahallu Office",
  "serialNumber": "DL-2023-001"
}
```
- `category` values: `furniture` | `electronics` | `vehicle` | `building` | `land` | `equipment` | `other`
- `status` values: `active` | `in_use` | `under_maintenance` | `disposed` | `damaged`

### PUT /api/assets/:id
```json
{
  "status": "under_maintenance",
  "location": "IT Department",
  "estimatedValue": 48000
}
```

### POST /api/assets/:id/maintenance
```json
{
  "maintenanceDate": "2024-01-10T00:00:00.000Z",
  "description": "Annual servicing and battery replacement",
  "cost": 3500,
  "performedBy": "Tech Solutions",
  "nextMaintenanceDate": "2025-01-10T00:00:00.000Z",
  "status": "completed"
}
```
- `status` values: `scheduled` | `in_progress` | `completed` | `cancelled`

### PUT /api/assets/:id/maintenance/:maintenanceId
```json
{
  "status": "completed",
  "cost": 4000,
  "description": "Completed with additional RAM upgrade"
}
```

---

## 16. Petty Cash

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/petty-cash` | List petty cash registers | Yes |
| `GET` | `/api/petty-cash/:id` | Get petty cash by ID | Yes |
| `POST` | `/api/petty-cash` | Create petty cash register | Yes |
| `PUT` | `/api/petty-cash/:id` | Update petty cash register | Yes |
| `GET` | `/api/petty-cash/:id/transactions` | List transactions | Yes |
| `POST` | `/api/petty-cash/:id/expense` | Record an expense | Yes |
| `POST` | `/api/petty-cash/:id/replenish` | Replenish petty cash | Yes |

### POST /api/petty-cash
```json
{
  "instituteId": "<instituteId>",
  "custodianName": "Ahmed Ali",
  "floatAmount": 5000
}
```
- `floatAmount`: initial cash float (becomes `currentBalance`)

### PUT /api/petty-cash/:id
```json
{
  "custodianName": "Mohammed Rashid",
  "status": "inactive"
}
```

### POST /api/petty-cash/:id/expense
```json
{
  "amount": 350,
  "description": "Office stationery purchase",
  "categoryId": "<categoryId>",
  "receiptNo": "EXP-001",
  "date": "2024-02-05T00:00:00.000Z"
}
```

### POST /api/petty-cash/:id/replenish
```json
{
  "amount": 2000,
  "description": "Monthly replenishment",
  "date": "2024-02-01T00:00:00.000Z"
}
```

---

## 17. Salary

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/salary-payments` | List salary payments | Yes |
| `GET` | `/api/salary-payments/summary` | Salary summary | Yes |
| `GET` | `/api/salary-payments/employee/:employeeId` | Salary history for employee | Yes |
| `GET` | `/api/salary-payments/:id` | Get salary payment by ID | Yes |
| `POST` | `/api/salary-payments` | Create salary payment | Yes |
| `PUT` | `/api/salary-payments/:id` | Update salary payment | Yes |
| `DELETE` | `/api/salary-payments/:id` | Delete salary payment | Yes |

### POST /api/salary-payments
```json
{
  "employeeId": "<employeeId>",
  "instituteId": "<instituteId>",
  "month": 2,
  "year": 2024,
  "baseSalary": 15000,
  "allowances": 2000,
  "deductions": 500,
  "paymentDate": "2024-02-28T00:00:00.000Z",
  "paymentMethod": "bank",
  "remarks": "February salary"
}
```
- `paymentMethod` values: `cash` | `bank` | `upi` | `cheque`
- `netAmount` is auto-calculated: `baseSalary + allowances - deductions`

### PUT /api/salary-payments/:id
```json
{
  "baseSalary": 16000,
  "allowances": 2500,
  "deductions": 500,
  "status": "paid",
  "remarks": "Revised salary for February"
}
```
- `status` values: `paid` | `pending` | `cancelled`
- `netAmount` is recalculated automatically when salary components change.

### GET /api/salary-payments/summary
- **Query params (optional):** `month`, `year`, `instituteId`

### GET /api/salary-payments/employee/:employeeId
- **Response:** Paginated salary history for that employee.

---

## 18. Social

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/social/banners` | List banners | Yes |
| `POST` | `/api/social/banners` | Create banner | Yes |
| `GET` | `/api/social/banners/:id` | Get banner by ID | Yes |
| `PUT` | `/api/social/banners/:id` | Update banner | Yes |
| `DELETE` | `/api/social/banners/:id` | Delete banner | Yes |
| `GET` | `/api/social/feeds` | List feeds | Yes |
| `POST` | `/api/social/feeds` | Create feed | Yes |
| `GET` | `/api/social/activity-logs` | Activity logs | Yes |
| `GET` | `/api/social/support` | List support tickets | Yes |
| `POST` | `/api/social/support` | Create support ticket | Yes |
| `PUT` | `/api/social/support/:id` | Update support ticket | Yes |

### POST /api/social/banners

**Option A — URL-based image:**
```json
{
  "title": "Ramadan Mubarak",
  "image": "https://example.com/banner.jpg",
  "link": "https://example.com",
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-04-01T00:00:00.000Z"
}
```

**Option B — Local image upload (two-step):**

**Step 1:** Upload the image file first:
```
POST /api/upload/banner-image
Content-Type: multipart/form-data
Body field: image (file)
```
Response:
```json
{ "success": true, "url": "https://cdn.example.com/uploads/banners/image.jpg" }
```

**Step 2:** Use the returned `url` as the `image` field:
```json
{
  "title": "Ramadan Mubarak",
  "image": "https://cdn.example.com/uploads/banners/image.jpg",
  "link": "https://example.com",
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-04-01T00:00:00.000Z"
}
```

### GET /api/social/banners/:id
- **Response:** Banner details by ID.

### PUT /api/social/banners/:id

All fields are optional. To update the image from a local file, upload it first (same two-step flow as POST), then pass the returned URL in `image`.

```json
{
  "title": "Ramadan Mubarak Updated",
  "image": "https://cdn.example.com/uploads/banners/new-banner.jpg",
  "link": "https://example.com/ramadan-2026",
  "status": "active",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-04-01T00:00:00.000Z"
}
```

### DELETE /api/social/banners/:id
- **Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

### POST /api/social/feeds
```json
{
  "title": "Community Announcement",
  "content": "The mahallu general meeting is scheduled for March 15.",
  "type": "announcement",
  "image": "https://example.com/image.jpg"
}
```

### POST /api/social/support
```json
{
  "subject": "Login Issue",
  "message": "I am unable to login with my phone number.",
  "category": "technical"
}
```

### PUT /api/social/support/:id
```json
{
  "status": "in_progress",
  "response": "We are investigating the issue."
}
```
- `status` values: `open` | `in_progress` | `resolved` | `closed`

---

## 19. Reports

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/area` | Area-wise member report |
| `GET` | `/api/reports/blood-bank` | Blood group availability report |
| `GET` | `/api/reports/orphans` | Orphans report |

### GET /api/reports/area
- **Query params (optional):** `district`, `village`, `lsgName`

### GET /api/reports/blood-bank
- **Query params (optional):** `bloodGroup` (e.g. `A+ve`, `B-ve`)

### GET /api/reports/orphans
- **Response:** List of members flagged as orphans.

---

## 20. Accounting Reports

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/accounting-reports/day-book` | Day book (all transactions by date) |
| `GET` | `/api/accounting-reports/trial-balance` | Trial balance (debit/credit totals) |
| `GET` | `/api/accounting-reports/balance-sheet` | Balance sheet |
| `GET` | `/api/accounting-reports/ledger-report` | Ledger-wise transactions |
| `GET` | `/api/accounting-reports/income-expenditure` | Income & expenditure statement |
| `GET` | `/api/accounting-reports/consolidated` | Consolidated report across all institutes |

All endpoints accept these **query params (optional):**
- `instituteId` — filter by institute
- `asOfDate` — as of date (`YYYY-MM-DD`)
- `startDate` — period start (`YYYY-MM-DD`)
- `endDate` — period end (`YYYY-MM-DD`)

### GET /api/accounting-reports/day-book
- **Response:** Chronological list of all ledger transactions for the period.

### GET /api/accounting-reports/trial-balance
- **Response:** Debit and credit totals by ledger account.

### GET /api/accounting-reports/balance-sheet
- **Response:** Assets, liabilities, income, expenses, and net summary.

### GET /api/accounting-reports/ledger-report
- **Query params:** `ledgerId` (required)
- **Response:** All transactions for the specified ledger.

### GET /api/accounting-reports/income-expenditure
- **Response:** Income vs expenditure statement for the period.

### GET /api/accounting-reports/consolidated
- **Response:** Aggregated financials across all institutes in the tenant.

---

## 21. Notifications

All require: `Authorization`, `x-tenant-id`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | List notifications | Yes |
| `POST` | `/api/notifications` | Create & send notification | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Yes |

### POST /api/notifications
```json
{
  "recipientType": "all",
  "title": "Important Announcement",
  "message": "The mahallu office will be closed on Friday.",
  "type": "info",
  "image": "https://example.com/notification.jpg"
}
```
- `recipientType` values: `all` | `members` | `admins` | `specific`
- For `specific`, also include `"recipientIds": ["<userId>", ...]`
- `type` values: `info` | `warning` | `success` | `alert`

---

## 22. Master Accounts

All require: `Authorization`, `x-tenant-id`.

### Institute Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/master-accounts/institute` | List institute accounts |
| `POST` | `/api/master-accounts/institute` | Create institute account |
| `PUT` | `/api/master-accounts/institute/:id` | Update institute account |
| `DELETE` | `/api/master-accounts/institute/:id` | Delete institute account |

#### POST /api/master-accounts/institute
```json
{
  "instituteId": "<instituteId>",
  "accountName": "Main Account",
  "bankName": "SBI",
  "accountNumber": "123456789",
  "ifscCode": "SBIN0001234"
}
```

#### PUT /api/master-accounts/institute/:id
```json
{
  "accountName": "Updated Account Name",
  "bankName": "HDFC"
}
```

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/master-accounts/categories` | List categories |
| `POST` | `/api/master-accounts/categories` | Create category |
| `PUT` | `/api/master-accounts/categories/:id` | Update category |
| `DELETE` | `/api/master-accounts/categories/:id` | Delete category |

#### POST /api/master-accounts/categories
```json
{
  "name": "Donations",
  "type": "income",
  "description": "Voluntary donations"
}
```
- `type` values: `income` | `expense`

#### PUT /api/master-accounts/categories/:id
```json
{ "name": "Updated Category", "type": "income" }
```

### Wallets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/master-accounts/wallets` | List wallets |
| `POST` | `/api/master-accounts/wallets` | Create wallet |
| `PUT` | `/api/master-accounts/wallets/:id` | Update wallet |
| `DELETE` | `/api/master-accounts/wallets/:id` | Delete wallet |

#### POST /api/master-accounts/wallets
```json
{
  "name": "Main Wallet",
  "type": "main",
  "balance": 0,
  "instituteId": "<instituteId>"
}
```

#### PUT /api/master-accounts/wallets/:id
```json
{ "name": "Updated Wallet", "balance": 5000 }
```

### Ledgers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/master-accounts/ledgers` | List ledgers |
| `POST` | `/api/master-accounts/ledgers` | Create ledger |
| `PUT` | `/api/master-accounts/ledgers/:id` | Update ledger |
| `DELETE` | `/api/master-accounts/ledgers/:id` | Delete ledger |

#### POST /api/master-accounts/ledgers
```json
{
  "name": "Monthly Income",
  "type": "income",
  "categoryId": "<categoryId>",
  "instituteId": "<instituteId>",
  "description": "All monthly income entries"
}
```
- `type` values: `income` | `expense` | `asset` | `liability`

#### PUT /api/master-accounts/ledgers/:id
```json
{ "name": "Quarterly Income", "description": "Updated description" }
```

### Ledger Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/master-accounts/ledger-items` | List ledger items |
| `POST` | `/api/master-accounts/ledger-items` | Create ledger item (transaction) |
| `PUT` | `/api/master-accounts/ledger-items/:id` | Update ledger item |
| `DELETE` | `/api/master-accounts/ledger-items/:id` | Delete ledger item |

#### POST /api/master-accounts/ledger-items
```json
{
  "ledgerId": "<ledgerId>",
  "date": "2024-02-01T00:00:00.000Z",
  "amount": 5000,
  "type": "credit",
  "description": "Monthly donation collection",
  "referenceNo": "TXN-001",
  "walletId": "<walletId>"
}
```
- `type` values: `credit` | `debit`

#### PUT /api/master-accounts/ledger-items/:id
```json
{
  "amount": 5500,
  "description": "Revised donation amount",
  "referenceNo": "TXN-001-REV"
}
```

---

## 23. Member User

Member-facing portal endpoints. Require `Authorization: Bearer <token>` (member role).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/member-user/profile` | Get own profile |
| `GET` | `/api/member-user/overview` | Overview/summary dashboard |
| `PUT` | `/api/member-user/profile` | Update own profile |
| `GET` | `/api/member-user/payments` | Get all own payments |
| `GET` | `/api/member-user/varisangya` | Get own varisangya records |
| `GET` | `/api/member-user/wallet` | Get own wallet |
| `GET` | `/api/member-user/wallet/transactions` | Get own wallet transactions |
| `POST` | `/api/member-user/payments/varisangya` | Request varisangya payment |
| `POST` | `/api/member-user/payments/zakat` | Request zakat payment |
| `GET` | `/api/member-user/registrations` | Get own registrations |
| `POST` | `/api/member-user/registrations/nikah` | Request nikah registration |
| `POST` | `/api/member-user/registrations/death` | Request death registration |
| `POST` | `/api/member-user/registrations/noc` | Request NOC |
| `GET` | `/api/member-user/notifications` | Get own notifications |
| `GET` | `/api/member-user/programs` | Get community programs |
| `GET` | `/api/member-user/feeds` | Get public feeds |
| `GET` | `/api/member-user/family-members` | Get own family members |

### GET /api/member-user/overview
- **Response:** Member stats — payment status, wallet balance, upcoming programs, recent notifications.

### PUT /api/member-user/profile
```json
{
  "phone": "9876543210",
  "email": "me@example.com",
  "address": "Kozhikode"
}
```

### POST /api/member-user/payments/varisangya
```json
{
  "amount": 500,
  "paymentDate": "2024-02-01",
  "paymentMethod": "Cash"
}
```

### POST /api/member-user/payments/zakat
```json
{
  "amount": 1000,
  "paymentDate": "2024-02-01",
  "zakatType": "fitr"
}
```

### POST /api/member-user/registrations/nikah
```json
{
  "brideName": "Fatima Khan",
  "brideAddress": "Malappuram",
  "nikahDate": "2024-02-14",
  "venue": "Mahallu Mosque"
}
```

### POST /api/member-user/registrations/death
```json
{
  "deceasedName": "Ahmed Ali",
  "deathDate": "2024-02-10",
  "causeOfDeath": "Natural causes"
}
```

### POST /api/member-user/registrations/noc
```json
{
  "purpose": "Travel abroad for employment",
  "type": "travel",
  "destination": "UAE"
}
```

---

## 24. Upload

Requires: `Authorization`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/upload/notification-image` | Upload notification image | Yes |
| `POST` | `/api/upload/banner-image` | Upload banner image | Yes |

### POST /api/upload/notification-image
- **Content-Type:** `multipart/form-data`
- **Body field:** `image` (file)
- **Response:**
```json
{
  "success": true,
  "url": "https://storage.example.com/uploads/notifications/image.jpg"
}
```

### POST /api/upload/banner-image
- **Content-Type:** `multipart/form-data`
- **Body field:** `image` (file)
- **Response:**
```json
{
  "success": true,
  "url": "https://storage.example.com/uploads/banners/image.jpg"
}
```

### Upload Configuration (DigitalOcean Spaces)

Both upload endpoints (`/api/upload/notification-image` and `/api/upload/banner-image`) use the same object storage client configuration.

Required server environment variables:
- `DO_SPACES_ENDPOINT` (example: `sgp1.digitaloceanspaces.com`)
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_SPACES_BUCKET`

Optional:
- `DO_SPACES_FOLDER` (default: `uploads`)
- `DO_SPACES_CDN_ENDPOINT`

### Common Upload Errors

- **`500 Failed to upload image to object storage`**:
  - Usually means invalid/missing Spaces credentials or bucket/endpoint mismatch.
  - If both upload endpoints fail with the same 500, this is a backend storage configuration issue (not client request formatting).

- **`500 Missing object storage env vars: ...`**:
  - Required `DO_SPACES_*` variables are not set in the backend runtime environment.

- **`400 No image file provided`**:
  - Multipart request did not include the `image` file field.

---

## Validation Rules (Key)

Validation is enforced with `express-validator` + centralized validation handler.

- **Auth validations:**
  - `login.phone`: exactly 10 digits (`^[0-9]{10}$`)
  - `send-otp.phone`, `verify-otp.phone`: 10 digits with optional `+91` / `91`
  - `verify-otp.otp`: exactly 6 digits
  - `change-password.newPassword`: minimum 6 chars
- **Param validations:** most `:id` params require valid Mongo ObjectId.
- **Role/tenant constraints:** enforced in middleware and controller-level checks.
- **OTP controls:**
  - Send OTP throttled to 1 request/minute per phone.
  - OTP verify attempt limits (`429` on abuse via limiter + OTP attempts).

---

## Security Review & Recommended Improvements

### Current Security Controls

- JWT authentication with protected middleware.
- Role-based authorization (`superAdminOnly`, `allowRoles`, `memberUserOnly`).
- OTP rate limiting and OTP expiry/attempt tracking.
- Inactive-account checks before issuing access.

### Notable Risks / Improvements

1. **Hardcoded fallback JWT secret** exists in auth login path if env is missing.
   - Recommendation: fail fast in all auth handlers when `JWT_SECRET` is absent (no fallback secret).
2. **App Store test backdoor behavior** in `send-otp` is deterministic.
   - Recommendation: gate with explicit env flag (e.g., `ENABLE_APPSTORE_TEST_USER=true`) and disable in production.
3. **In-memory OTP verify limiter** resets on process restart and does not scale horizontally.
   - Recommendation: move limiter to Redis/distributed store for multi-instance deployments.
4. **Sensitive logging risk** around OTP workflows.
   - Recommendation: avoid logging full phone/OTP in production logs; mask values.
5. **CORS currently open by default**.
   - Recommendation: restrict origins in production.

---

## Sample cURL Requests

### 1) Password Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "admin123"
  }'
```

### 2) OTP Send (Normal)
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999"
  }'
```

### 3) OTP Send (App Store Test User Bootstrap)
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8877665544"
  }'
```

### 4) OTP Verify
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8877665544",
    "otp": "123456"
  }'
```

### 5) Create User (Authenticated)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "name": "Ahmed Ali",
    "phone": "9876543210",
    "role": "mahall",
    "password": "123456",
    "permissions": {
      "view": true,
      "add": true,
      "edit": true,
      "delete": false
    }
  }'
```

### 6) Salary Payments List (Authenticated)
```bash
curl -X GET "http://localhost:5000/api/salary-payments?month=2&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-tenant-id: YOUR_TENANT_ID"
```

---

## Summary: Total Endpoints by Section

| Section | Count |
|---------|-------|
| Public | 2 |
| Auth | 7 |
| Dashboard | 4 |
| Tenants | 8 |
| Users | 6 |
| Families | 5 |
| Members | 7 |
| Institutes | 5 |
| Programs | 5 |
| Committees | 6 |
| Meetings | 5 |
| Registrations | 12 |
| Collectibles | 9 |
| Employees | 5 |
| Assets | 9 |
| Petty Cash | 7 |
| Salary | 7 |
| Social | 11 |
| Reports | 3 |
| Accounting Reports | 6 |
| Notifications | 4 |
| Master Accounts | 20 |
| Member User | 17 |
| Upload | 2 |
| **Total** | **~181** |

---

*For interactive Swagger docs, run the API and open `GET /api-docs`.*
