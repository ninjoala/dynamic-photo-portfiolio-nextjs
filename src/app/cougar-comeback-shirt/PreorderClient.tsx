'use client';

import { useState } from 'react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import type { Shirt } from '@/db/schema';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

console.log('Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing');
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

  // Debug: Check environment variables on component mount
  console.log('Client-side env check:');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  console.log('All env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
        Cougar Comeback Shirt Preorder
      </h1>

      {shirts.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No shirts available for preorder at this time.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Select Your Shirt</h2>
              <div className="grid gap-4">
                {shirts.map((shirt) => (
                  <div
                    key={shirt.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedShirt?.id === shirt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
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
                        <h3 className="font-semibold text-lg">{shirt.name}</h3>
                        {shirt.description && (
                          <p className="text-gray-600 text-sm mt-1">{shirt.description}</p>
                        )}
                        <p className="text-xl font-bold text-blue-600 mt-2">
                          ${shirt.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedShirt && selectedShirt.images && selectedShirt.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Product Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedShirt.images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 text-center">
                        {index === 0 ? 'Front' : 'Back'}
                      </p>
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${selectedShirt.name} - ${index === 0 ? 'Front' : 'Back'}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
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
                <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="phone">Phone Number</Label>
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
                  <Label htmlFor="size">Size</Label>
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
                  <Label htmlFor="quantity">Quantity</Label>
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

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !selectedShirt}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>

                <p className="text-sm text-gray-600 mt-4 text-center">
                  You will be redirected to Stripe for secure payment processing.<br />
                  A receipt will be emailed to you after payment.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}