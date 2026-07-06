'use client';
import React from 'react';
import { CheckCircle2, MapPin, Clock, DollarSign } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const mockHistory = [
  { id: 'ORD-1001', date: '2024-01-15 14:30', address: '100 Main St, Apt 4B', earnings: 8.5, duration: '22 min' },
  { id: 'ORD-1002', date: '2024-01-15 13:15', address: '456 Oak Ave', earnings: 6.75, duration: '18 min' },
  { id: 'ORD-1003', date: '2024-01-15 12:00', address: '789 Pine Rd', earnings: 9.25, duration: '25 min' },
  { id: 'ORD-1004', date: '2024-01-14 19:45', address: '321 Elm St', earnings: 7.5, duration: '20 min' },
  { id: 'ORD-1005', date: '2024-01-14 18:30', address: '654 Maple Dr', earnings: 10.0, duration: '28 min' },
];

function DeliveryHistoryContent() {
  const totalEarnings = mockHistory.reduce((sum, d) => sum + d.earnings, 0);

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Delivery History</h1>
          <p className="text-slate-500">Your completed deliveries and earnings.</p>
        </div>
        <div className="rounded-2xl p-6 mb-8 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #ff4d0a 0%, #f03400 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Total Earnings (Last 7 Days)</p>
              <h2 className="text-4xl font-bold">Rs. {totalEarnings.toFixed(2)}</h2>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><DollarSign size={32} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-orange-400 flex items-center justify-between text-sm">
            <span className="text-orange-100">{mockHistory.length} deliveries completed</span>
            <span className="font-bold">Rs. {(totalEarnings / mockHistory.length).toFixed(2)} avg per delivery</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Date &amp; Time</th>
                  <th className="p-4 font-medium">Delivery Address</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockHistory.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3"><CheckCircle2 size={16} className="text-emerald-600" /></div>
                        <span className="font-bold text-slate-900">#{delivery.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{delivery.date}</td>
                    <td className="p-4"><div className="flex items-center text-sm text-slate-600"><MapPin size={14} className="mr-2 text-slate-400" />{delivery.address}</div></td>
                    <td className="p-4"><div className="flex items-center text-sm text-slate-600"><Clock size={14} className="mr-2 text-slate-400" />{delivery.duration}</div></td>
                    <td className="p-4 text-right font-bold text-emerald-600">+Rs. {delivery.earnings.toFixed(2)}</td>
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

export default function RiderHistoryPage() {
  return <ProtectedRoute allowedRoles={['rider']}><Layout><DeliveryHistoryContent /></Layout></ProtectedRoute>;
}
