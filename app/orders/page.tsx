'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { getMyOrders } from '@/lib/api';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  placed: { bg: '#fef9c3', text: '#854d0e', label: 'Order Placed' },
  accepted: { bg: '#dbeafe', text: '#1e40af', label: 'Accepted' },
  preparing: { bg: '#ede9fe', text: '#5b21b6', label: 'Preparing' },
  ready: { bg: '#d1fae5', text: '#065f46', label: 'Ready' },
  out_for_delivery: { bg: '#fff4ed', text: '#c72402', label: 'Out for Delivery' },
  delivered: { bg: '#dcfce7', text: '#166534', label: 'Delivered' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
};

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: '#ff4d0a' }} />
      </div>
    );
  }

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Orders</h1>
          <p className="text-slate-500">Track all your past and current orders.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-8">Start ordering from your favourite restaurants!</p>
            <Link href="/" className="inline-flex items-center font-semibold text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: '#ff4d0a' }}>
              Browse Restaurants <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const s = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.placed;
              const isActive = !['delivered', 'cancelled'].includes(order.orderStatus);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fff4ed' }}>
                        {order.orderStatus === 'delivered'
                          ? <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                          : <Clock size={24} style={{ color: '#ff4d0a' }} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.text }}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {item.quantity}× {item.name}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{order.items.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: total + CTA */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xl font-bold text-slate-900">Rs. {order.totalAmount.toFixed(2)}</span>
                      {isActive ? (
                        <Link
                          href={`/order/${order.id}`}
                          className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center"
                          style={{ backgroundColor: '#ff4d0a' }}
                        >
                          Track Order <ChevronRight size={16} className="ml-1" />
                        </Link>
                      ) : (
                        <Link
                          href={`/order/${order.id}`}
                          className="text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center border border-slate-200 text-slate-600"
                        >
                          View Details <ChevronRight size={16} className="ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for active orders */}
                  {isActive && order.orderStatus !== 'cancelled' && (
                    <div className="px-5 pb-4">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            backgroundColor: '#ff4d0a',
                            width: ({
                              placed: '10%', accepted: '30%', preparing: '55%', ready: '75%', out_for_delivery: '90%',
                            } as Record<string, string>)[order.orderStatus] || '10%',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Layout>
        <OrdersContent />
      </Layout>
    </ProtectedRoute>
  );
}
