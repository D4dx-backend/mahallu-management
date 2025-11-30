import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Check if a resource belongs to the user's tenant
 * Super admin can access any tenant's resources
 */
export const checkTenantOwnership = (
  req: AuthRequest,
  resourceTenantId: any,
  resourceName: string = 'Resource'
): boolean => {
  // Super admin can access any tenant's resources
  if (req.isSuperAdmin) {
    return true;
  }

  // If user has no tenant, deny access
  if (!req.tenantId) {
    return false;
  }

  // Compare tenant IDs (handle both string and ObjectId)
  const userTenantId = req.tenantId.toString();
  const resourceTenantIdStr = resourceTenantId?.toString();

  return userTenantId === resourceTenantIdStr;
};

/**
 * Middleware helper to verify tenant ownership
 * Returns 403 if resource doesn't belong to user's tenant
 */
export const verifyTenantOwnership = (
  req: AuthRequest,
  res: Response,
  resourceTenantId: any,
  resourceName: string = 'Resource'
): boolean => {
  if (!checkTenantOwnership(req, resourceTenantId, resourceName)) {
    res.status(403).json({
      success: false,
      message: `${resourceName} does not belong to your tenant or you don't have permission to access it`,
    });
    return false;
  }
  return true;
};

