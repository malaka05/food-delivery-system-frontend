'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, ShieldCheck, Store, Bike, User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { getAllUsers, deleteUser } from '@/lib/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ROLE_ICONS: Record<string, React.ElementType> = { customer: UserIcon, shop: Store, rider: Bike, admin: ShieldCheck };
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  customer: { bg: '#dbeafe', text: '#1e40af' },
  shop:     { bg: '#fff4ed', text: '#c72402' },
  rider:    { bg: '#f5f3ff', text: '#5b21b6' },
  admin:    { bg: '#1e293b', text: '#ffffff' },
};

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(`User "${name}" deleted.`);
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = (u?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = ['customer', 'shop', 'rider', 'admin'].map((r) => ({ role: r, count: users.filter((u) => u.role === r).length }));

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>User Management</h1>
          <p className="text-slate-500">View, filter, and manage all platform users.</p>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {roleCounts.map((r, i) => {
            const Icon = ROLE_ICONS[r.role];
            const colors = ROLE_COLORS[r.role];
            return (
              <motion.button key={r.role} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setRoleFilter(roleFilter === r.role ? 'all' : r.role)}
                className="bg-white rounded-2xl p-5 shadow-sm border-2 text-left transition-all"
                style={{ borderColor: roleFilter === r.role ? colors.bg : '#f1f5f9' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: colors.bg, color: colors.text }}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-900">{isLoading ? '—' : r.count}</div>
                <div className="text-sm text-slate-500 capitalize mt-0.5">{r.role}s</div>
              </motion.button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name or email…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ff4d0a' } as React.CSSProperties} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'customer', 'shop', 'rider', 'admin'].map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors"
                  style={{ backgroundColor: roleFilter === r ? '#1e293b' : '#f1f5f9', color: roleFilter === r ? 'white' : '#475569' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={32} style={{ color: '#ff4d0a' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No users match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => {
                    const Icon = ROLE_ICONS[u.role] || UserIcon;
                    const colors = ROLE_COLORS[u.role] || { bg: '#f1f5f9', text: '#334155' };
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#ff4d0a' }}>
                              {u && u.name ? String(u.name).charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ backgroundColor: colors.bg, color: colors.text }}>
                            <Icon size={12} />{u.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{u.phone || '—'}</td>
                        <td className="p-4 text-sm text-slate-600">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={deletingId === u.id}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Delete user">
                            {deletingId === u.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
                Showing {filtered.length} of {users.length} users
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <AdminUsersContent />
      </Layout>
    </ProtectedRoute>
  );
}
