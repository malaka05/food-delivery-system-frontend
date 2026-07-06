'use client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/components/pages/customer/HomePage';

export default function ShopsRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Layout>
        <HomePage />
      </Layout>
    </ProtectedRoute>
  );
}
