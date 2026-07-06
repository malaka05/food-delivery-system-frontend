'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, Navigation, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getOrderById, updateOrderStatus } from '@/lib/api';
import { Order } from '@/types';
import dynamic from 'next/dynamic';

const ActiveDeliveryMap = dynamic(() => import('@/components/ActiveDeliveryMap'), { ssr: false });

function ActiveDeliveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<'picked_up' | 'on_the_way' | 'arrived'>('picked_up');

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    getOrderById(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const delivery = {
    orderId: order ? `ORD-${order.id.slice(-6).toUpperCase()}` : 'ORD-1001',
    customerName: order?.customer?.name || 'Alex Customer',
    customerPhone: order?.customer?.phone || '+1234567890',
    pickupLocation: order?.shop?.location || { lat: 6.9275, lng: 79.8615, address: order?.shop?.name ? `${order.shop.name}, Colombo` : 'The Burger Joint, 123 Burger St' },
    deliveryLocation: order?.customerLocation || { lat: 6.9272, lng: 79.8620, address: '100 Main St, Apt 4B' },
    items: order?.items.length || 3,
  };

  const handleStatusUpdate = async (newStatus: typeof deliveryStatus) => {
    setDeliveryStatus(newStatus);
    toast.success(`Status updated: ${newStatus.replace(/_/g, ' ')}`);

    if (orderId) {
      try {
        await updateOrderStatus(orderId, 'out_for_delivery');
      } catch (err) {
        console.error('Failed to sync status update to backend:', err);
      }
    }
  };

  const handleCompleteDelivery = async () => {
    if (orderId) {
      try {
        await updateOrderStatus(orderId, 'delivered');
      } catch (err) {
        console.error('Failed to update delivery finish status:', err);
      }
    }
    toast.success('Delivery completed! 🎉');
    setTimeout(() => router.push('/rider/dashboard'), 1500);
  };

  const statusColors = {
    picked_up: 'bg-blue-100 text-blue-700',
    on_the_way: 'bg-purple-100 text-purple-700',
    arrived: 'bg-emerald-100 text-emerald-700'
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading delivery details...</div>;
  }

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex-1 relative mb-6" style={{ minHeight: '400px' }}>
            <ActiveDeliveryMap pickupLocation={delivery.pickupLocation} deliveryLocation={delivery.deliveryLocation} />
            <div className="absolute top-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-slate-900">{delivery.orderId}</h2>
                  <p className="text-sm text-slate-500">{delivery.items} items</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[deliveryStatus]}`}>
                  {deliveryStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-start mb-4">
                <MapPin size={16} className="mr-2 mt-0.5 shrink-0" style={{ color: '#ff4d0a' }} />
                <div>
                  <div className="font-medium text-slate-900 text-sm">{delivery.customerName}</div>
                  <div className="text-slate-600 text-sm">{delivery.deliveryLocation.address}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {delivery.customerPhone && (
                  <a
                    href={`tel:${delivery.customerPhone}`}
                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold flex items-center justify-center hover:bg-slate-200 transition-colors text-sm"
                  >
                    <Phone size={16} className="mr-2" />Call Customer
                  </a>
                )}
                <button className="flex-1 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center hover:opacity-90 transition-opacity text-sm" style={{ backgroundColor: '#ff4d0a' }}>
                  <Navigation size={16} className="mr-2" />Navigate
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="max-w-4xl mx-auto">
              {deliveryStatus === 'picked_up' && (
                <button onClick={() => handleStatusUpdate('on_the_way')} className="w-full text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity animate-pulse" style={{ backgroundColor: '#ff4d0a' }}>
                  Start Delivery
                </button>
              )}
              {deliveryStatus === 'on_the_way' && (
                <button onClick={() => handleStatusUpdate('arrived')} className="w-full bg-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-600 transition-colors">
                  I&apos;ve Arrived
                </button>
              )}
              {deliveryStatus === 'arrived' && (
                <button onClick={handleCompleteDelivery} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors flex items-center justify-center">
                  <CheckCircle2 size={24} className="mr-2" />Complete Delivery
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiderActiveContentWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading active delivery view...</div>}>
      <ActiveDeliveryContent />
    </Suspense>
  );
}

export default function RiderActivePage() {
  return (
    <ProtectedRoute allowedRoles={['rider']}>
      <Layout>
        <RiderActiveContentWrapper />
      </Layout>
    </ProtectedRoute>
  );
}
