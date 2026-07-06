'use client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ShopDetailPage } from '@/components/pages/customer/ShopDetailPage';

export default function ShopDetailRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Layout>
        <ShopDetailPage />
      </Layout>
    </ProtectedRoute>
  );
}
