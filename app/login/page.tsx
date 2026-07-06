'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Wait for localStorage to update and we can redirect based on role
      const storedUser = localStorage.getItem('foodgo_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const routes: Record<Role, string> = {
          customer: '/',
          shop: '/shop/menu',
          rider: '/rider/dashboard',
          admin: '/admin/dashboard',
        };
        router.push(routes[user.role as Role] || '/');
      }
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#ff4d0a' }}>FoodGo</h1>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-slate-100"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
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
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#ff4d0a] focus:outline-none focus:ring-[#ff4d0a] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg px-3 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-70 transition-colors"
                style={{ backgroundColor: '#ff4d0a' }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium hover:underline" style={{ color: '#ff4d0a' }}>
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
