'use client';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OrderTrackingPage } from '@/components/pages/customer/OrderTrackingPage';

export default function OrderTrackingRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Layout>
        <OrderTrackingPage />
      </Layout>
    </ProtectedRoute>
  );
}
