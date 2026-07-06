import { User, Shop, Food, Order, OrderStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('foodgo_token');
  }
  return null;
};

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
};

// --- Auth ---
export const demoLogin = async (role: string): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
};

export const loginWithCredentials = async (
  email: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
}): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// --- Shops ---
export const getShops = async (): Promise<Shop[]> => {
  const res = await fetch(`${API_URL}/shops`);
  return handleResponse(res);
};

export const getShopById = async (id: string): Promise<Shop> => {
  const res = await fetch(`${API_URL}/shops/${id}`);
  return handleResponse(res);
};

// Get shops owned by the currently logged-in shop owner
export const getMyShops = async (): Promise<Shop[]> => {
  const allShops = await getShops();
  // Filter client-side using stored user id from localStorage
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('foodgo_user') : null;
  if (!storedUser) return allShops;
  const user = JSON.parse(storedUser);
  return allShops.filter((s: Shop) => s.ownerId === user.id);
};

// Update current user's profile
export const updateUserProfile = async (data: { name?: string; phone?: string; address?: string; avatar?: string }): Promise<User> => {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const uploadAvatar = async (formData: FormData): Promise<User> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return handleResponse(res);
};


export const createShop = async (data: Partial<Shop>): Promise<Shop> => {
  const res = await fetch(`${API_URL}/shops`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const createShopWithOwner = async (formData: FormData): Promise<Shop> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/shops/create-with-owner`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
    body: formData,
  });
  return handleResponse(res);
};

export const updateShop = async (id: string, data: Partial<Shop>): Promise<Shop> => {
  const res = await fetch(`${API_URL}/shops/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteShop = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/shops/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// --- Foods ---
export const getFoodsByShop = async (shopId: string): Promise<Food[]> => {
  const res = await fetch(`${API_URL}/foods?shopId=${shopId}`);
  return handleResponse(res);
};

export const createFood = async (data: Partial<Food>): Promise<Food> => {
  const res = await fetch(`${API_URL}/foods`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const createFoodWithImage = async (formData: FormData): Promise<Food> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/foods`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
    body: formData,
  });
  return handleResponse(res);
};

export const updateFood = async (id: string, data: Partial<Food>): Promise<Food> => {
  const res = await fetch(`${API_URL}/foods/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateFoodWithImage = async (id: string, formData: FormData): Promise<Food> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/foods/${id}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteFood = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/foods/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// --- Orders ---
export const placeOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getMyOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getOrdersByShop = async (): Promise<Order[]> => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAvailableDeliveries = async (): Promise<Order[]> => {
  const res = await fetch(`${API_URL}/orders/available`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
};

export const assignRider = async (orderId: string): Promise<Order> => {
  const res = await fetch(`${API_URL}/orders/${orderId}/assign-rider`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// --- Users (Admin) ---
export const getAllUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_URL}/users`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};
