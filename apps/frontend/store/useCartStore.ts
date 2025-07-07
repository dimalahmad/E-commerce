import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  subtotal: number
  shippingCost: number
  total: number
  totalDiskon: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  setShippingCost: (cost: number) => void
  calculateTotals: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      shippingCost: 0,
      total: 0,
      totalDiskon: 0,

      addItem: (product: Product, quantity: number = 1) => {
        const { items } = get()
        const existingItem = items.find(item => item.product.id === product.id)

        if (existingItem) {
          // Update existing item quantity
          const updatedItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ items: updatedItems })
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(),
            product,
            quantity,
          }
          set({ items: [...items, newItem] })
        }

        get().calculateTotals()
      },

      removeItem: (productId: number) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.product.id !== productId)
        set({ items: updatedItems })
        get().calculateTotals()
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const { items } = get()
        const updatedItems = items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
        set({ items: updatedItems })
        get().calculateTotals()
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, subtotal: 0, shippingCost: 0, total: 0, totalDiskon: 0 })
      },

      setShippingCost: (cost: number) => {
        set({ shippingCost: cost })
        get().calculateTotals()
      },

      calculateTotals: () => {
        const { items, shippingCost } = get()
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = items.reduce((sum, item) => {
          const price = item.product.discount && item.product.discount > 0
            ? Math.round(item.product.price * (1 - item.product.discount / 100))
            : item.product.price
          return sum + price * item.quantity
        }, 0)
        const totalDiskon = items.reduce((sum, item) => {
          if (item.product.discount && item.product.discount > 0) {
            const diskon = item.product.price - Math.round(item.product.price * (1 - item.product.discount / 100))
            return sum + diskon * item.quantity
          }
          return sum
        }, 0)
        const total = subtotal + shippingCost
        set({ totalItems, subtotal, total, totalDiskon })
      },

      // Get total weight for shipping calculation
      getTotalWeight: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + (item.product.weight || 500) * item.quantity, 0)
      },

      // Check if cart is empty
      isEmpty: () => {
        const { items } = get()
        return items.length === 0
      },

      // Get item by product ID
      getItem: (productId: number) => {
        const { items } = get()
        return items.find(item => item.product.id === productId)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        shippingCost: state.shippingCost,
        total: state.total,
        totalDiskon: state.totalDiskon,
      }),
    }
  )
)