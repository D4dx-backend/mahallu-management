# Role-Based Restrictions Summary

This document lists ALL role-based restrictions implemented in the system.

## 📊 **Total Count: 19 Role-Based Restrictions**

---

## 🎯 **1. FRONTEND - Menu Item Restrictions (13 items)**

### **A. Super Admin Only Restrictions (3 items)**

**File:** `src/constants/menuItems.ts`

1. **Admin Menu** (Parent)
   - `superAdminOnly: true`
   - Line 67

2. **Tenants Management** (Child)
   - `superAdminOnly: true`
   - Line 69
   - Path: `/admin/tenants`

3. **All Users** (Child)
   - `superAdminOnly: true`
   - Line 70
   - Path: `/admin/users`

### **B. Role-Based Restrictions (10 items)**

**File:** `src/constants/menuItems.ts`

4. **Users Menu** (Parent)
   - `allowedRoles: ['super_admin', 'mahall']`
   - Line 77
   - **Restricts:** Only super_admin and mahall can see this menu

5. **Mahall Users** (Child)
   - `allowedRoles: ['super_admin', 'mahall']`
   - Line 79
   - Path: `/users/mahall`

6. **Survey Users** (Child)
   - `allowedRoles: ['super_admin', 'mahall']`
   - Line 80
   - Path: `/users/survey`

7. **Institute Users** (Child)
   - `allowedRoles: ['super_admin', 'mahall']`
   - Line 81
   - Path: `/users/institute`

8. **Master Accounts Menu** (Parent)
   - `allowedRoles: ['super_admin', 'mahall', 'institute']`
   - Line 94
   - **Restricts:** Only super_admin, mahall, and institute can see this menu

9. **Institute Accounts** (Child)
   - `allowedRoles: ['super_admin', 'mahall', 'institute']`
   - Line 96
   - Path: `/master-accounts/institute`

10. **Institute Categories** (Child)
    - `allowedRoles: ['super_admin', 'mahall', 'institute']`
    - Line 97
    - Path: `/master-accounts/categories`

11. **Institute Wallets** (Child)
    - `allowedRoles: ['super_admin', 'mahall', 'institute']`
    - Line 98
    - Path: `/master-accounts/wallets`

12. **Ledgers** (Child)
    - `allowedRoles: ['super_admin', 'mahall', 'institute']`
    - Line 99
    - Path: `/master-accounts/ledgers`

13. **Ledger Items** (Child)
    - `allowedRoles: ['super_admin', 'mahall', 'institute']`
    - Line 100
    - Path: `/master-accounts/ledger-items`

---

## 🛡️ **2. FRONTEND - Protected Route Restrictions (5 routes)**

**File:** `src/App.tsx`

14. **Tenants List Route**
    - `superAdminOnly: true`
    - Line 123
    - Path: `/admin/tenants`

15. **Create Tenant Route**
    - `superAdminOnly: true`
    - Line 133
    - Path: `/admin/tenants/create`

16. **Edit Tenant Route** (if exists)
    - `superAdminOnly: true`
    - Line 947

17. **Mahall Main Route** (if restricted)
    - `superAdminOnly: true`
    - Line 957

18. **All Users Route**
    - `superAdminOnly: true`
    - Line 967
    - Path: `/admin/users`

---

## 🔒 **3. BACKEND - Middleware Restrictions (1 middleware)**

**File:** `src/middleware/authMiddleware.ts`

19. **Super Admin Only Middleware**
    - Function: `superAdminOnly`
    - Line 44-56
    - **Usage:** Applied to routes that require super admin access
    - **Returns:** 403 error if user is not super admin

---

## 📋 **Restriction Types Summary**

### **By Restriction Type:**

| Type | Count | Description |
|------|-------|-------------|
| `superAdminOnly` | 8 | Only super admin can access |
| `allowedRoles` | 10 | Specific roles can access |
| **Total** | **18** | |

### **By Location:**

| Location | Count | Items |
|----------|-------|-------|
| Menu Items | 13 | Lines 67-100 in menuItems.ts |
| Protected Routes | 5 | Lines 123-967 in App.tsx |
| Backend Middleware | 1 | Line 44 in authMiddleware.ts |
| **Total** | **19** | |

### **By Role Access:**

| Role | Can Access |
|------|------------|
| **super_admin** | ✅ All menus and routes |
| **mahall** | ✅ Users menu, Master Accounts menu, All other menus |
| **institute** | ✅ Master Accounts menu only, All other menus |
| **survey** | ✅ All menus except Users and Admin |

---

## 🎯 **How Restrictions Work**

### **1. Menu Filtering (Sidebar.tsx)**
```typescript
// Checks superAdminOnly
if (item.superAdminOnly && !isSuperAdmin) {
  return null; // Hide menu
}

// Checks allowedRoles
if (item.allowedRoles && userRole) {
  return item.allowedRoles.includes(userRole); // Show if role matches
}
```

### **2. Route Protection (ProtectedRoute.tsx)**
```typescript
if (superAdminOnly && !isSuperAdmin) {
  return <Navigate to="/dashboard" replace />; // Redirect if not super admin
}
```

### **3. Backend Protection (authMiddleware.ts)**
```typescript
if (!req.isSuperAdmin) {
  return res.status(403).json({
    success: false,
    message: 'Super admin access required',
  });
}
```

---

## 📝 **Current Restrictions Breakdown**

### **Super Admin Only (8 items):**
- Admin menu (parent + 2 children)
- 5 protected routes

### **Role-Based Access (10 items):**
- Users menu: `['super_admin', 'mahall']` (1 parent + 3 children)
- Master Accounts: `['super_admin', 'mahall', 'institute']` (1 parent + 5 children)

### **No Restrictions (Open to All):**
- Dashboard
- Mahall Main
- Notifications
- Reports
- Data (Families, Members, Collections, Institutes, Programs, Madrasa, Committees)
- Registrations
- Collectibles
- Social

---

## 🔧 **How to Add More Restrictions**

### **Add Menu Restriction:**
```typescript
{
  id: 'some-menu',
  label: 'Some Menu',
  icon: FiIcon,
  allowedRoles: ['super_admin', 'mahall'], // Add this
  path: '/some-path'
}
```

### **Add Route Restriction:**
```typescript
<Route
  path="/some-path"
  element={
    <ProtectedRoute superAdminOnly> {/* Add this */}
      <SomeComponent />
    </ProtectedRoute>
  }
/>
```

### **Add Backend Restriction:**
```typescript
router.get('/some-route', 
  authMiddleware, 
  superAdminOnly, // Add this middleware
  someController
);
```

