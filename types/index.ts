export type Role = 'customer' | 'shop' | 'rider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  shopName: string;
  description: string;
  location: { lat: number; lng: number; address: string };
  image: string;
  status: 'open' | 'closed';
  rating: number;
  deliveryTime: string;
  tags: string[];
}

export interface Food {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  availability: boolean;
}

export interface CartItem extends Food {
  quantity: number;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  riderId?: string;
  items: CartItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: OrderStatus;
  customerLocation: { lat: number; lng: number; address: string };
  rider?: { id: string; name: string; phone: string };
  customer?: { id: string; name: string; phone: string };
  shop?: { id: string; name: string; location: { lat: number; lng: number; address: string } };
  createdAt: string;
  updatedAt: string;
}
