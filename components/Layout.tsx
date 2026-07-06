'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  Menu, X, ShoppingBag, Home, Store, User as UserIcon,
  LogOut, LayoutDashboard, UtensilsCrossed, ClipboardList,
  Bike, Users, BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role } from '@/types';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, login } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'customer':
        return [
          { name: 'Home', path: '/', icon: Home },
          { name: 'Shops', path: '/shops', icon: Store },
          { name: 'Orders', path: '/orders', icon: ClipboardList },
          { name: 'Profile', path: '/profile', icon: UserIcon },
        ];
      case 'shop':
        return [
          { name: 'Menu', path: '/shop/menu', icon: UtensilsCrossed },
          { name: 'Orders', path: '/shop/orders', icon: ClipboardList },
        ];
      case 'rider':
        return [
          { name: 'Dashboard', path: '/rider/dashboard', icon: LayoutDashboard },
          { name: 'Active Delivery', path: '/rider/active', icon: Bike },
          { name: 'History', path: '/rider/history', icon: ClipboardList },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Shops', path: '/admin/shops', icon: Store },
          { name: 'Riders', path: '/admin/riders', icon: Bike },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link
                href={user?.role === 'customer' ? '/' : `/${user?.role}/dashboard`}
                className="flex items-center ml-2 md:ml-0"
              >
                <span className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#ff4d0a' }}>
                  FoodGo
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[#ff4d0a]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: '#fff4ed' } : {}}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">


              {user?.role === 'customer' && (
                <Link href="/cart" className="relative p-2 text-slate-600 hover:text-[#ff4d0a] transition-colors">
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 rounded-full" style={{ backgroundColor: '#ff4d0a' }}>
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#ff4d0a' }}>
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-[#ff4d0a]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: '#fff4ed' } : {}}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}


            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};
