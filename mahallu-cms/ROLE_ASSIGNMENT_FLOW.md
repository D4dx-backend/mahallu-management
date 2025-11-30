# Role Assignment Flow - Complete Guide

This document explains where and how user roles are assigned throughout the system.

## 📍 **1. USER CREATION - Where Roles Are Initially Assigned**

### **Frontend (CMS) - User Creation Forms:**

#### **A. Create Mahall User**
**File:** `src/features/users/pages/CreateMahallUser.tsx`
```typescript
// Line 55: Role is hardcoded to 'mahall'
await userService.create({
  ...data,
  role: 'mahall',  // ← Role assigned here
  password: '123456',
});
```

#### **B. Create Institute User**
**File:** `src/features/users/pages/CreateInstituteUser.tsx`
```typescript
// Line 55: Role is hardcoded to 'institute'
await userService.create({
  ...data,
  role: 'institute',  // ← Role assigned here
  password: '123456',
});
```

#### **C. Create Survey User**
**File:** `src/features/users/pages/CreateSurveyUser.tsx`
```typescript
// Role is hardcoded to 'survey'
await userService.create({
  ...data,
  role: 'survey',  // ← Role assigned here
  password: '123456',
});
```

### **Backend (API) - User Controller:**

**File:** `src/controllers/userController.ts`
```typescript
// Line 60: Role comes from request body
const { name, phone, email, role, permissions, password, tenantId } = req.body;

// Line 87: Role is assigned (defaults to 'mahall' if not provided)
const user = new User({
  name,
  phone,
  email,
  role: role || 'mahall',  // ← Role assigned here (default: 'mahall')
  tenantId: finalTenantId,
  isSuperAdmin: role === 'super_admin',  // ← Super admin flag set here
  permissions: permissions || { ... },
  password: hashedPassword
});
```

### **Database Model:**

**File:** `src/models/User.ts`
```typescript
// Line 7: Role type definition
role: 'super_admin' | 'mahall' | 'survey' | 'institute';

// Line 41-45: Role validation in schema
role: {
  type: String,
  enum: ['super_admin', 'mahall', 'survey', 'institute'],  // ← Allowed roles
  required: true,
},
```

---

## 📍 **2. LOGIN - Where Role is Retrieved and Stored**

### **Frontend (CMS) - Login Process:**

**File:** `src/features/auth/pages/Login.tsx`
```typescript
// Line 83-88: After OTP verification
const response = await authService.verifyOTP({
  phone,
  otp: data.otp,
});
setUser(response.user);  // ← User object (with role) stored in auth store
setToken(response.token);
```

### **Backend (API) - Auth Controller:**

**File:** `src/controllers/authController.ts`

#### **A. OTP Verification (Line 190-275):**
```typescript
// Line 231: Find user by phone
const user = await User.findOne({ phone });

// Line 261-263: Return user with role
const userResponse = await User.findById(user._id)
  .select('-password')
  .populate('tenantId', 'name code');

// Line 265-270: Send user (with role) to frontend
res.json({
  success: true,
  data: {
    user: userResponse,  // ← Contains role field
    token,
  },
});
```

#### **B. Login (Line 8-67):**
```typescript
// Line 19: Find user
const user = await User.findOne({ phone }).select('+password');

// Line 53-55: Return user with role
const userResponse = await User.findById(user._id)
  .select('-password')
  .populate('tenantId', 'name code');

// Line 57-63: Send user (with role) to frontend
res.json({
  success: true,
  data: {
    user: userResponse,  // ← Contains role field
    token,
  },
});
```

---

## 📍 **3. STORAGE - Where Role is Stored in Frontend**

### **Auth Store:**

**File:** `src/store/authStore.ts`
```typescript
// Line 6-9: User type includes role
interface AuthState {
  user: User | null;  // ← User object contains role property
  token: string | null;
  currentTenantId: string | null;
  isSuperAdmin: boolean;
}

// Line 23-28: When user is set, role is stored
setUser: (user) =>
  set({
    user,  // ← User object with role stored here
    isSuperAdmin: user?.isSuperAdmin || false,
    currentTenantId: user?.tenantId || null,
  }),
```

