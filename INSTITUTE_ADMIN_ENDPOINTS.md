# Institute Admin Endpoints (Complete Reference)

This document lists **all** API endpoints accessible by an **Institute Admin** (role: `institute`), including GET, POST, PUT, and DELETE methods with full request bodies.

## Base URL

```
http://localhost:5000/api
```

## Global Headers (all protected routes)

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 1. Authentication

### POST `/auth/login`
Login with phone and password.

```json
{
  "phone": "9999999999",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "USER_ID", "name": "Institute Admin", "role": "institute" },
    "token": "JWT_TOKEN"
  }
}
```

---

### POST `/auth/send-otp`
Send OTP to registered phone.

```json
{ "phone": "9999999999" }
```

---

### POST `/auth/verify-otp`
Verify OTP and receive JWT token.

```json
{
  "phone": "9999999999",
  "otp": "123456"
}
```

---

### GET `/auth/me`
Get currently logged-in user profile.  
**Body:** none

---

### POST `/auth/change-password`
Change current user's password.

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## 2. Dashboard

### GET `/dashboard/stats`
Dashboard statistics (users, families, members counts).  
**Query Params:** none  
**Body:** none

---

### GET `/dashboard/recent-families`
Recently added families.  
**Body:** none

---

### GET `/dashboard/activity-timeline`
Recent activity log for the tenant.  
**Body:** none

---

### GET `/dashboard/financial-summary`
Financial summary (income vs expense totals).  
**Body:** none

---

## 3. Institutes

### GET `/institutes`
List all institutes.

| Query Param | Type | Options |
|---|---|---|
| `type` | string | `institute` \| `program` \| `madrasa` |
| `status` | string | `active` \| `inactive` |
| `search` | string | name, place, description |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10, max: 100 |

---

### GET `/institutes/:id`
Get a single institute by ID.  
**Body:** none

---

### POST `/institutes`
Create a new institute.

```json
{
  "name": "Al-Azhar Institute",
  "place": "Kozhikode",
  "type": "institute",
  "joinDate": "2024-01-01T00:00:00.000Z",
  "description": "Islamic educational institute",
  "contactNo": "9876543210",
  "email": "info@alazhar.in",
  "address": {
    "state": "Kerala",
    "district": "Kozhikode",
    "pinCode": "673001",
    "postOffice": "Kozhikode HO"
  },
  "status": "active"
}
```
> **Required:** `name`, `place`, `type`

---

### PUT `/institutes/:id`
Update an institute.

```json
{
  "name": "Al-Azhar Institute Updated",
  "description": "Updated description",
  "contactNo": "9876543211",
  "status": "active"
}
```

---

### DELETE `/institutes/:id`
Delete an institute.  
**Body:** none

---

## 4. Families

### GET `/families`
List all families.

| Query Param | Type | Options |
|---|---|---|
| `search` | string | house name, family head |
| `status` | string | `approved` \| `unapproved` \| `pending` |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10 |

---

### GET `/families/:id`
Get a single family by ID.  
**Body:** none

---

### POST `/families`
Create a new family.

```json
{
  "houseName": "Al-Hamd House",
  "mahallId": "MAH001",
  "varisangyaGrade": "Grade A",
  "familyHead": "Ahmed Ali",
  "contactNo": "9876543210",
  "wardNumber": "Ward 5",
  "houseNo": "H-123",
  "area": "Area A",
  "place": "Kozhikode",
  "via": "Via Calicut",
  "state": "Kerala",
  "district": "Kozhikode",
  "pinCode": "673001",
  "postOffice": "Kozhikode HO",
  "lsgName": "Kozhikode Corporation",
  "village": "Kozhikode",
  "status": "pending"
}
```
> **Required:** `houseName`, `state`, `district`, `lsgName`, `village`

---

### PUT `/families/:id`
Update a family. Body accepts all fields from POST (all optional).

---

### DELETE `/families/:id`
Delete a family.  
**Body:** none

---

## 5. Members

### GET `/members`
List all members.

| Query Param | Type | Options |
|---|---|---|
| `familyId` | string | MongoDB ObjectId |
| `gender` | string | `male` \| `female` |
| `status` | string | `active` \| `inactive` \| `deleted` |
| `search` | string | name, mahallId, phone |
| `sortBy` | string | `mahallId` \| `name` \| `createdAt` |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10, max: 100 |

---

### GET `/members/:id`
Get a single member by ID.  
**Body:** none

---

### GET `/members/family/:familyId`
Get all members of a specific family.  
**Body:** none

---

### POST `/members`
Create a new member.

