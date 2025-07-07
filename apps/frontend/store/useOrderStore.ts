import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'
import { ShippingCost } from '@/lib/rajaongkir'
import { apiClient } from '@/lib/api'

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  province: string
  city: string
  address: string
  postal_code: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'bank_transfer' | 'e_wallet' | 'credit_card' | 'cod'
  logo?: string
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: ShippingAddress
  shippingMethod: {
    courier: string
    service: string
    cost: number
    etd: string
  }
  paymentMethod: PaymentMethod
  paymentProof?: string // URL to uploaded payment proof
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  shippingAddress: ShippingAddress | null
  selectedShipping: {
    courier: string
    service: string
    cost: number
    etd: string
  } | null
  selectedPayment: PaymentMethod | null
  availablePaymentMethods: PaymentMethod[]
  
  // Actions
  setShippingAddress: (address: ShippingAddress) => void
  setSelectedShipping: (shipping: { courier: string; service: string; cost: number; etd: string }) => void
  setSelectedPayment: (payment: PaymentMethod) => void
  createOrder: (cartItems: CartItem[], shippingAddress: ShippingAddress, shippingMethod: any, paymentMethod: PaymentMethod) => Order
  getOrder: (orderId: string) => Order | undefined
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  uploadPaymentProof: (orderId: string, proofUrl: string) => void
  clearCurrentOrder: () => void
}

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'bca',
    name: 'Bank BCA',
    type: 'bank_transfer',
    logo: '/images/payment/bca.png'
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    type: 'bank_transfer',
    logo: '/images/payment/mandiri.png'
  },
  {
    id: 'bni',
    name: 'Bank BNI',
    type: 'bank_transfer',
    logo: '/images/payment/bni.png'
  },
  {
    id: 'bri',
    name: 'Bank BRI',
    type: 'bank_transfer',
    logo: '/images/payment/bri.png'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'e_wallet',
    logo: '/images/payment/gopay.png'
  },
  {
    id: 'ovo',
    name: 'OVO',
    type: 'e_wallet',
    logo: '/images/payment/ovo.png'
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'e_wallet',
    logo: '/images/payment/dana.png'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'e_wallet',
    logo: '/images/payment/shopeepay.png'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'cod'
  }
]

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      shippingAddress: null,
      selectedShipping: null,
      selectedPayment: null,
      availablePaymentMethods: defaultPaymentMethods,

      setShippingAddress: (address: ShippingAddress) => {
        set({ shippingAddress: address })
      },

      setSelectedShipping: (shipping) => {
        set({ selectedShipping: shipping })
      },

      setSelectedPayment: (payment: PaymentMethod) => {
        set({ selectedPayment: payment })
      },

      createOrder: (cartItems: CartItem[], shippingAddress: ShippingAddress, shippingMethod: any, paymentMethod: PaymentMethod) => {
        const orderItems: OrderItem[] = cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        }))

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
        const shippingCost = shippingMethod.cost
        const total = subtotal + shippingCost

        const order: Order = {
          id: `order_${Date.now()}`,
          orderNumber: `BLK${Date.now()}`,
          items: orderItems,
          subtotal,
          shippingCost,
          total,
          shippingAddress,
          shippingMethod: {
            courier: shippingMethod.courier,
            service: shippingMethod.service,
            cost: shippingMethod.cost,
            etd: shippingMethod.etd
          },
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set(state => ({
          orders: [...state.orders, order],
          currentOrder: order
        }))

        return order
      },

      getOrder: (orderId: string) => {
        const { orders } = get()
        return orders.find(order => order.id === orderId)
      },

      updateOrderStatus: (orderId: string, status: Order['status']) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          ),
          currentOrder: state.currentOrder?.id === orderId
            ? { ...state.currentOrder, status, updatedAt: new Date().toISOString() }
            : state.currentOrder
        }))
      },

      uploadPaymentProof: (orderId: string, proofUrl: string) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { ...order, paymentProof: proofUrl, updatedAt: new Date().toISOString() }
              : order
          ),
          currentOrder: state.currentOrder?.id === orderId
            ? { ...state.currentOrder, paymentProof: proofUrl, updatedAt: new Date().toISOString() }
            : state.currentOrder
        }))
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null })
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
        currentOrder: state.currentOrder,
        shippingAddress: state.shippingAddress,
        selectedShipping: state.selectedShipping,
        selectedPayment: state.selectedPayment,
      }),
    }
  )
) 