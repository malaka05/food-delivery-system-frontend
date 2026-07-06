'use client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartPage } from '@/components/pages/customer/CartPage';

export default function CartRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Layout>
        <CartPage />
      </Layout>
    </ProtectedRoute>
  );
}