```json
{
  "name": "Ahmed Ali",
  "familyId": "507f1f77bcf86cd799439013",
  "mahallId": "MAH001",
  "age": 25,
  "gender": "male",
  "bloodGroup": "O+",
  "phone": "9876543210",
  "email": "ahmed@example.com",
  "occupation": "Teacher",
  "education": "B.Ed",
  "maritalStatus": "married",
  "status": "active"
}
```
> **Required:** `name`, `familyId`, `gender`

---

### PUT `/members/:id`
Update a member. Body accepts all fields from POST (all optional).

---

### PUT `/members/:id/status`
Update member status.

```json
{ "status": "inactive" }
```

---

### DELETE `/members/:id`
Delete a member.  
**Body:** none

---

## 6. Programs

### GET `/programs`
List all programs.

| Query Param | Type | Options |
|---|---|---|
| `status` | string | `active` \| `inactive` |
| `search` | string | name, place, description |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10, max: 100 |

---

### GET `/programs/:id`
Get a single program by ID.  
**Body:** none

---

### POST `/programs`
Create a new program.

```json
{
  "name": "Youth Education Program",
  "place": "Kozhikode",
  "description": "Education program for youth",
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "status": "active"
}
```
> **Required:** `name`, `place`

---

### PUT `/programs/:id`
Update a program. Body accepts all fields from POST (all optional).

---

### DELETE `/programs/:id`
Delete a program.  
**Body:** none

---

## 7. Employees

### GET `/employees`
List all employees.

| Query Param | Type | Options |
|---|---|---|
| `instituteId` | string | MongoDB ObjectId |
| `status` | string | `active` \| `inactive` |
| `search` | string | name, designation, department, phone |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10 |

---

### GET `/employees/:id`
Get a single employee by ID.  
**Body:** none

---

### POST `/employees`
Create a new employee.

```json
{
  "name": "Fatima Hassan",
  "instituteId": "507f1f77bcf86cd799439015",
  "designation": "Teacher",
  "salary": 25000,
  "phone": "9876543210",
  "email": "fatima@example.com",
  "department": "Science",
  "joinDate": "2024-01-15",
  "address": "Kozhikode, Kerala",
  "qualifications": "M.Sc Physics",
  "status": "active"
}
```
> **Required:** `name`, `instituteId`, `designation`, `salary`

---

### PUT `/employees/:id`
Update an employee. Body accepts all fields from POST (all optional).

---

### DELETE `/employees/:id`
Delete an employee.  
**Body:** none

---

## 8. Salary Payments

### GET `/salary-payments`
List all salary payments.

| Query Param | Type | Options |
|---|---|---|
| `instituteId` | string | MongoDB ObjectId |
| `employeeId` | string | MongoDB ObjectId |
| `month` | integer | 1–12 |
| `year` | integer | e.g. 2026 |
| `status` | string | `paid` \| `pending` \| `cancelled` |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10 |

---

### GET `/salary-payments/summary`
Aggregated salary summary.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `month` | integer |
| `year` | integer |

---

### GET `/salary-payments/employee/:employeeId`
Full salary history for an employee.  
**Body:** none

---

### GET `/salary-payments/:id`
Get a single salary payment by ID.  
**Body:** none

---

### POST `/salary-payments`
Create a salary payment.

```json
{
  "instituteId": "507f1f77bcf86cd799439015",
  "employeeId": "507f1f77bcf86cd799439017",
  "month": 2,
  "year": 2026,
  "baseSalary": 25000,
  "allowances": 2000,
  "deductions": 500,
  "paymentDate": "2026-02-28",
  "paymentMethod": "bank",
  "status": "paid",
  "remarks": "February salary"
}
```
> **Required:** `instituteId`, `employeeId`, `month`, `year`, `baseSalary`, `paymentDate`, `paymentMethod`  
> `paymentMethod`: `cash` | `bank` | `upi` | `cheque`

---

### PUT `/salary-payments/:id`
Update a salary payment. Body accepts all fields from POST (all optional).

---

### DELETE `/salary-payments/:id`
Delete a salary payment.  
**Body:** none

---

## 9. Collectibles

### GET `/collectibles/varisangya`
List all Varisangya payments.

| Query Param | Type |
|---|---|
| `familyId` | string |
| `memberId` | string |
| `dateFrom` | date (YYYY-MM-DD) |
| `dateTo` | date (YYYY-MM-DD) |
| `page` | integer |
| `limit` | integer |

---

### GET `/collectibles/receipt-next`
Get the next available receipt number.  
**Body:** none

---

