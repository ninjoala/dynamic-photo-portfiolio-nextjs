'use client';

import { ShoppingCart } from 'lucide-react';
import { usePhotoPackageCart } from '../contexts/PhotoPackageCartContext';

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { getTotalItems } = usePhotoPackageCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="relative p-3 rounded-lg transition-all duration-300 hover:scale-110 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 shadow-lg"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
