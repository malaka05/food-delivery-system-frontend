'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, ShoppingBag, TrendingUp, Trash2 } from 'lucide-react';
import { User } from '@/types';
import { getAllUsers, deleteUser } from '@/lib/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminDashboardContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted successfully');
    } catch { toast.error('Failed to delete user'); }
  };

  const roleCount = (role: string) => users.filter((u) => u.role === role).length;

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Shop Owners', value: roleCount('shop').toString(), icon: Store, color: '#ff4d0a', bg: '#fff4ed' },
    { label: 'Total Orders', value: '—', icon: ShoppingBag, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Platform Growth', value: '+18%', icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  const roleBadgeColors: Record<string, string> = {
    customer: 'bg-blue-100 text-blue-800', shop: 'bg-orange-100 text-orange-800',
    rider: 'bg-purple-100 text-purple-800', admin: 'bg-slate-700 text-white',
  };

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-slate-500">Platform overview and user management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => { const Icon = stat.icon; return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.bg, color: stat.color }}><Icon size={24} /></div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
              <div className="text-2xl font-bold text-slate-900">{isLoading ? '...' : stat.value}</div>
            </motion.div>
          ); })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold mr-3" style={{ background: 'linear-gradient(135deg, #ff4d0a, #c72402)' }}>
                          {user && user.name ? String(user.name).charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${roleBadgeColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{user.phone || '—'}</td>
                    <td className="p-4 text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboardContent /></Layout></ProtectedRoute>;
}