### POST `/collectibles/varisangya`
Create a Varisangya payment.

```json
{
  "familyId": "507f1f77bcf86cd799439013",
  "memberId": "507f1f77bcf86cd799439014",
  "amount": 500,
  "paymentDate": "2026-02-01T00:00:00.000Z",
  "paymentMethod": "Cash",
  "receiptNo": "REC001",
  "remarks": "Monthly contribution"
}
```
> Either `familyId` or `memberId` is required.

---

### PUT `/collectibles/varisangya/:id`
Update a Varisangya payment. Body accepts all fields from POST (all optional).

---

### DELETE `/collectibles/varisangya/:id`
Delete a Varisangya payment.  
**Body:** none

---

### GET `/collectibles/zakat`
List all Zakat payments.

| Query Param | Type |
|---|---|
| `payerId` | string |
| `category` | string |
| `dateFrom` | date |
| `dateTo` | date |
| `page` | integer |
| `limit` | integer |

---

### POST `/collectibles/zakat`
Create a Zakat payment.

```json
{
  "payerName": "Ahmed Ali",
  "payerId": "507f1f77bcf86cd799439014",
  "amount": 1000,
  "paymentDate": "2026-02-01T00:00:00.000Z",
  "paymentMethod": "Bank Transfer",
  "receiptNo": "ZAK001",
  "category": "Annual Zakat",
  "remarks": "Zakat for the year 2026"
}
```

---

### PUT `/collectibles/zakat/:id`
Update a Zakat payment. Body accepts all fields from POST (all optional).

---

### DELETE `/collectibles/zakat/:id`
Delete a Zakat payment.  
**Body:** none

---

### GET `/collectibles/wallet`
Get wallet information.

| Query Param | Type |
|---|---|
| `familyId` | string |
| `memberId` | string |

---

### GET `/collectibles/wallet/:walletId/transactions`
Get transactions for a wallet.

| Query Param | Type | Options |
|---|---|---|
| `type` | string | `credit` \| `debit` |
| `page` | integer | |
| `limit` | integer | |

---

## 10. Master Accounts

> All endpoints require `Authorization: Bearer <JWT_TOKEN>`.

### Institute Accounts

#### GET `/master-accounts/institute`

| Query Param | Type | Options |
|---|---|---|
| `instituteId` | string | MongoDB ObjectId |
| `status` | string | `active` \| `inactive` |
| `page` | integer | default: 1 |
| `limit` | integer | default: 10 |

#### POST `/master-accounts/institute`

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
> **Required:** `instituteId`, `accountName`

#### PUT `/master-accounts/institute/:id`

```json
{
  "accountName": "Updated Account Name",
  "bankName": "HDFC Bank",
  "ifscCode": "HDFC0001234",
  "balance": 150000,
  "status": "active"
}
```

#### DELETE `/master-accounts/institute/:id`
**Body:** none

---

### Categories

#### GET `/master-accounts/categories`

| Query Param | Type | Options |
|---|---|---|
| `type` | string | `income` \| `expense` |
| `search` | string | category name |
| `page` | integer | |
| `limit` | integer | |

#### POST `/master-accounts/categories`

```json
{
  "name": "Donations",
  "description": "Charitable donations",
  "type": "income",
  "status": "active"
}
```
> **Required:** `name`, `type`

#### PUT `/master-accounts/categories/:id`

```json
{
  "name": "Zakath Collections",
  "description": "Updated description",
  "type": "income",
  "status": "active"
}
```

#### DELETE `/master-accounts/categories/:id`
**Body:** none

---

### Wallets

#### GET `/master-accounts/wallets`

| Query Param | Type | Options |
|---|---|---|
| `type` | string | `main` \| `reserve` \| `charity` |
| `page` | integer | |
| `limit` | integer | |

#### POST `/master-accounts/wallets`

```json
{
  "name": "Main Wallet",
  "balance": 0,
  "type": "main"
}
```
> **Required:** `name`, `type`

#### PUT `/master-accounts/wallets/:id`

```json
{
  "name": "Reserve Wallet",
  "balance": 50000,
  "type": "reserve"
}
```

#### DELETE `/master-accounts/wallets/:id`
**Body:** none

---

### Ledgers

#### GET `/master-accounts/ledgers`

| Query Param | Type | Options |
|---|---|---|
| `type` | string | `income` \| `expense` |
| `search` | string | ledger name |
| `page` | integer | |
| `limit` | integer | |

#### POST `/master-accounts/ledgers`

```json
{
  "name": "General Ledger",
  "description": "Primary income ledger",
  "type": "income"
}
```
> **Required:** `name`, `type`

