'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CartItem {
  shirtId: number;
  name: string;
  size: string;
  quantity: number;
  price: string;
  images: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (shirtId: number, size: string) => void;
  updateQuantity: (shirtId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.shirtId === newItem.shirtId && item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        // Item exists, increase quantity (max 10)
        const updatedItems = [...currentItems];
        const currentQuantity = updatedItems[existingItemIndex].quantity;
        updatedItems[existingItemIndex].quantity = Math.min(currentQuantity + (newItem.quantity || 1), 10);
        return updatedItems;
      } else {
        // New item
        return [...currentItems, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  }, []);

  const removeItem = useCallback((shirtId: number, size: string) => {
    setItems(currentItems => 
      currentItems.filter(item => !(item.shirtId === shirtId && item.size === size))
    );
  }, []);

  const updateQuantity = useCallback((shirtId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(shirtId, size);
      return;
    }

    setItems(currentItems => 
      currentItems.map(item => 
        item.shirtId === shirtId && item.size === size
          ? { ...item, quantity: Math.min(quantity, 10) }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => 
      total + (parseFloat(item.price) * item.quantity), 0
    );
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}