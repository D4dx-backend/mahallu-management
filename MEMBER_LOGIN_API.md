# Member Login API (GET/POST + Body)

## Base URL

`http://localhost:5000/api`

---

## Member Login Flow (OTP Based)

For member users, login is OTP-only. Use these endpoints in order:

1. `POST /api/auth/send-otp`
2. `POST /api/auth/verify-otp`
3. `GET /api/auth/me` (after token)

---

## 1) POST `/api/auth/send-otp`

Sends OTP to member phone.

### Request Body

```json
{
  "phone": "9567374733"
}
```

### Body Rules

- `phone` (string, required)
- Accepted format: `10 digits` with optional `+91` or `91` prefix
- Validation pattern: `^(\\+?91)?[0-9]{10}$`

### Success Response (example)

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

## 2) POST `/api/auth/verify-otp`

Verifies OTP and returns JWT token.

### Request Body

```json
{
  "phone": "9567374733",
  "otp": "123456"
}
```

### Body Rules

- `phone` (string, required)
- `otp` (string, required, exactly 6 digits)
- Validation pattern:
  - `phone`: `^(\\+?91)?[0-9]{10}$`
  - `otp`: `^[0-9]{6}$`

### Success Response (example)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7890a1234",
      "name": "Member User",
      "phone": "9567374733",
      "role": "member",
      "status": "active"
    },
    "token": "<jwt-token>"
  }
}
```

---

## 3) GET `/api/auth/me`

Returns currently logged-in user details.

### Headers

- `Authorization: Bearer <jwt-token>`

### Request Body

No body.

### Success Response (example)

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a1234",
    "name": "Member User",
    "phone": "9567374733",
    "role": "member",
    "status": "active"
  }
}
```

---

## 4) Member NOC Registration APIs (after login)

After OTP verification, use the JWT token in header for member portal APIs:

- `Authorization: Bearer <jwt-token>`

### 4.1 GET `/api/member-user/registrations?type=noc`

Get logged-in member's NOC registration list.

#### Request Body

No body.

#### Query Params

- `type=noc`
- `page` (optional)
- `limit` (optional)

### 4.2 POST `/api/member-user/registrations/noc`

Create a new NOC registration request.

#### Request Body (Common NOC)

```json
{
  "type": "common",
  "purposeTitle": "Bank Loan",
  "purposeDescription": "Need NOC for housing loan processing",
  "remarks": "Urgent"
}
```

#### Request Body (Nikah NOC)

```json
{
  "type": "nikah",
  "brideName": "Amina",
  "brideAge": 24,
  "nikahDate": "2026-03-10",
  "venue": "Town Hall",
  "purposeTitle": "Nikah NOC",
  "purposeDescription": "For marriage registration",
  "remarks": ""
}
```

#### Body Rules

- `type`: `common` or `nikah` (default is `common`)
- For `type = nikah`, `brideName` and `nikahDate` are required
- `purposeTitle`, `purposeDescription`, `remarks` are optional

#### Success Response (example)

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7890a6789",
    "type": "common",
    "status": "pending",
    "purposeTitle": "Bank Loan",
    "purposeDescription": "Need NOC for housing loan processing"
  },
  "message": "NOC request submitted successfully"
}
```

---

## Related POST: `/api/auth/login` (password login)

### Request Body

```json
{
  "phone": "9567374733",
  "password": "your-password"
}
```

### Important for members

If the account role is `member`, this endpoint returns:

- `403 Forbidden`
- Message: `Member login is OTP-only. Please use send OTP and verify OTP.`

So member apps should use OTP endpoints only.
