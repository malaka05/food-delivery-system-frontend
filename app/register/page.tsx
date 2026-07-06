'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password, phone, role });
      // Redirect based on role after registration
      const routes: Record<Role, string> = {
        customer: '/',
        shop: '/shop/dashboard',
        rider: '/rider/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(routes[role] || '/');
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#ff4d0a' }}>FoodGo</h1>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">Create an account</h2>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-slate-100"
        >
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="mt-1">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">I want to register as</label>
              <div className="mt-1">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="rider">Delivery Rider</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-70 transition-colors"
                style={{ backgroundColor: '#ff4d0a' }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium hover:underline" style={{ color: '#ff4d0a' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
