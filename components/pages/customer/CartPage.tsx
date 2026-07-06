'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { placeOrder, getShops } from '@/lib/api';
import { toast } from 'sonner';
import { Shop } from '@/types';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), { ssr: false });

export function CartPage() {
  const { items, shop, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState(user?.address || '123 Main St, Apt 4B, New Prague, MN');
  const [shopsMap, setShopsMap] = useState<Record<string, Shop>>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setIsLocating(false);
        toast.success(`Current location captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        // Try reverse-geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress(`Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
            }
          })
          .catch(() => {
            setAddress(`Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          });
      },
      (error) => {
        setIsLocating(false);
        toast.error(`Could not fetch geolocation: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getShops()
      .then((data) => {
        const map = data.reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {} as Record<string, Shop>);
        setShopsMap(map);
      })
      .catch(console.error);
  }, []);

  const uniqueShopsCount = new Set(items.map(item => item.shopId)).size;
  const deliveryFee = 3.99 * uniqueShopsCount;
  const taxes = totalPrice * 0.08;
  const finalTotal = totalPrice + deliveryFee + taxes;

  // Group items by shopId
  const itemsByShop = items.reduce((acc, item) => {
    const sId = item.shopId;
    if (!acc[sId]) acc[sId] = [];
    acc[sId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleCheckout = async () => {
    if (items.length === 0 || !user) return;
    setIsSubmitting(true);
    try {
      const shopIds = Object.keys(itemsByShop);

      // Submit an order for each shop
      const orderPromises = shopIds.map((sId) => {
        const shopItems = itemsByShop[sId];
        const shopSubtotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shopDeliveryFee = 3.99;
        const shopTaxes = shopSubtotal * 0.08;
        const shopTotal = shopSubtotal + shopDeliveryFee + shopTaxes;

        return placeOrder({
          shopId: sId,
          items: shopItems,
          totalAmount: shopTotal,
          customerLocation: {
            lat: coords ? coords.lat : 6.9272,
            lng: coords ? coords.lng : 79.8620,
            address
          },
        });
      });

      const placedOrders = await Promise.all(orderPromises);
      clearCart();
      toast.success(placedOrders.length > 1 ? 'Orders placed successfully!' : 'Order placed successfully!');

      if (placedOrders.length === 1) {
        router.push(`/order/${placedOrders[0].id}`);
      } else {
        router.push('/orders');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place orders');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6"><ShoppingBag size={48} /></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your cart is empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">Browse our restaurants to find something delicious.</p>
        <button onClick={() => router.push('/')} className="text-white px-8 py-3 rounded-xl font-semibold transition-colors" style={{ backgroundColor: '#ff4d0a' }}>Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Checkout</h1>
          <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 transition-colors">
            <Trash2 size={14} className="mr-1" /> Clear Cart
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Grouped items by shopId */}
            {Object.keys(itemsByShop).map((shopId) => {
              const shopItems = itemsByShop[shopId];
              const currentShopObj = shopsMap[shopId];
              const shopName = currentShopObj?.shopName || 'Restaurant';

              return (
                <div key={shopId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">Order from {shopName}</h2>
                      <p className="text-xs text-slate-500">{shopItems.length} item{shopItems.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => {
                        shopItems.forEach((item) => removeItem(item.id));
                      }}
                      className="text-xs text-slate-500 hover:text-red-600 font-semibold flex items-center bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 size={13} className="mr-1" /> Remove Shop
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {shopItems.map((item) => (
                      <div key={item.id} className="p-6 flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{item.name}</h3>
                          <p className="font-medium" style={{ color: '#ff4d0a' }}>Rs. {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 font-mono">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#ff4d0a]"><Minus size={16} /></button>
                          <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#ff4d0a]"><Plus size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center"><MapPin className="mr-2" size={20} style={{ color: '#ff4d0a' }} />Delivery Address</h2>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm text-slate-700 disabled:opacity-60"
                >
                  {isLocating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      Locating...
                    </>
                  ) : (
                    <>
                      <MapPin size={13} style={{ color: '#ff4d0a' }} />
                      Use Device Location
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 mb-4"
                style={{ '--tw-ring-color': '#ff4d0a' } as any}
                rows={3}
                placeholder="Enter your full delivery address..."
              />
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Select exact location Pin on Map:
                </label>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <LocationPickerMap
                    value={coords || { lat: 6.9272, lng: 79.8620 }}
                    onChange={(newCoords) => {
                      setCoords(newCoords);
                      // Reverse geocode
                      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data && data.display_name) {
                            setAddress(data.display_name);
                          } else {
                            setAddress(`Location (${newCoords.lat.toFixed(5)}, ${newCoords.lng.toFixed(5)})`);
                          }
                        })
                        .catch(() => {
                          setAddress(`Location (${newCoords.lat.toFixed(5)}, ${newCoords.lng.toFixed(5)})`);
                        });
                    }}
                  />
                </div>
              </div>
              {coords && (
                <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg flex justify-between items-center border border-slate-100">
                  <span>Coordinates: <strong>{coords.lat.toFixed(5)}</strong>, <strong>{coords.lng.toFixed(5)}</strong></span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Exact Geolocation Locked</span>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><CreditCard className="mr-2" size={20} style={{ color: '#ff4d0a' }} />Payment Method</h2>
              <div className="border-2 rounded-xl p-4 flex items-center justify-between cursor-pointer" style={{ borderColor: '#ff4d0a', backgroundColor: '#fff4ed' }}>
                <div className="flex items-center">
                  <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-bold mr-3">VISA</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">•••• •••• •••• 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/25</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 bg-white" style={{ borderColor: '#ff4d0a' }}></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>Rs. {totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Delivery Fee</span><span>Rs. {deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Taxes</span><span>Rs. {taxes.toFixed(2)}</span></div>
                <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900"><span>Total</span><span>Rs. {finalTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={handleCheckout} disabled={isSubmitting || !address} className="w-full text-white py-4 rounded-xl font-bold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-colors" style={{ backgroundColor: '#ff4d0a' }}>
                {isSubmitting ? (
                  <span className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Processing...</span>
                ) : (
                  <span className="flex items-center">Place Order <ArrowRight size={18} className="ml-2" /></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
