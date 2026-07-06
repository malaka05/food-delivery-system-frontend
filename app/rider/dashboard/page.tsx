'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Package } from 'lucide-react';
import { Order } from '@/types';
import { getAvailableDeliveries, assignRider } from '@/lib/api';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function RiderDashboardContent() {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await assignRider(orderId);
      router.push(`/rider/active?orderId=${orderId}`);
    } catch (error) {
      console.error('Failed to assign rider:', error);
    }
  };

  useEffect(() => {
    getAvailableDeliveries().then(setDeliveries).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: "Today's Deliveries", value: '12', icon: Package, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Earnings', value: 'Rs. 84.50', icon: DollarSign, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Active Time', value: '4h 32m', icon: Clock, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Rider Dashboard</h1>
          <p className="text-slate-500">Available deliveries in your area.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon; return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.bg, color: stat.color }}><Icon size={24} /></div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-start">
          <div className="text-2xl mr-3">📱</div>
          <div>
            <h3 className="font-bold text-emerald-900 mb-1">WhatsApp Notifications Active</h3>
            <p className="text-sm text-emerald-700">You&apos;ll receive instant WhatsApp alerts for new delivery requests.</p>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Available Deliveries</h2>
          </div>
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading deliveries...</div>
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Package size={32} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No deliveries available</h3>
              <p className="text-slate-500">Check back soon for new delivery requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deliveries.map((delivery, i) => (
                <motion.div key={delivery.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-slate-900 mr-3">Order #{delivery.id.slice(-6).toUpperCase()}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            backgroundColor: delivery.orderStatus === 'ready' ? '#d1fae5' : '#fff4ed',
                            color: delivery.orderStatus === 'ready' ? '#065f46' : '#c72402'
                          }}
                        >
                          {delivery.orderStatus === 'ready' ? 'Ready for Pickup' : 'Assign Pending'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-slate-400" /><span className="font-medium">Deliver to:</span><span className="ml-2">{delivery.customerLocation?.address}</span></div>
                        <div className="flex items-center"><Package size={16} className="mr-2 text-slate-400" /><span className="font-medium">{delivery.items.length} items</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">Rs. {(delivery.totalAmount * 0.15).toFixed(2)}</div>
                        <div className="text-xs text-slate-500">Estimated earnings</div>
                      </div>
                      <button onClick={() => handleAcceptDelivery(delivery.id)} className="text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#ff4d0a' }}>Accept Delivery</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiderDashboardPage() {
  return <ProtectedRoute allowedRoles={['rider']}><Layout><RiderDashboardContent /></Layout></ProtectedRoute>;
}
