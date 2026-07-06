'use client';
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { CartItem, Food, Shop } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  shop: Shop | null;
  addItem: (food: Food, shop: Shop) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('foodgo_cart');
    const storedShop = localStorage.getItem('foodgo_cart_shop');
    if (storedCart) setItems(JSON.parse(storedCart));
    if (storedShop) setShop(JSON.parse(storedShop));
  }, []);

  useEffect(() => {
    localStorage.setItem('foodgo_cart', JSON.stringify(items));
    if (shop) {
      localStorage.setItem('foodgo_cart_shop', JSON.stringify(shop));
    } else {
      localStorage.removeItem('foodgo_cart_shop');
    }
  }, [items, shop]);

  const addItem = (food: Food, newShop: Shop) => {
    if (!shop || items.length === 0) setShop(newShop);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === food.id);
      if (existing) {
        toast.success(`Added another ${food.name}`);
        return prev.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${food.name} added to cart`);
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeItem = (foodId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== foodId);
      if (newItems.length === 0) setShop(null);
      return newItems;
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(foodId); return; }
    setItems((prev) => prev.map((item) => item.id === foodId ? { ...item, quantity } : item));
  };

  const clearCart = () => { setItems([]); setShop(null); };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, shop, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
