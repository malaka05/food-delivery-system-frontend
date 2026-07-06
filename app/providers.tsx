'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-center" richColors />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