### **User Type Definition:**

**File:** `src/types/index.ts`
```typescript
// Line 3-20: User interface includes role
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'super_admin' | 'mahall' | 'survey' | 'institute';  // ← Role type
  tenantId?: string;
  status: 'active' | 'inactive';
  joiningDate: string;
  lastLogin?: string;
  permissions?: Permission[];
  isSuperAdmin?: boolean;
  tenant?: { ... };
}
```

---

## 📍 **4. USAGE - Where Role is Used for Access Control**

### **A. Header Component - Display Role:**

**File:** `src/components/layout/Header.tsx`
```typescript
// Line 11: Get user from store
const { user, logout, isSuperAdmin } = useAuthStore();

// Line 74-80: Function to get role label
const getAccountTypeLabel = () => {
  if (isSuperAdmin) return 'Super Admin';
  if (user?.role === 'mahall') return 'Mahall Admin';      // ← Role check
  if (user?.role === 'survey') return 'Survey Admin';      // ← Role check
  if (user?.role === 'institute') return 'Institute Admin'; // ← Role check
  return 'User';
};

// Line 120: Display role in header
<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
  {getAccountTypeLabel()}  // ← Shows role label
</p>
```

### **B. Sidebar Component - Menu Filtering:**

**File:** `src/components/layout/Sidebar.tsx`
```typescript
// Line 15: Get user from store
const { isSuperAdmin, user } = useAuthStore();

// Line 21-22: Get user role
const userRole = user?.role || (isSuperAdmin ? 'super_admin' : null);

// Line 30-34: Check if menu item is accessible
const isAccessible = () => {
  if (item.superAdminOnly && !isSuperAdmin) {
    return false;
  }
  // Role-based access check
  if (item.allowedRoles && userRole) {
    return item.allowedRoles.includes(userRole);  // ← Role check here
  }
  return true;
};

// Line 45-50: Filter children based on role
const visibleChildren = item.children?.filter((child) => {
  if (child.superAdminOnly && !isSuperAdmin) return false;
  if (child.allowedRoles && userRole) {
    return child.allowedRoles.includes(userRole);  // ← Role check here
  }
  return true;
});
```

### **C. Menu Items Configuration:**

**File:** `src/constants/menuItems.ts`
```typescript
// Line 46-53: MenuItem interface includes allowedRoles
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path?: string;
  children?: MenuItem[];
  superAdminOnly?: boolean;
  allowedRoles?: ('super_admin' | 'mahall' | 'survey' | 'institute')[];  // ← Role restriction
}

// Example: Users menu (Line 73-82)
{
  id: 'users',
  label: 'Users',
  icon: FiUsers,
  allowedRoles: ['super_admin', 'mahall'],  // ← Only these roles can see
  children: [
    { 
      id: 'mahall-users', 
      label: 'Mahall Users', 
      path: '/users/mahall',
      allowedRoles: ['super_admin', 'mahall']  // ← Role restriction
    },
    // ...
  ],
},
```

---

## 📍 **5. SUPER ADMIN CREATION**

### **Backend Script:**

**File:** `src/utils/createSuperAdmin.ts`
```typescript
// Role is set to 'super_admin'
const superAdmin = new User({
  name: 'Super Admin',
  phone: '9999999999',
  email: 'admin@mahallu.com',
  role: 'super_admin',  // ← Super admin role assigned
  isSuperAdmin: true,   // ← Super admin flag set
  tenantId: null,       // ← No tenant for super admin
  // ...
});
```

---

## 🔄 **Complete Flow Summary:**

1. **User Creation** → Role assigned in frontend form (hardcoded) → Sent to backend → Stored in database
2. **Login** → User retrieved from database (with role) → Sent to frontend → Stored in auth store
3. **Access Control** → Role read from auth store → Used to filter menus → Used to display role label

---

## 🎯 **Key Points:**

- **Role is assigned** during user creation (frontend forms)
- **Role is stored** in MongoDB database (User model)
- **Role is retrieved** during login/authentication
- **Role is stored** in frontend auth store (Zustand)
- **Role is used** for menu filtering and display in Header/Sidebar

