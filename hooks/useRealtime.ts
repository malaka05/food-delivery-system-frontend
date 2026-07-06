import { useEffect, useState } from 'react';
import { OrderStatus } from '@/types';
import { toast } from 'sonner';

export const useRealtimeOrder = (orderId: string | undefined, initialStatus: OrderStatus) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const statusFlow: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    let currentIndex = statusFlow.indexOf(initialStatus);
    if (currentIndex === -1) currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusFlow.length - 1) {
        currentIndex++;
        const newStatus = statusFlow[currentIndex];
        setStatus(newStatus);
        const messages: Record<string, string> = {
          accepted: '✅ The shop has accepted your order!',
          preparing: '🍳 Your food is being prepared.',
          ready: '🛍️ Your order is ready for pickup by the rider.',
          out_for_delivery: '🛵 Your rider is on the way! Track them live.',
          delivered: '🎉 Your food has arrived. Enjoy!',
        };
        if (messages[newStatus]) {
          toast(`📱 WhatsApp Message`, { description: messages[newStatus], duration: 5000, icon: '💬' });
        }
        if (newStatus === 'out_for_delivery') setRiderLocation({ lat: 6.9274, lng: 79.8617 });
      } else {
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, initialStatus]);

  useEffect(() => {
    if (status !== 'out_for_delivery') return;
    const moveInterval = setInterval(() => {
      setRiderLocation((prev) => prev ? { lat: prev.lat + 0.0002, lng: prev.lng - 0.0002 } : null);
    }, 2000);
    return () => clearInterval(moveInterval);
  }, [status]);

  return { status, riderLocation };
};
