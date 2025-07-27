import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  redirectTo = '/handler/signin' 
}: ProtectedRouteProps) {
  const { user, hasPermission, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, hasPermission, requiredPermission, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}