#### PUT `/master-accounts/ledgers/:id`

```json
{
  "name": "Updated Ledger Name",
  "description": "Updated description",
  "type": "expense"
}
```

#### DELETE `/master-accounts/ledgers/:id`
**Body:** none

---

### Ledger Items

#### GET `/master-accounts/ledger-items`

| Query Param | Type |
|---|---|
| `ledgerId` | string |
| `categoryId` | string |
| `dateFrom` | date (ISO 8601) |
| `dateTo` | date (ISO 8601) |
| `page` | integer |
| `limit` | integer |

#### POST `/master-accounts/ledger-items`

```json
{
  "ledgerId": "507f1f77bcf86cd799439099",
  "date": "2026-02-20T00:00:00.000Z",
  "amount": 5000,
  "type": "income",
  "description": "Donation received",
  "categoryId": "507f1f77bcf86cd799439033",
  "paymentMethod": "Cash",
  "referenceNo": "REF001"
}
```
> **Required:** `ledgerId`, `date`, `amount`, `type`, `description`

#### PUT `/master-accounts/ledger-items/:id`

```json
{
  "amount": 6000,
  "description": "Updated description",
  "paymentMethod": "Bank Transfer",
  "referenceNo": "REF002"
}
```

#### DELETE `/master-accounts/ledger-items/:id`
**Body:** none

---

## 11. Accounting Reports

All report endpoints use **GET** with no body. Use query params to filter.

### GET `/accounting-reports/day-book`
Chronological list of all transactions.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `startDate` | date (YYYY-MM-DD) |
| `endDate` | date (YYYY-MM-DD) |

---

### GET `/accounting-reports/trial-balance`
Aggregate income vs expense totals by ledger.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `asOfDate` | date (YYYY-MM-DD) |

---

### GET `/accounting-reports/balance-sheet`
Assets vs liabilities summary.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `asOfDate` | date (YYYY-MM-DD) |

---

### GET `/accounting-reports/ledger-report`
Detailed ledger report.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `ledgerId` | string |
| `startDate` | date |
| `endDate` | date |

---

### GET `/accounting-reports/income-expenditure`
Income vs expenditure summary.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `startDate` | date |
| `endDate` | date |

---

### GET `/accounting-reports/consolidated`
Consolidated report across all accounts.

| Query Param | Type |
|---|---|
| `instituteId` | string |
| `startDate` | date |
| `endDate` | date |

---

## 12. Assets

### GET `/assets`
List all assets.

| Query Param | Type | Options |
|---|---|---|
| `status` | string | `active` \| `in_use` \| `under_maintenance` \| `disposed` \| `damaged` |
| `category` | string | `furniture` \| `electronics` \| `vehicle` \| `building` \| `land` \| `equipment` \| `other` |
| `search` | string | name, description, location |
| `page` | integer | |
| `limit` | integer | max: 100 |

---

### GET `/assets/:id`
Get a single asset by ID.  
**Body:** none

---

### POST `/assets`
Create a new asset.

```json
{
  "name": "Projector",
  "description": "Epson HD Projector for meeting hall",
  "purchaseDate": "2024-01-15",
  "estimatedValue": 45000,
  "category": "electronics",
  "status": "active",
  "location": "Meeting Hall"
}
```
> **Required:** `name`, `purchaseDate`, `estimatedValue`, `category`

---

### PUT `/assets/:id`
Update an asset.

```json
{
  "name": "Projector - Updated",
  "estimatedValue": 40000,
  "status": "in_use",
  "location": "Conference Room"
}
```

---

### DELETE `/assets/:id`
Delete an asset and all its maintenance records.  
**Body:** none

---

### GET `/assets/:id/maintenance`
List maintenance records for an asset.

| Query Param | Type |
|---|---|
| `page` | integer |
| `limit` | integer |

---

### POST `/assets/:id/maintenance`
Add a maintenance record.

```json
{
  "maintenanceDate": "2024-06-15",
  "description": "Annual servicing",
  "cost": 5000,
  "performedBy": "ABC Services",
  "nextMaintenanceDate": "2025-06-15",
  "status": "completed"
}
```
> **Required:** `maintenanceDate`, `description`  
> `status`: `scheduled` | `in_progress` | `completed` | `cancelled`

---

### PUT `/assets/:id/maintenance/:maintenanceId`
Update a maintenance record.

```json
{
  "description": "Annual servicing - updated",
  "cost": 5500,
  "status": "completed",
  "nextMaintenanceDate": "2025-06-15"
}
```

---

