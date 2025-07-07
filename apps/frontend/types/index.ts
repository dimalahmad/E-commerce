// User Types
export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

// Product Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  images: string[]
  category: Category
  stock: number
  rating: number
  reviews: number
  weight?: number // in grams
  isNew: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  color?: string
  productCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Order Types
export interface Order {
  id: number
  orderNumber: string
  user: User
  items: OrderItem[]
  totalAmount: number
  shippingCost: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: Address
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  product: Product
  quantity: number
  price: number
  subtotal: number
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Address Types
export interface Address {
  id: number
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  province: string
  isDefault: boolean
}

// Cart Types
export interface CartItem {
  id: number
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  subtotal: number
  shippingCost: number
  total: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface CheckoutForm {
  shippingAddress: Address
  paymentMethod: string
  notes?: string
}

// Filter Types
export interface ProductFilters {
  category?: number
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'price' | 'name' | 'rating' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// Report Types
export interface SalesReport {
  period: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Product[]
  salesByCategory: { category: string; sales: number }[]
  salesByDate: { date: string; sales: number }[]
}

// Dashboard Types
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalProfit: number;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  date: string;
}

export interface DashboardTopProduct {
  name: string;
  sales: number;
  revenue: number;
  growth?: string;
}

export interface DashboardData {
  global: {
    totalOrder: number;
    totalItem: number;
    totalRevenue: number;
    totalProfit: number;
    avgOrderValue: number;
    avgProfitPerOrder: number;
    totalIncome: number;
  };
  topProducts: Array<{ name: string; sold: number; revenue: number; profit: number; }>;
  topUsers: Array<{ userId: string; orderCount: number; totalSpent: number; }>;
  // ...tambahkan jika perlu
}