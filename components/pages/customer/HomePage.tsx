'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Search, ChevronRight } from 'lucide-react';
import { Shop } from '@/types';
import { getShops } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getShops().then(setShops).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filteredShops = shops.filter(
    (shop) =>
      shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [
    { name: 'Burgers', icon: '🍔' }, { name: 'Pizza', icon: '🍕' },
    { name: 'Sushi', icon: '🍣' }, { name: 'Healthy', icon: '🥗' },
    { name: 'Desserts', icon: '🍰' }, { name: 'Drinks', icon: '🥤' },
  ];

  return (
    <div className="flex-1 pb-12" style={{ backgroundColor: '#f8fafc' }}>
      {/* Hero */}
      <div className="text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#ff4d0a' }}>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: '#ff7233' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Hungry? We&apos;ve got you covered.
            </h1>
            <p className="text-orange-100 text-lg mb-8">Get your favorite food delivered hot and fresh in minutes.</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                placeholder="Search for restaurants or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 mb-10" style={{ boxShadow: '0 2px 10px -2px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
          <div className="flex overflow-x-auto pb-2 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center min-w-[80px] p-3 rounded-xl hover:bg-slate-50 transition-colors"
                onClick={() => setSearchTerm(cat.name)}
              >
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-2">{cat.icon}</div>
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Shops */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {searchTerm ? 'Search Results' : 'Featured Restaurants'}
          </h2>
          <Link href="/shops" className="font-medium hover:opacity-80 flex items-center text-sm" style={{ color: '#f03400' }}>
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm" />)}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, i) => (
              <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/shop/${shop.id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={getImageUrl(shop.image)} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center font-bold text-sm shadow-sm">
                      <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />{shop.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{shop.shopName}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-1">{shop.description}</p>
                    <div className="flex items-center text-sm text-slate-600 space-x-4">
                      <div className="flex items-center"><Clock size={16} className="mr-1.5 text-slate-400" />{shop.deliveryTime}</div>
                      <div className="flex items-center"><MapPin size={16} className="mr-1.5 text-slate-400" />{shop.tags[0]}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No restaurants found</h3>
            <p className="text-slate-500">Try adjusting your search terms</p>
            <button onClick={() => setSearchTerm('')} className="mt-4 font-medium hover:underline" style={{ color: '#f03400' }}>Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
}
