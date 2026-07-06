'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, Shop } from '@/types';
import { getOrdersByShop, getMyShops, createShop } from '@/lib/api';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

const chartData = [
  { time: '10:00', sales: 120 }, { time: '12:00', sales: 450 },
  { time: '14:00', sales: 300 }, { time: '16:00', sales: 200 },
  { time: '18:00', sales: 600 }, { time: '20:00', sales: 850 },
  { time: '22:00', sales: 400 },
];

function ShopDashboardContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Shop Creation State
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopDeliveryTime, setShopDeliveryTime] = useState('30-45 min');

  useEffect(() => {
    const load = async () => {
      try {
        const shops = await getMyShops();
        if (shops.length > 0) {
          setMyShop(shops[0]);
          const fetchedOrders = await getOrdersByShop();
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingShop(true);
    try {
      const newShop = await createShop({
        shopName,
        description: shopDesc,
        location: { address: shopAddress, lat: 0, lng: 0 },
        deliveryTime: shopDeliveryTime
      });
      setMyShop(newShop);
      toast.success('Shop created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create shop');
    } finally {
      setIsCreatingShop(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrders = orders.filter((o) => ['placed', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)).length;

  const stats = [
    { label: "Today's Revenue", value: `Rs. ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: '#ff4d0a', bg: '#fff4ed' },
    { label: 'Active Orders', value: activeOrders.toString(), icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff4d0a' }}></div></div>;

  if (!myShop) {
    return (
      <div className="flex-1 py-8 flex justify-center items-center" style={{ backgroundColor: '#f8fafc' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-2 text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Create Your Shop</h2>
          <p className="text-slate-500 mb-6 text-sm">You need to set up your restaurant details before you can manage menus and orders.</p>
          <form onSubmit={handleCreateShop} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Shop Name</label>
              <input type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" placeholder="e.g. Burger Joint" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea required value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" placeholder="Briefly describe your food..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input type="text" required value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" placeholder="123 Main St" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Avg. Delivery Time</label>
              <input type="text" required value={shopDeliveryTime} onChange={(e) => setShopDeliveryTime(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" placeholder="30-45 min" />
            </div>
            <button type="submit" disabled={isCreatingShop} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#ff4d0a] hover:bg-[#e03d00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4d0a] disabled:opacity-50">
              {isCreatingShop ? 'Creating...' : 'Create Shop'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{myShop.shopName} Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon; return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg, color: stat.color }}><Icon size={24} /></div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d0a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff4d0a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#ff4d0a" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{order.id}</p>
                    <p className="text-xs text-slate-500">{order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">Rs. {order.totalAmount.toFixed(2)}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: order.orderStatus === 'delivered' ? '#d1fae5' : order.orderStatus === 'placed' ? '#fef9c3' : '#dbeafe', color: order.orderStatus === 'delivered' ? '#065f46' : order.orderStatus === 'placed' ? '#854d0e' : '#1e40af' }}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopDashboardPage() {
  return <ProtectedRoute allowedRoles={['shop']}><Layout><ShopDashboardContent /></Layout></ProtectedRoute>;
}
