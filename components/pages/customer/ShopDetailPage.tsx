'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Plus, Minus, ArrowLeft, Info } from 'lucide-react';
import { Shop, Food } from '@/types';
import { getShopById, getFoodsByShop } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export function ShopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addItem, items, updateQuantity } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (!id) return;
    Promise.all([getShopById(id), getFoodsByShop(id)])
      .then(([shopData, foodsData]) => { setShop(shopData); setFoods(foodsData); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff4d0a' }}></div></div>;
  if (!shop) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><h2 className="text-2xl font-bold mb-4">Shop not found</h2><button onClick={() => router.push('/')} className="hover:underline" style={{ color: '#f03400' }}>Return Home</button></div>;

  const categories = ['All', ...Array.from(new Set(foods.map((f) => f.category)))];
  const filteredFoods = activeCategory === 'All' ? foods : foods.filter((f) => f.category === activeCategory);
  const getCartQuantity = (foodId: string) => items.find((item) => item.id === foodId)?.quantity || 0;

  return (
    <div className="flex-1 pb-24" style={{ backgroundColor: '#f8fafc' }}>
      <div className="relative h-64 md:h-80 bg-slate-900">
        <img src={getImageUrl(shop.image)} alt={shop.shopName} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide" style={{ backgroundColor: '#ff4d0a' }}>
                {shop.status === 'open' ? 'Open Now' : 'Closed'}
              </span>
              <span className="flex items-center text-white text-sm bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />{shop.rating}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{shop.shopName}</h1>
            <p className="text-slate-200 max-w-2xl text-sm md:text-base mb-4">{shop.description}</p>
            <div className="flex flex-wrap items-center text-sm text-slate-300 gap-4">
              <div className="flex items-center"><Clock size={16} className="mr-1.5" />{shop.deliveryTime}</div>
              <div className="flex items-center"><MapPin size={16} className="mr-1.5" />{shop.location.address}</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="sticky top-16 z-30 py-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200" style={{ backgroundColor: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="flex overflow-x-auto gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeCategory === cat ? '#1e293b' : 'white',
                  color: activeCategory === cat ? 'white' : '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food, i) => {
            const qty = getCartQuantity(food.id);
            return (
              <motion.div key={food.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{food.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-2">{food.description}</p>
                    <div className="font-bold text-slate-900">Rs. {food.price.toFixed(2)}</div>
                  </div>
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    <img src={getImageUrl(food.image)} alt={food.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {!food.availability ? (
                    <span className="text-red-500 text-sm font-medium flex items-center"><Info size={16} className="mr-1" />Sold Out</span>
                  ) : qty > 0 ? (
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(food.id, qty - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-[#ff4d0a]"><Minus size={16} /></button>
                      <span className="w-10 text-center font-bold text-slate-900">{qty}</span>
                      <button onClick={() => updateQuantity(food.id, qty + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-[#ff4d0a]"><Plus size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => addItem(food, shop)} className="flex items-center justify-center w-full font-semibold py-2 px-4 rounded-xl transition-colors" style={{ backgroundColor: '#fff4ed', color: '#f03400' }}>
                      <Plus size={18} className="mr-2" />Add to Cart
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