### DELETE `/assets/:id/maintenance/:maintenanceId`
Delete a maintenance record.  
**Body:** none

---

## 13. Petty Cash

### GET `/petty-cash`
List all petty cash funds.  
**Body:** none

---

### GET `/petty-cash/:id`
Get a single petty cash fund by ID.  
**Body:** none

---

### POST `/petty-cash`
Create a new petty cash fund.

```json
{
  "name": "Office Petty Cash",
  "balance": 10000,
  "instituteId": "507f1f77bcf86cd799439015",
  "description": "For daily office expenses"
}
```

---

### PUT `/petty-cash/:id`
Update a petty cash fund. Body accepts any fields from POST (all optional).

---

### GET `/petty-cash/:id/transactions`
List all transactions for a petty cash fund.  
**Body:** none

---

### POST `/petty-cash/:id/expense`
Record a petty cash expense.

```json
{
  "amount": 500,
  "description": "Office stationery",
  "date": "2026-02-26",
  "category": "Stationery"
}
```

---

### POST `/petty-cash/:id/replenish`
Replenish (top up) a petty cash fund.

```json
{
  "amount": 5000,
  "description": "Monthly replenishment",
  "date": "2026-02-26"
}
```

---

## 14. Notifications

### GET `/notifications`
List notifications for the logged-in user.

| Query Param | Type | Options |
|---|---|---|
| `recipientType` | string | `user` \| `member` \| `all` |
| `type` | string | `info` \| `warning` \| `success` \| `error` |
| `isRead` | boolean | `true` \| `false` |
| `page` | integer | |
| `limit` | integer | |

---

### POST `/notifications`
Create a notification.

```json
{
  "recipientId": "507f1f77bcf86cd799439011",
  "recipientType": "user",
  "title": "New Update Available",
  "message": "A new family has been added to your mahallu",
  "type": "info",
  "link": "/families"
}
```
> `recipientType`: `user` | `member` | `all`  
> `type`: `info` | `warning` | `success` | `error`  
> For broadcast: omit `recipientId` and set `recipientType: "all"`

---

### PUT `/notifications/:id/read`
Mark a single notification as read.  
**Body:** none

---

### PUT `/notifications/read-all`
Mark all notifications as read.  
**Body:** none

---

## Summary Table

| Route Group | Base Path | Methods Available |
|---|---|---|
| Authentication | `/auth` | POST (login, send-otp, verify-otp, change-password), GET (me) |
| Dashboard | `/dashboard` | GET (stats, recent-families, activity-timeline, financial-summary) |
| Institutes | `/institutes` | GET, POST, PUT, DELETE |
| Families | `/families` | GET, POST, PUT, DELETE |
| Members | `/members` | GET, POST, PUT, DELETE |
| Programs | `/programs` | GET, POST, PUT, DELETE |
| Employees | `/employees` | GET, POST, PUT, DELETE |
| Salary Payments | `/salary-payments` | GET, POST, PUT, DELETE |
| Collectibles | `/collectibles` | GET, POST, PUT, DELETE (varisangya, zakat, wallet) |
| Master Accounts | `/master-accounts` | GET, POST, PUT, DELETE (accounts, categories, wallets, ledgers, ledger-items) |
| Accounting Reports | `/accounting-reports` | GET only (day-book, trial-balance, balance-sheet, ledger-report, income-expenditure, consolidated) |
| Assets | `/assets` | GET, POST, PUT, DELETE (assets + maintenance records) |
| Petty Cash | `/petty-cash` | GET, POST, PUT (funds + expense + replenish) |
| Notifications | `/notifications` | GET, POST, PUT (read/read-all) |

---

## Source Files

- `mahallu-api/src/index.ts`
- `mahallu-api/src/routes/authRoutes.ts`
- `mahallu-api/src/routes/dashboardRoutes.ts`
- `mahallu-api/src/routes/instituteRoutes.ts`
- `mahallu-api/src/routes/familyRoutes.ts`
- `mahallu-api/src/routes/memberRoutes.ts`
- `mahallu-api/src/routes/programRoutes.ts`
- `mahallu-api/src/routes/employeeRoutes.ts`
- `mahallu-api/src/routes/salaryRoutes.ts`
- `mahallu-api/src/routes/collectibleRoutes.ts`
- `mahallu-api/src/routes/masterAccountRoutes.ts`
- `mahallu-api/src/routes/accountingReportRoutes.ts`
- `mahallu-api/src/routes/assetRoutes.ts`
- `mahallu-api/src/routes/pettyCashRoutes.ts`
- `mahallu-api/src/routes/notificationRoutes.ts`
