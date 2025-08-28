'use client';

import { useState, useEffect } from 'react';
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
  const [confirmEmail, setConfirmEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const handleImageClick = (url: string, alt: string) => {
    console.log('Image clicked:', { url, alt });
    setSelectedImage({ url, alt });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedShirt) {
      setError('Please select a shirt');
      setLoading(false);
      return;
    }

    if (email !== confirmEmail) {
      setError('Email addresses do not match');
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
          <>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-6" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Select Your Shirt</h2>
                  <div className="grid gap-6">
                    {shirts.map((shirt) => (
                      <div key={shirt.id}>
                        <div
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

                        {/* Product images that slide out beneath selected shirt */}
                        {selectedShirt?.id === shirt.id && shirt.images && shirt.images.length > 0 && (
                          <div className="lg:hidden overflow-hidden">
                            <div className="mt-4 animate-slide-down">
                              <div className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 p-4">
                                <h4 className="text-lg font-semibold text-white mb-4 text-center drop-shadow-md">Product Images</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {shirt.images.map((image, index) => (
                                    <div key={index} className="space-y-2">
                                      <p className="text-sm font-medium text-white text-center drop-shadow-md">
                                        {index === 0 ? 'Front' : 'Back'}
                                      </p>
                                      <div 
                                        className="relative aspect-square rounded-lg overflow-hidden border border-white/20 shadow-lg cursor-pointer hover:border-amber-400/50 transition-colors"
                                        onClick={() => handleImageClick(image, `${shirt.name} - ${index === 0 ? 'Front' : 'Back'}`)}
                                      >
                                        <Image
                                          src={image}
                                          alt={`${shirt.name} - ${index === 0 ? 'Front' : 'Back'}`}
                                          fill
                                          className="object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop product images - only show on lg screens and up */}
              {selectedShirt && selectedShirt.images && selectedShirt.images.length > 0 && (
                <div className="hidden lg:block bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
                  <h3 className="text-3xl font-bold text-white mb-6" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Product Images</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {selectedShirt.images.map((image, index) => (
                      <div key={index} className="space-y-3">
                        <p className="text-lg font-semibold text-white text-center drop-shadow-md">
                          {index === 0 ? 'Front' : 'Back'}
                        </p>
                        <div 
                          className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer hover:border-amber-400/50"
                          onClick={() => handleImageClick(image, `${selectedShirt.name} - ${index === 0 ? 'Front' : 'Back'}`)}
                        >
                          <Image
                            src={image}
                            alt={`${selectedShirt.name} - ${index === 0 ? 'Front' : 'Back'}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8 mt-12">
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
                <Label htmlFor="confirmEmail" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Confirm Email Address:</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
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
          </>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-xl transition-colors"
              aria-label="Close image"
            >
              ×
            </button>
            
            {/* Image container */}
            <div 
              className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl max-h-[90vh] min-w-[300px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full min-h-[400px] flex items-center justify-center p-4">
                {selectedImage.url ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    width={800}
                    height={600}
                    className="max-w-full max-h-[80vh] object-contain"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
                    priority
                    unoptimized
                    onError={() => {
                      console.error('Image failed to load:', selectedImage.url);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', selectedImage.url);
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500">Loading image...</p>
                    <p className="text-xs text-gray-400 mt-2">URL: {selectedImage?.url}</p>
                  </div>
                )}
              </div>
              
              {/* Image caption */}
              <div className="bg-black/80 text-white p-4">
                <p className="text-center font-medium">{selectedImage.alt}</p>
                <p className="text-center text-sm text-gray-300 mt-1">
                  Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}