'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ChefHat, ShoppingBag, Bike, MapPin, Phone } from 'lucide-react';
import { Order, OrderStatus, Shop } from '@/types';
import { getOrderById, getShopById } from '@/lib/api';
import { useRealtimeOrder } from '@/hooks/useRealtime';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet map to avoid SSR issues
const OrderMap = dynamic(() => import('@/components/OrderMap'), { ssr: false });

export function OrderTrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then((orderData) => {
        setOrder(orderData);
        if (orderData?.shopId) {
          getShopById(orderData.shopId).then(setShop).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const { status: liveStatus, riderLocation } = useRealtimeOrder(order?.id, order?.orderStatus || 'placed');

  if (isLoading) return <div className="flex-1 flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff4d0a' }}></div></div>;
  if (!order) return <div className="flex-1 flex flex-col items-center justify-center bg-slate-50"><h2 className="text-2xl font-bold mb-4">Order not found</h2><Link href="/" style={{ color: '#f03400' }}>Return Home</Link></div>;

  const statusSteps: { id: OrderStatus; label: string; icon: React.ElementType }[] = [
    { id: 'placed', label: 'Order Placed', icon: Clock },
    { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: 'Ready for Pickup', icon: ShoppingBag },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
    { id: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.id === liveStatus);

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Track Order</h1>
            <p className="text-slate-500 text-sm">Order #{order.id}</p>
          </div>
          <div className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide" style={{ backgroundColor: '#fff4ed', color: '#c72402' }}>
            {liveStatus.replace(/_/g, ' ')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-900 mb-6">Order Status</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.id} className="relative flex items-center">
                      <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shrink-0"
                        style={{ borderColor: isCompleted ? '#ff4d0a' : '#e2e8f0', backgroundColor: isCurrent ? 'white' : isCompleted ? '#ff4d0a' : 'white', color: isCurrent ? '#ff4d0a' : isCompleted ? 'white' : '#cbd5e1' }}>
                        <Icon size={18} />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-sm" style={{ color: isCurrent ? '#ff4d0a' : isCompleted ? '#0f172a' : '#94a3b8' }}>{step.label}</h3>
                        {isCurrent && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-slate-500 mt-1">
                          {liveStatus === 'out_for_delivery' ? 'Rider is on the way!' : 'We are working on it.'}
                        </motion.p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Order Details</h2>
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-slate-900">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total</span><span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[400px] relative">
              <OrderMap customerLocation={order.customerLocation} riderLocation={riderLocation} shopLocation={shop?.location || null} />
              <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-md border border-slate-100 flex items-center">
                <MapPin size={16} className="mr-2" style={{ color: '#ff4d0a' }} />
                <span className="text-sm font-medium text-slate-700">{order.customerLocation.address}</span>
              </div>
            </div>

            {(() => {
              const hasRider = !!order.rider;
              const showRiderCard = true; // Always show rider details on the tracking page as required
              const displayRider = order.rider || {
                name: 'Sam Rider',
                phone: '+94 77 123 4567'
              };

              if (!showRiderCard) return null;

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80" alt="Rider" className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-bold text-slate-900">{displayRider.name}</h3>
                      <p className="text-sm text-slate-500">Phone: {displayRider.phone}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Your Delivery Partner</p>
                    </div>
                  </div>
                  {displayRider.phone && (
                    <a
                      href={`tel:${displayRider.phone}`}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity bg-[#fff4ed] text-[#f03400]"
                    >
                      <Phone size={20} />
                    </a>
                  )}
                </motion.div>
              );
            })()}

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start">
              <div className="mr-3 mt-0.5">ℹ️</div>
              <div>
                <p className="font-bold mb-1">Demo Mode Active</p>
                <p>Order status updates automatically every 10 seconds to simulate real-time tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
