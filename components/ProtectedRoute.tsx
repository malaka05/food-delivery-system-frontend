'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const defaultRoutes: Record<Role, string> = {
          customer: '/',
          shop: '/shop/dashboard',
          rider: '/rider/dashboard',
          admin: '/admin/dashboard',
        };
        router.replace(defaultRoutes[user.role]);
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff4d0a' }}></div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
};
