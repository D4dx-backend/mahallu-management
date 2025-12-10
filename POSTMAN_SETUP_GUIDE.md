# Postman Setup Guide - Correct Endpoints

## 🎯 Quick Answer

**The frontend is already correct!** It uses `POST /api/users` (not `/api/users/create`).

The issue was only in your Postman test where you used the wrong endpoint.

## 📥 Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select the file: `Mahallu_API_Postman_Collection.json`
4. Collection will be imported with all correct endpoints

## 🔧 Setup Steps

### Step 1: Set Variables

After importing, set these collection variables:

1. Click on the collection name
2. Go to "Variables" tab
3. Set values:
   - `baseUrl`: `http://localhost:4000/api` (already set)
   - `token`: (will be auto-filled after login)
   - `tenantId`: (will be auto-filled after login)

### Step 2: Login

1. Open "Authentication" → "Login"
2. Update the body with your credentials:
   ```json
   {
     "phone": "YOUR_ACTUAL_PHONE",
     "password": "YOUR_ACTUAL_PASSWORD"
   }
   ```
3. Click "Send"
4. Token and tenantId will be automatically saved to variables

### Step 3: Create User (CORRECT)

1. Open "Users" → "Create User (CORRECT)"
2. The endpoint is already correct: `POST {{baseUrl}}/users`
3. Update the body if needed:
   ```json
   {
     "name": "Test User",
     "phone": "9876543210",
     "email": "test@example.com",
     "role": "mahall",
     "tenantId": "{{tenantId}}",
     "password": "123456",
     "permissions": {
       "view": true,
       "add": true,
       "edit": true,
       "delete": false
     }
   }
   ```
4. Click "Send"
5. Expected: 201 Created with user data

## ✅ Correct Endpoints Reference

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| **POST** | **`/api/users`** | **Create user** ⭐ |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### ❌ WRONG Endpoints (Don't Use These)

| Wrong Endpoint | Why It's Wrong |
|----------------|----------------|
| `GET /api/users/create` | No such route exists |
| `POST /api/users/create` | No such route exists |
| `/api/users/new` | No such route exists |
| `/api/users/add` | No such route exists |

## 🧪 Manual Testing (Without Collection)

If you prefer to create requests manually:

### 1. Login Request

```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "phone": "YOUR_PHONE",
  "password": "YOUR_PASSWORD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Copy the `token` value.

### 2. Get Tenants Request

```
GET http://localhost:4000/api/tenants
Authorization: Bearer YOUR_TOKEN_FROM_STEP_1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Test Tenant",
      "code": "TT001"
    }
  ]
}
```

Copy the `_id` value.

### 3. Create User Request (CORRECT)

```
POST http://localhost:4000/api/users
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_FROM_STEP_1
x-tenant-id: YOUR_TENANT_ID_FROM_STEP_2

{
  "name": "Test User",
  "phone": "9876543210",
  "email": "test@example.com",
  "role": "mahall",
  "tenantId": "YOUR_TENANT_ID_FROM_STEP_2",
  "password": "123456",
  "permissions": {
    "view": true,
    "add": true,
    "edit": true,
    "delete": false
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "phone": "9876543210",
    "email": "test@example.com",
    "role": "mahall",
    "status": "active",
    "permissions": {
      "view": true,
      "add": true,
      "edit": true,
      "delete": false
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔍 Troubleshooting

### Error: "Invalid user ID"

**Cause:** You're using wrong endpoint like `GET /api/users/create`

**Solution:** Use `POST /api/users` instead

### Error: "Invalid token"

**Cause:** Token is missing or expired

**Solution:** 
1. Run the Login request again
2. Copy the new token
3. Update the Authorization header

### Error: "Tenant ID is required"

**Cause:** Super admin didn't provide tenantId

**Solution:** 
1. Get tenant ID from `/api/tenants` endpoint
2. Add to request body: `"tenantId": "YOUR_TENANT_ID"`
3. Add to header: `x-tenant-id: YOUR_TENANT_ID`

### Error: "Phone number must be exactly 10 digits"

**Cause:** Phone number format is wrong

**Solution:** Use exactly 10 digits, no spaces or special characters
- ✅ "9876543210"
- ❌ "+919876543210"
- ❌ "98765 43210"

## 📊 Complete API Endpoints List

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user ⭐
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Tenants (Super Admin Only)
- `GET /api/tenants` - List tenants
- `GET /api/tenants/:id` - Get tenant
- `GET /api/tenants/:id/stats` - Get tenant stats
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id` - Update tenant
- `POST /api/tenants/:id/suspend` - Suspend tenant
- `POST /api/tenants/:id/activate` - Activate tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Families
- `GET /api/families` - List families
- `GET /api/families/:id` - Get family
- `POST /api/families` - Create family
- `PUT /api/families/:id` - Update family
- `DELETE /api/families/:id` - Delete family

### Members
- `GET /api/members` - List members
- `GET /api/members/:id` - Get member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - Check API status

## 🎓 REST API Conventions

The API follows standard REST conventions:

| Action | HTTP Method | Endpoint Pattern | Example |
|--------|-------------|------------------|---------|
| List all | GET | `/resource` | `GET /api/users` |
| Get one | GET | `/resource/:id` | `GET /api/users/123` |
| Create | POST | `/resource` | `POST /api/users` |
| Update | PUT | `/resource/:id` | `PUT /api/users/123` |
| Delete | DELETE | `/resource/:id` | `DELETE /api/users/123` |

**Note:** There are NO `/create`, `/new`, or `/add` endpoints!

## 📝 Summary

1. ✅ **Frontend is correct** - Uses `POST /api/users`
2. ✅ **Import Postman collection** - Has all correct endpoints
3. ✅ **Use `POST /api/users`** - Not `/api/users/create`
4. ✅ **Follow REST conventions** - Standard HTTP methods
5. ✅ **Test in browser** - Frontend already works!

## 🚀 Next Steps

1. Import the Postman collection
2. Update login credentials
3. Test the "Create User (CORRECT)" request
4. Verify it works with `POST /api/users`
5. Use the frontend - it's already working correctly!

---

**Remember:** The endpoint is `POST /api/users`, not `/api/users/create`! 🎉
