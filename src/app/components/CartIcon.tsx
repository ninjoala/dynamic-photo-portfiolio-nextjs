'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: 'rgba(180, 163, 107, 0.2)',
        border: '2px solid rgba(180, 163, 107, 0.5)'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.3)';
        (e.currentTarget as HTMLElement).style.borderColor = '#b4a36b';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.2)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(180, 163, 107, 0.5)';
      }}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" style={{ color: '#b4a36b' }} />
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
          style={{
            color: '#0f2942',
            backgroundColor: '#b4a36b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}