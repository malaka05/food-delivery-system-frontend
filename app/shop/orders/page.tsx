'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChefHat, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { getOrdersByShop, updateOrderStatus } from '@/lib/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function ShopOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrdersByShop()
      .then((data) => setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus));

  const statusColor = (s: OrderStatus) => {
    const map: Partial<Record<OrderStatus, string>> = { placed: 'bg-yellow-200 text-yellow-800', accepted: 'bg-blue-100 text-blue-800', preparing: 'bg-purple-100 text-purple-800', ready: 'bg-emerald-100 text-emerald-800' };
    return map[s] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Orders</h1>
            <p className="text-slate-500">Manage incoming and active orders.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Receiving Live Updates</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#ff4d0a' }}></div></div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><ShoppingBag size={32} /></div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No active orders</h3>
            <p className="text-slate-500">Waiting for new orders to arrive...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeOrders.map((order) => (
                <motion.div key={order.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border-2"
                  style={{ borderColor: order.orderStatus === 'placed' ? '#facc15' : '#f1f5f9' }}>
                  <div className="p-4 border-b" style={{ backgroundColor: order.orderStatus === 'placed' ? '#fefce8' : 'white', borderColor: order.orderStatus === 'placed' ? '#fef08a' : '#f1f5f9' }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900">#{order.id.slice(-6)}</h3>
                      <span className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold ${statusColor(order.orderStatus)}`}>{order.orderStatus.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <ul className="space-y-2">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700"><span className="text-slate-400 mr-2">{item.quantity}x</span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                      <span>Total</span><span>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    {order.orderStatus === 'placed' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 flex items-center justify-center"><X size={16} className="mr-1" />Reject</button>
                        <button onClick={() => handleStatusUpdate(order.id, 'accepted')} className="flex-1 py-2 text-white rounded-xl font-medium text-sm flex items-center justify-center" style={{ backgroundColor: '#ff4d0a' }}><Check size={16} className="mr-1" />Accept</button>
                      </div>
                    )}
                    {order.orderStatus === 'accepted' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'preparing')} className="w-full py-2 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 flex items-center justify-center"><ChefHat size={16} className="mr-2" />Start Preparing</button>
                    )}
                    {order.orderStatus === 'preparing' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="w-full py-2 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 flex items-center justify-center"><ShoppingBag size={16} className="mr-2" />Mark as Ready</button>
                    )}
                    {order.orderStatus === 'ready' && <div className="text-center text-sm font-medium text-slate-500 py-2">Waiting for rider pickup...</div>}
                    {order.orderStatus === 'out_for_delivery' && <div className="text-center text-sm font-medium py-2" style={{ color: '#f03400' }}>Out for delivery 🛵</div>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopOrdersPage() {
  return <ProtectedRoute allowedRoles={['shop']}><Layout><ShopOrdersContent /></Layout></ProtectedRoute>;
}
