# Member Login Request Bodies

Quick reference for member login APIs.

## POST `/api/auth/send-otp`

```json
{
  "phone": "9567374733"
}
```

## POST `/api/auth/verify-otp`

```json
{
  "phone": "9567374733",
  "otp": "123456"
}
```

## GET `/api/auth/me`

No request body.

Use header:

`Authorization: Bearer <jwt-token>`

## GET `/api/member-user/registrations?type=noc`

No request body.

Use header:

`Authorization: Bearer <jwt-token>`

## POST `/api/member-user/registrations/noc` (common)

```json
{
  "type": "common",
  "purposeTitle": "Bank Loan",
  "purposeDescription": "Need NOC for housing loan processing",
  "remarks": "Urgent"
}
```

## POST `/api/member-user/registrations/noc` (nikah)

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

## POST `/api/auth/login` (not for member role)

```json
{
  "phone": "9567374733",
  "password": "your-password"
}
```

For `member` role, server responds with OTP-only message and `403`.
