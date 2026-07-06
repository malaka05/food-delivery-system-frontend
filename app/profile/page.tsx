'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateUserProfile, uploadAvatar } from '@/lib/api';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-800',
  shop: 'bg-orange-100 text-orange-800',
  rider: 'bg-purple-100 text-purple-800',
  admin: 'bg-slate-700 text-white',
};

function ProfileContent() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({ name: form.name, phone: form.phone, address: form.address });
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile. Make sure the backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const updatedUser = await uploadAvatar(formData);
      updateUser(updatedUser);
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : 'https://food-delivery-system-backend-eight.vercel.app';
    return `${baseUrl}${avatar}`;
  };

  return (
    <div className="flex-1 py-10" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarChange}
        />

        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #ff4d0a 0%, #c72402 100%)' }}>
              {isUploading ? (
                <Loader2 size={32} className="animate-spin text-white" />
              ) : user.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={14} className="text-slate-500" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{user.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
            <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[user.role]}`}>{user.role}</span>
              <span className="text-xs text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={form.name} disabled={!isEditing}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 transition-colors"
                  style={{ borderColor: '#e2e8f0', '--tw-ring-color': '#ff4d0a' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={user.email} disabled
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-slate-400 text-sm bg-slate-50 cursor-not-allowed"
                  style={{ borderColor: '#e2e8f0' }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel" value={form.phone} disabled={!isEditing} placeholder="Enter phone number"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 transition-colors"
                  style={{ borderColor: '#e2e8f0', '--tw-ring-color': '#ff4d0a' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Delivery Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  value={form.address} disabled={!isEditing} placeholder="Enter your default delivery address" rows={2}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-slate-900 text-sm resize-none disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 transition-colors"
                  style={{ borderColor: '#e2e8f0', '--tw-ring-color': '#ff4d0a' } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 flex gap-3">
              <button onClick={handleSave} disabled={isSaving}
                className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#ff4d0a' }}>
                {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => { setIsEditing(false); setForm({ name: user.name, phone: user.phone ?? '', address: user.address ?? '' }); }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Account section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-700">Account Status</p>
                <p className="text-xs text-slate-500">Your account is active and in good standing</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-700">Role</p>
                <p className="text-xs text-slate-500 capitalize">{user.role} access level</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${ROLE_COLORS[user.role]}`}>{user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 text-red-500 font-semibold hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProfileContent />
      </Layout>
    </ProtectedRoute>
  );
}
