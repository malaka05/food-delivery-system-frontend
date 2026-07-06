'use client';
import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { getAllUsers } from '@/lib/api';
import { Bike, MapPin } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminRidersContent() {
  const [riders, setRiders] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((all) => setRiders(all.filter((u) => u.role === 'rider')))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Rider Management</h1>
          <p className="text-slate-500">All registered delivery riders on the platform.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse shadow-sm" />)
          ) : riders.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl p-12 text-center shadow-sm">
              <Bike size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No riders found</h3>
            </div>
          ) : riders.map((rider) => (
            <div key={rider.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl mr-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                {rider && rider.name ? String(rider.name).charAt(0) : '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{rider.name}</h3>
                <p className="text-sm text-slate-500">{rider.email}</p>
                {rider.phone && (
                  <p className="text-sm text-slate-600 mt-1 flex items-center"><MapPin size={12} className="mr-1 text-slate-400" />{rider.phone}</p>
                )}
                <div className="mt-2">
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">Active Rider</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminRidersPage() {
  return <ProtectedRoute allowedRoles={['admin']}><Layout><AdminRidersContent /></Layout></ProtectedRoute>;
}
