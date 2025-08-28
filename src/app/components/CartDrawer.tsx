'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  locale: 'en'
});

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setShowCheckoutForm(true);
  };

  const handleFinalCheckout = async () => {
    if (items.length === 0) return;
    
    // Validate email match
    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            shirtId: item.shirtId,
            size: item.size,
            quantity: item.quantity
          })),
          email,
          name,
          phone
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }
      
      if (!session.sessionId) {
        throw new Error('No session ID received from server');
      }
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      // Try direct navigation if URL is provided
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });
      
      if (stripeError) {
        throw new Error(`Stripe error: ${stripeError.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const total = getTotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-lg overflow-y-auto"
        style={{
          background: 'linear-gradient(to bottom, #0f2942, #1a3a52)',
          borderLeft: '2px solid rgba(180, 163, 107, 0.3)'
        }}
      >
        <SheetHeader>
          <SheetTitle 
            className="text-2xl font-bold text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
          >
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-white/60 text-lg mb-4">Your cart is empty</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="font-semibold"
              style={{
                background: 'linear-gradient(to right, #b4a36b, #c4b47b)',
                color: '#0f2942',
                border: '2px solid rgba(180, 163, 107, 0.5)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #a49358, #b4a36b)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #b4a36b, #c4b47b)';
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : showCheckoutForm ? (
          // Checkout Form
          <div className="mt-6 space-y-4">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="text-sm text-white/60 hover:text-white/80 transition-colors mb-2"
            >
              ← Back to Cart
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-bold tracking-wide">Your Name:</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-bold tracking-wide">Email Address:</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail" className="text-white font-bold tracking-wide">Confirm Email:</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-bold tracking-wide">Phone (Optional):</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-white/10 border-white/30 text-white placeholder-white/50"
                />
              </div>

              {/* Order Summary */}
              <div className="border-t border-white/20 pt-4">
                <h3 className="font-semibold text-white mb-3">Order Summary:</h3>
                {items.map((item) => (
                  <div key={`${item.shirtId}-${item.size}`} className="bg-white/5 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ 
                            backgroundColor: '#b4a36b',
                            color: '#0f2942'
                          }}>
                            SIZE: {item.size}
                          </span>
                          <span className="text-white/60 text-sm">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-white font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold" style={{ color: '#b4a36b' }}>
                    ${total.toFixed(2)}
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(248, 113, 113, 0.5)',
                    border: '1px solid',
                    color: '#fecaca'
                  }}>
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleFinalCheckout}
                  disabled={loading || !name || !email || !confirmEmail}
                  className="w-full font-bold text-lg shadow-lg"
                  style={{
                    background: 'linear-gradient(to right, #b4a36b, #c4b47b)',
                    color: '#0f2942',
                    border: '2px solid rgba(180, 163, 107, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #a49358, #b4a36b)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #b4a36b, #c4b47b)';
                  }}
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </Button>

                <p className="text-xs text-center text-white/50 mt-3">
                  You will be redirected to Stripe for secure payment
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Cart Items View
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.shirtId}-${item.size}`}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              >
                <div className="flex gap-3">
                  {item.images && item.images[0] && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm drop-shadow-md">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ 
                        backgroundColor: '#b4a36b',
                        color: '#0f2942'
                      }}>
                        Size: {item.size}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-1">
                      ${item.price} each
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.shirtId, item.size)}
                    className="text-red-400 hover:text-red-300 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.shirtId, item.size, item.quantity - 1)}
                      className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: 'rgba(180, 163, 107, 0.2)',
                        border: '1px solid rgba(180, 163, 107, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.2)';
                      }}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    
                    <span className="text-white font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.shirtId, item.size, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                      className="w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(180, 163, 107, 0.2)',
                        border: '1px solid rgba(180, 163, 107, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        if (item.quantity < 10) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(180, 163, 107, 0.2)';
                      }}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  <span className="font-semibold text-white">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            <div className="border-t border-white/20 pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-white">Total:</span>
                <span className="text-2xl font-bold" style={{ color: '#b4a36b' }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg" style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(248, 113, 113, 0.5)',
                  border: '1px solid',
                  color: '#fecaca'
                }}>
                  {error}
                </div>
              )}

              <Button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="w-full font-bold text-lg shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #b4a36b, #c4b47b)',
                  color: '#0f2942',
                  border: '2px solid rgba(180, 163, 107, 0.5)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #a49358, #b4a36b)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #b4a36b, #c4b47b)';
                }}
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}