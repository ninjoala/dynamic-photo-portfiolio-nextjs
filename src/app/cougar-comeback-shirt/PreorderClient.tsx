'use client';

import { useState } from 'react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import type { Shirt } from '@/db/schema';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  locale: 'en'
});

interface PreorderClientProps {
  shirts: Shirt[];
}

export default function PreorderClient({ shirts }: PreorderClientProps) {
  const [selectedShirt, setSelectedShirt] = useState<Shirt | null>(shirts[0] || null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedShirt) {
      setError('Please select a shirt');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shirtId: selectedShirt.id,
          size: selectedSize,
          quantity,
          email,
          name,
          phone,
        }),
      });

      const session = await response.json();
      console.log('Checkout session response:', session);
      
      if (session.error) {
        throw new Error(session.error);
      }
      
      if (!session.sessionId) {
        throw new Error('No session ID received from server');
      }
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load - check your publishable key');
      
      console.log('Redirecting to checkout with session ID:', session.sessionId);
      
      // Try direct window navigation as fallback
      if (session.url) {
        console.log('Using direct navigation to:', session.url);
        window.location.href = session.url;
        return;
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });
      
      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        throw new Error(`Stripe error: ${stripeError.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const totalPrice = selectedShirt ? (parseFloat(selectedShirt.price) * quantity).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16 mt-12">
          <h1 className="text-6xl font-bold text-white mb-4" style={{textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.4)'}}>
            Cougar Comeback
          </h1>
        </div>

        {shirts.length === 0 ? (
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 p-8">
              <p className="text-white/80 text-lg">No shirts available for preorder at this time.</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Select Your Shirt</h2>
                <div className="grid gap-6">
                  {shirts.map((shirt) => (
                    <div
                      key={shirt.id}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                        selectedShirt?.id === shirt.id
                          ? 'border-amber-400 bg-amber-500/10 shadow-xl scale-105'
                          : 'border-white/30 bg-white/5 hover:border-amber-300/50 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedShirt(shirt)}
                    >
                      <div className="flex items-start space-x-4">
                      {shirt.images && shirt.images.length > 0 && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={shirt.images[0]}
                            alt={shirt.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-white drop-shadow-md">{shirt.name}</h3>
                        {shirt.description && (
                          <p className="text-amber-100/80 text-sm mt-2 leading-relaxed">{shirt.description}</p>
                        )}
                        <p className="text-2xl font-bold text-amber-400 mt-3 drop-shadow-lg">
                          ${shirt.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedShirt && selectedShirt.images && selectedShirt.images.length > 0 && (
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Product Images</h3>
                <div className="grid grid-cols-2 gap-6">
                  {selectedShirt.images.map((image, index) => (
                    <div key={index} className="space-y-3">
                      <p className="text-lg font-semibold text-white text-center drop-shadow-md">
                        {index === 0 ? 'Front' : 'Back'}
                      </p>
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image}
                          alt={`${selectedShirt.name} - ${index === 0 ? 'Front' : 'Back'}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Order Details</h2>
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Your Name:</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Email Address:</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Phone Number:</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Size:</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedShirt?.sizes?.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold text-white drop-shadow-md">Total:</span>
                  <span className="text-3xl font-bold text-amber-400 drop-shadow-lg">${totalPrice}</span>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-lg backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !selectedShirt}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-950 font-bold text-lg shadow-2xl border-2 border-amber-400/50"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>

                <p className="text-sm text-amber-100/70 mt-6 text-center leading-relaxed">
                  You will be redirected to Stripe for secure payment processing.<br />
                  A receipt will be emailed to you after payment.
                </p>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}