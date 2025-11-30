# Tenant-Based Data Filtering - Implementation Guide

This document explains how tenant-based data filtering is implemented to ensure users only see data from their jurisdiction (tenant).

## 🔒 **How It Works**

### **1. Frontend - API Request Interceptor**

**File:** `src/services/api.ts`

The API interceptor automatically adds the tenant ID to all requests:

```typescript
// For super admin: uses selected tenant (if any)
if (isSuperAdmin && currentTenantId) {
  config.headers['x-tenant-id'] = currentTenantId;
}

// For regular users: always uses their assigned tenant
if (!isSuperAdmin && currentTenantId) {
  config.headers['x-tenant-id'] = currentTenantId;
}
```

### **2. Backend - Tenant Middleware**

**File:** `src/middleware/tenantMiddleware.ts`

The middleware extracts tenant ID from headers and sets it on the request:

```typescript
// Super admin can access any tenant
if (req.user?.isSuperAdmin) {
  if (explicitTenantId) {
    req.tenantId = explicitTenantId;
  }
} else {
  // Regular users use their assigned tenant
  req.tenantId = req.user.tenantId.toString();
}
```

### **3. Backend - Controller Filtering**

All controllers filter data by tenant ID:

```typescript
// Example from getAllFamilies
const query: any = {};

// Super admin can see all families, others only see their tenant families
if (!req.isSuperAdmin && req.tenantId) {
  query.tenantId = req.tenantId;
} else if (tenantId && req.isSuperAdmin) {
  query.tenantId = tenantId;
}

const families = await Family.find(query);
```

### **4. Backend - Tenant Ownership Verification**

**File:** `src/utils/tenantCheck.ts`

Helper functions verify tenant ownership for getById, update, and delete operations:

```typescript
export const verifyTenantOwnership = (
  req: AuthRequest,
  res: Response,
  resourceTenantId: any,
  resourceName: string = 'Resource'
): boolean => {
  // Super admin can access any tenant's resources
  if (req.isSuperAdmin) {
    return true;
  }

  // Compare tenant IDs
  const userTenantId = req.tenantId.toString();
  const resourceTenantIdStr = resourceTenantId?.toString();

  if (userTenantId !== resourceTenantIdStr) {
    res.status(403).json({
      success: false,
      message: `${resourceName} does not belong to your tenant`,
    });
    return false;
  }
  return true;
};
```

## 📋 **Controllers with Tenant Filtering**

All these controllers implement tenant filtering:

✅ **Family Controller** - Filters families by tenant
✅ **Member Controller** - Filters members by tenant + ownership checks
✅ **Institute Controller** - Filters institutes by tenant + ownership checks
✅ **User Controller** - Filters users by tenant
✅ **Master Account Controller** - Filters accounts by tenant
✅ **Notification Controller** - Filters notifications by tenant
✅ **Registration Controller** - Filters registrations by tenant
✅ **Committee Controller** - Filters committees by tenant
✅ **Meeting Controller** - Filters meetings by tenant
✅ **Collectible Controller** - Filters collectibles by tenant
✅ **Program Controller** - Filters programs by tenant
✅ **Madrasa Controller** - Filters madrasa by tenant
✅ **Social Controller** - Filters social content by tenant
✅ **Report Controller** - Filters reports by tenant

## 🔐 **Security Features**

### **1. List Operations (GET /all)**
- ✅ Automatically filters by `req.tenantId`
- ✅ Super admin can optionally filter by specific tenant
- ✅ Regular users can only see their tenant's data

### **2. Get By ID Operations (GET /:id)**
- ✅ Verifies resource belongs to user's tenant
- ✅ Returns 403 if tenant mismatch
- ✅ Super admin can access any tenant's resources

### **3. Create Operations (POST)**
- ✅ Automatically sets `tenantId` from `req.tenantId`
- ✅ Validates tenant ID is present (for non-super-admin)
- ✅ Ensures related resources belong to same tenant

### **4. Update Operations (PUT/PATCH)**
- ✅ Verifies existing resource belongs to tenant
- ✅ Prevents cross-tenant updates
- ✅ Validates related resources belong to same tenant

### **5. Delete Operations (DELETE)**
- ✅ Verifies resource belongs to tenant before deletion
- ✅ Prevents cross-tenant deletions

## 🎯 **User Experience**

### **Super Admin:**
- Can switch between tenants using Tenant Switcher
- Can see all data when no tenant selected
- Can filter by specific tenant when selected

### **Regular Users (Mahall/Institute/Survey):**
- Always see only their tenant's data
- Cannot access other tenants' data
- Tenant ID is automatically set from their user account

## ✅ **Verification Checklist**

To ensure tenant filtering is working:

1. ✅ **Login** - User's tenantId is stored in auth store
2. ✅ **API Requests** - Tenant ID header is sent with all requests
3. ✅ **Backend Middleware** - Tenant ID is extracted and set on request
4. ✅ **List Queries** - Filtered by tenant ID
5. ✅ **Get By ID** - Ownership verified before returning
6. ✅ **Create** - Tenant ID automatically set
7. ✅ **Update** - Ownership verified before updating
8. ✅ **Delete** - Ownership verified before deleting

## 🔧 **How to Add Tenant Filtering to New Controllers**

### **Step 1: Add Tenant Filtering to List Operations**

```typescript
export const getAllResources = async (req: AuthRequest, res: Response) => {
  const { tenantId } = req.query;
  const query: any = {};

  // Super admin can see all, others only their tenant
  if (!req.isSuperAdmin && req.tenantId) {
    query.tenantId = req.tenantId;
  } else if (tenantId && req.isSuperAdmin) {
    query.tenantId = tenantId;
  }

  const resources = await Resource.find(query);
  res.json({ success: true, data: resources });
};
```

### **Step 2: Add Ownership Checks to Get/Update/Delete**

```typescript
import { verifyTenantOwnership } from '../utils/tenantCheck';

export const getResourceById = async (req: AuthRequest, res: Response) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  
  // Verify tenant ownership
  if (!verifyTenantOwnership(req, res, resource.tenantId, 'Resource')) {
    return;
  }
  
  res.json({ success: true, data: resource });
};
```

### **Step 3: Set Tenant ID on Create**

```typescript
export const createResource = async (req: AuthRequest, res: Response) => {
  const resourceData = {
    ...req.body,
    tenantId: req.tenantId || req.body.tenantId,
  };

  if (!resourceData.tenantId && !req.isSuperAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Tenant ID is required',
    });
  }

  const resource = new Resource(resourceData);
  await resource.save();
  res.status(201).json({ success: true, data: resource });
};
```

## 📊 **Current Status**

✅ **All list operations** - Filtered by tenant
✅ **Member operations** - Full tenant checks implemented
✅ **Institute operations** - Full tenant checks implemented
🔄 **Other controllers** - List filtering implemented, ownership checks can be added as needed

## 🚀 **Next Steps**

To ensure complete tenant isolation, consider adding ownership checks to:
- Family getById/update/delete
- Program getById/update/delete
- Madrasa getById/update/delete
- Committee getById/update/delete
- And other resources as needed

Use the `verifyTenantOwnership` helper function for consistent implementation.

