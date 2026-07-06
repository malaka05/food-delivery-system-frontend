'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Loader2, UtensilsCrossed, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Food, Shop } from '@/types';
import { getMyShops, getFoodsByShop, createFood, updateFood, deleteFood, createFoodWithImage, updateFoodWithImage } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

function MenuContent() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    image: '',
    availability: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const shops = await getMyShops();
      if (shops.length === 0) { setIsLoading(false); return; }
      const shop = shops[0];
      setMyShop(shop);
      const foodData = await getFoodsByShop(shop.id);
      setFoods(foodData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (id: string) => {
    const food = foods.find(f => f.id === id);
    if (!food) return;
    try {
      setFoods(foods.map((f) => f.id === id ? { ...f, availability: !f.availability } : f));
      await updateFood(id, { availability: !food.availability });
      toast.success('Availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
      // Revert on failure
      setFoods(foods.map((f) => f.id === id ? { ...f, availability: food.availability } : f));
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteFood(id);
      setFoods(foods.filter(f => f.id !== id));
      toast.success('Food deleted successfully');
    } catch (error) {
      toast.error('Failed to delete food');
    }
  };

  const openModal = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        availability: food.availability
      });
      setImagePreview(getImageUrl(food.image));
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        image: '',
        availability: true
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('availability', formData.availability.toString());
      data.append('shopId', myShop.id);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (!editingFood) {
        toast.error('Please select an image for the food item.');
        setIsSubmitting(false);
        return;
      }

      if (editingFood) {
        const updated = await updateFoodWithImage(editingFood.id, data);
        setFoods(foods.map(f => f.id === editingFood.id ? updated : f));
        toast.success('Food updated successfully');
      } else {
        const newFood = await createFoodWithImage(data);
        setFoods([...foods, newFood]);
        toast.success('Food created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save food');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(foods.map((f) => f.category)))];

  const filteredFoods = foods.filter((f) => {
    const matchSearch = (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Menu Management</h1>
            <p className="text-slate-500">{myShop ? `Managing menu for ${myShop.shopName}` : 'Manage your food items and availability.'}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="text-white px-4 py-2.5 rounded-xl font-semibold flex items-center hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#ff4d0a' }}
          >
            <Plus size={18} className="mr-2" /> Add New Item
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={40} style={{ color: '#ff4d0a' }} /></div>
        ) : !myShop ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
            <UtensilsCrossed size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No shop found</h3>
            <p className="text-slate-500">Your shop account does not have a registered restaurant yet. Please create one on the dashboard.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4d0a' } as React.CSSProperties}
                  placeholder="Search menu items…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors"
                    style={{ backgroundColor: activeCategory === cat ? '#1e293b' : '#f1f5f9', color: activeCategory === cat ? 'white' : '#475569' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-medium">Item</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Available</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredFoods.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-slate-400">No items match your search.</td></tr>
                    ) : filteredFoods.map((food, i) => (
                      <motion.tr key={food.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={getImageUrl(food.image)} alt={food.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{food.name}</div>
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{food.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{food.category}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">Rs. {food.price.toFixed(2)}</td>
                        <td className="p-4">
                          <button onClick={() => toggleAvailability(food.id)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            style={{ backgroundColor: food.availability ? '#ff4d0a' : '#e2e8f0' }}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${food.availability ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => openModal(food)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="Edit"><Edit2 size={15} /></button>
                          <button onClick={() => handleDeleteFood(food.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
              {filteredFoods.length} of {foods.length} items
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg relative z-10 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {editingFood ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveFood} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Food Name</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Price (Rs.)</label>
                      <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Category</label>
                      <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#ff4d0a] focus:ring-[#ff4d0a] sm:text-sm" placeholder="e.g. Main Course, Sides" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Item Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      {imagePreview ? (
                        <div className="relative h-40 w-full rounded-xl overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={24} className="text-white mb-2" />
                            <span className="text-white text-sm font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="h-40 w-full rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#ff4d0a] transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                            <ImageIcon size={24} className="text-[#ff4d0a]" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 mb-1">Click to upload image</span>
                          <span className="text-xs text-slate-500">JPG, PNG, GIF up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50" style={{ backgroundColor: '#ff4d0a' }}>
                      {isSubmitting ? 'Saving...' : 'Save Item'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ShopMenuPage() {
  return <ProtectedRoute allowedRoles={['shop']}><Layout><MenuContent /></Layout></ProtectedRoute>;
}
