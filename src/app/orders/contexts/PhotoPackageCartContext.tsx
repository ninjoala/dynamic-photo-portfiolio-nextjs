'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PhotoPackageCartItem {
  packageId: number;
  name: string;
  price: string;
  description: string | null;
  quantity: number;
}

interface PhotoPackageCartContextType {
  items: PhotoPackageCartItem[];
  addItem: (item: PhotoPackageCartItem) => void;
  removeItem: (packageId: number) => void;
  updateQuantity: (packageId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const PhotoPackageCartContext = createContext<PhotoPackageCartContextType | undefined>(undefined);

export function PhotoPackageCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PhotoPackageCartItem[]>([]);

  const addItem = useCallback((newItem: PhotoPackageCartItem) => {
    setItems(currentItems => {
      // Check if same package already exists
      const existingItemIndex = currentItems.findIndex(
        item => item.packageId === newItem.packageId
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        return updatedItems;
      } else {
        // New item
        return [...currentItems, newItem];
      }
    });
  }, []);

  const removeItem = useCallback((packageId: number) => {
    setItems(currentItems =>
      currentItems.filter(item => item.packageId !== packageId)
    );
  }, []);

  const updateQuantity = useCallback((packageId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(packageId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.packageId === packageId
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
    <PhotoPackageCartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getTotalItems
    }}>
      {children}
    </PhotoPackageCartContext.Provider>
  );
}

export function usePhotoPackageCart() {
  const context = useContext(PhotoPackageCartContext);
  if (!context) {
    throw new Error('usePhotoPackageCart must be used within a PhotoPackageCartProvider');
  }
  return context;
}
