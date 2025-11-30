import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  superAdminOnly?: boolean;
}

export default function ProtectedRoute({ children, superAdminOnly = false }: ProtectedRouteProps) {
  const { user, isSuperAdmin } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

