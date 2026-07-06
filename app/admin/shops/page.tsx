'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Star, Clock, Plus, X, Upload, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Shop } from '@/types';
import { getShops, createShopWithOwner, updateShop, deleteShop } from '@/lib/api';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

function AdminShopsContent() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchShops = () => {
    setIsLoading(true);
    getShops().then(setShops).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchShops();
  }, []);

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

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerEmail || !ownerPassword || !shopName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ownerName', ownerName);
      formData.append('ownerEmail', ownerEmail);
      formData.append('ownerPassword', ownerPassword);
      formData.append('shopName', shopName);
      formData.append('description', description);
      formData.append('address', address);
      formData.append('deliveryTime', deliveryTime);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await createShopWithOwner(formData);
      toast.success('Shop created successfully!');
      setIsModalOpen(false);
      
      // Reset form
      setOwnerName(''); setOwnerEmail(''); setOwnerPassword('');
      setShopName(''); setDescription(''); setAddress(''); setDeliveryTime('');
      setImageFile(null); setImagePreview(null);
      
      // Refresh list
      fetchShops();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    // If it's a full URL (like from unspalsh), return it
    if (url.startsWith('http')) return url;
    // Otherwise prepend the backend URL for static files
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://food-delivery-system-backend-eight.vercel.app/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  };

  const handleToggleStatus = async (shopId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateShop(shopId, { status: newStatus as 'open' | 'closed' });
      setShops(shops.map(s => s.id === shopId ? { ...s, status: newStatus as 'open' | 'closed' } : s));
      toast.success(`Shop marked as ${newStatus}`);
    } catch (error: any) {
      toast.error('Failed to update shop status');
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop? This action cannot be undone.')) return;
    try {
      await deleteShop(shopId);
      setShops(shops.filter(s => s.id !== shopId));
      toast.success('Shop deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete shop');
    }
  };

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Shops Management</h1>
            <p className="text-slate-500">All registered restaurants on the platform.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#ff4d0a' }}
          >
            <Plus size={18} />
            Add New Shop
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-medium">Shop</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium">Delivery Time</th>
                  <th className="p-4 font-medium">Tags</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading shops...</td></tr>
                ) : shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <img src={getImageUrl(shop.image)} alt={shop.shopName} className="w-12 h-12 rounded-xl object-cover mr-3 bg-slate-100" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{shop.shopName}</div>
                          <div className="text-xs text-slate-500 max-w-xs line-clamp-1">{shop.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${shop.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{shop.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm font-medium text-slate-900"><Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />{shop.rating}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-slate-600"><Clock size={14} className="mr-1.5 text-slate-400" />{shop.deliveryTime}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(shop.tags || []).map((tag) => <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(shop.id, shop.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${shop.status === 'open' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                          {shop.status === 'open' ? 'Close Shop' : 'Open Shop'}
                        </button>
                        <button 
                          onClick={() => handleDeleteShop(shop.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Shop"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Shop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Create New Shop</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="createShopForm" onSubmit={handleCreateShop} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Shop Image</label>
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white font-medium flex items-center gap-2"><Upload size={18} /> Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center text-slate-500">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                          <ImageIcon size={24} className="text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-600">Click to upload shop image</p>
                        <p className="text-xs mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/jpeg, image/png, image/webp" 
                      className="hidden" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Shop Details</h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shop Name *</label>
                      <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900" placeholder="e.g. Burger King" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 resize-none" placeholder="Short description about the shop" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900" placeholder="e.g. 123 Main St" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Delivery Time</label>
                      <input type="text" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900" placeholder="e.g. 30-45 min" />
                    </div>
                  </div>

                  {/* Owner Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Owner Account</h3>
                    <p className="text-xs text-slate-500 mb-2">A new user account with 'shop' role will be created for the owner to log in.</p>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Full Name *</label>
                      <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900" placeholder="e.g. John Doe" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Email *</label>
                      <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900" placeholder="e.g. john@example.com" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Password *</label>
                      <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900" placeholder="Min 6 characters" required minLength={6} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="createShopForm"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#ff4d0a' }}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating...</>
                ) : (
                  'Create Shop'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminShopsPage() {
  return <ProtectedRoute allowedRoles={['admin']}><Layout><AdminShopsContent /></Layout></ProtectedRoute>;
}
