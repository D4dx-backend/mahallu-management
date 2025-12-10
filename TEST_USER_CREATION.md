# User Creation Testing Guide

## Quick Test Steps

### 1. Start the Services

```bash
# Terminal 1 - Start API
cd mahallu-api
npm run dev

# Terminal 2 - Start CMS
cd mahallu-cms
npm run dev
```

### 2. Test Super Admin User Creation

1. **Login as Super Admin**
   - Open browser: http://localhost:5173
   - Login with super admin credentials

2. **Create Mahall User**
   - Navigate to: Users > Mahall Users
   - Click "New User" button
   - **Verify**: You should see a "Tenant" dropdown at the top
   - Select a tenant from the dropdown
   - Fill in the form:
     ```
     Tenant: [Select from dropdown]
     Full Name: Test User
     Phone Number: 9876543210
     Email: test@example.com (optional)
     Permissions: [Check as needed]
     ```
   - Click "Create User"
   - **Expected**: Success message and redirect to users list

3. **Create Survey User**
   - Navigate to: Users > Survey Users
   - Click "New User" button
   - Follow same steps as above

4. **Create Institute User**
   - Navigate to: Users > Institute Users
   - Click "New User" button
   - Follow same steps as above

### 3. Test Regular User Creation

1. **Login as Mahall/Institute/Survey User**
   - Logout from super admin
   - Login with regular user credentials

2. **Create User**
   - Navigate to appropriate user creation page
   - **Verify**: No tenant dropdown (should be hidden)
   - Fill in the form (tenant is automatically set)
   - Click "Create User"
   - **Expected**: Success message

### 4. Test Validation Errors

Try these to verify validation works:

**Invalid Phone Numbers:**
- `123` - Should show: "Phone number must be exactly 10 digits"
- `12345678901` - Should show: "Phone number must be exactly 10 digits"
- `+919876543210` - Should show: "Phone number must be exactly 10 digits"

**Missing Required Fields:**
- Leave name empty - Should show: "Full Name is required"
- Leave phone empty - Should show: "Phone Number is required"

**Super Admin Without Tenant:**
- As super admin, don't select a tenant
- Try to create user
- Should show: "Please select a tenant"

### 5. Test Duplicate User

1. Create a user with phone: `9876543210`
2. Try to create another user with same phone in same tenant
3. **Expected**: Error message "User with this phone number already exists for this tenant"

## Browser Console Testing

Open browser console (F12) and check:

### Network Tab
1. Go to Network tab
2. Try to create a user
3. Look for POST request to `/api/users`
4. Check the request payload:

**Super Admin Request:**
```json
{
  "name": "Test User",
  "phone": "9876543210",
  "email": "test@example.com",
  "role": "mahall",
  "tenantId": "507f1f77bcf86cd799439012",
  "password": "123456",
  "permissions": {
    "view": true,
    "add": true,
    "edit": true,
    "delete": false
  }
}
```

**Regular User Request:**
```json
{
  "name": "Test User",
  "phone": "9876543210",
  "email": "test@example.com",
  "role": "mahall",
  "password": "123456",
  "permissions": {
    "view": true,
    "add": true,
    "edit": true,
    "delete": false
  }
}
```

5. Check the response:
   - Status: 201 (Created) for success
   - Status: 400 (Bad Request) for validation errors
   - Status: 401 (Unauthorized) for auth errors

### Console Tab
- Check for any JavaScript errors
- Should see no errors if everything works correctly

## API Testing with cURL

### Test Super Admin Create User

```bash
# Get token first (login)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "SUPER_ADMIN_PHONE",
    "password": "SUPER_ADMIN_PASSWORD"
  }'

# Use the token to create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "x-tenant-id: TENANT_ID_HERE" \
  -d '{
    "name": "Test User",
    "phone": "9876543210",
    "email": "test@example.com",
    "role": "mahall",
    "tenantId": "TENANT_ID_HERE",
    "password": "123456",
    "permissions": {
      "view": true,
      "add": true,
      "edit": true,
      "delete": false
    }
  }'
```

### Test Validation Errors

```bash
# Test invalid phone
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test User",
    "phone": "123",
    "role": "mahall",
    "tenantId": "TENANT_ID_HERE"
  }'

# Expected response:
# {
#   "success": false,
#   "message": "Validation failed",
#   "errors": [
#     {
#       "msg": "Phone number must be exactly 10 digits",
#       "param": "phone",
#       "location": "body"
#     }
#   ]
# }
```

## Troubleshooting

### Issue: Tenant dropdown not showing for super admin
**Check:**
- Is user actually logged in as super admin?
- Check browser console for errors
- Verify `isSuperAdmin` is true in auth store

### Issue: "Please select a tenant" error
**Solution:**
- Make sure to select a tenant from the dropdown
- Tenant dropdown should have options loaded

### Issue: "Tenant ID is required" from API
**Check:**
- Super admin must provide tenantId in request
- Check network tab to see if tenantId is in payload

### Issue: Phone validation failing
**Check:**
- Phone must be exactly 10 digits
- No spaces, dashes, or special characters
- No country code

### Issue: User created but can't login
**Check:**
- Default password is `123456`
- User status should be `active`
- User should have correct tenant assigned

## Success Criteria

✅ Super admin can see tenant dropdown
✅ Super admin can select tenant and create user
✅ Regular users don't see tenant dropdown
✅ Regular users can create users in their tenant
✅ Phone validation works correctly
✅ Email validation accepts empty strings
✅ Duplicate phone detection works
✅ All roles are accepted (mahall, survey, institute, member, super_admin)
✅ Created users appear in the users list
✅ Created users can login with default password

## Next Steps After Testing

1. **Change Default Password**: Users should change password after first login
2. **Test User Permissions**: Verify created users have correct permissions
3. **Test User Edit**: Try editing created users
4. **Test User Delete**: Try soft-deleting users
5. **Test Cross-Tenant**: Verify users can't see other tenant's data
