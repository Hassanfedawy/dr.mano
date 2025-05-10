import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Debug function to log cart operations
const logCartOperation = (operation, data) => {
  console.log(`[Cart] ${operation}:`, data);
};

// Create a cart store with persistence
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart
      addItem: (product, quantity = 1) => {
        logCartOperation('Adding item', { product, quantity });

        // Ensure product has all required fields
        if (!product || !product.id) {
          console.error('[Cart] Invalid product:', product);
          return;
        }

        // Create a simplified product object with only the necessary fields
        // This helps prevent serialization issues and keeps the cart data clean
        const simplifiedProduct = {
          id: product.id,
          name: product.name || 'Unknown Product',
          price: typeof product.price === 'number' ? product.price : 0,
          originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : null,
          discountPercentage: typeof product.discountPercentage === 'number' ? product.discountPercentage : null,
          images: product.images || '/Images/placeholder.jpg',
          stock: typeof product.stock === 'number' ? product.stock : 0,
          link: product.link || null,
          categoryId: product.categoryId || null,
        };

        set((state) => {
          const existingItem = state.items.find(item => item.product.id === simplifiedProduct.id);

          let newState;
          if (existingItem) {
            // Update quantity if item already exists
            newState = {
              items: state.items.map(item =>
                item.product.id === simplifiedProduct.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          } else {
            // Add new item with simplified product
            newState = {
              items: [...state.items, { product: simplifiedProduct, quantity }]
            };
          }

          logCartOperation('Cart after add', newState.items);
          return newState;
        });
      },

      // Update item quantity
      updateItemQuantity: (productId, quantity) => {
        logCartOperation('Updating quantity', { productId, quantity });

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const newState = {
            items: state.items.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            )
          };

          logCartOperation('Cart after update', newState.items);
          return newState;
        });
      },

      // Remove item from cart
      removeItem: (productId) => {
        logCartOperation('Removing item', { productId });

        set((state) => {
          const newState = {
            items: state.items.filter(item => item.product.id !== productId)
          };

          logCartOperation('Cart after remove', newState.items);
          return newState;
        });
      },

      // Clear cart
      clearCart: () => {
        logCartOperation('Clearing cart', {});
        set({ items: [] });
      },

      // Get cart total
      getTotal: () => {
        const total = get().items.reduce(
          (total, item) => {
            // Check if price is valid
            const price = item.product?.price || 0;
            return total + (price * item.quantity);
          },
          0
        );

        logCartOperation('Calculating total', { total });
        return total;
      },

      // Get total number of items in cart
      getItemCount: () => {
        const count = get().items.reduce(
          (count, item) => count + item.quantity,
          0
        );

        logCartOperation('Calculating item count', { count });
        return count;
      },

      // Debug function to log current cart state
      debugCart: () => {
        const state = get();
        console.log('[Cart] Current state:', {
          items: state.items,
          itemCount: state.getItemCount(),
          total: state.getTotal()
        });
        return state.items;
      }
    }),
    {
      name: 'cart-storage', // unique name for localStorage
      storage: createJSONStorage(() => (isClient ? localStorage : null)),
      skipHydration: true // Skip hydration to prevent server-side errors
    }
  )
);

export default useCartStore;
