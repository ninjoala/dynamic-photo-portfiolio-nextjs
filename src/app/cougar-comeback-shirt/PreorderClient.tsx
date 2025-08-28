'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Shirt } from '@/db/schema';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useCart } from '../contexts/CartContext';
import { CartIcon } from '../components/CartIcon';
import { CartDrawer } from '../components/CartDrawer';
import { ShoppingBag, ShoppingCart } from 'lucide-react';

interface PreorderClientProps {
  shirts: Shirt[];
}

export default function PreorderClient({ shirts }: PreorderClientProps) {
  const { addItem, getTotalItems } = useCart();
  const [selectedShirt, setSelectedShirt] = useState<Shirt | null>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  
  const cartItemCount = getTotalItems();

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

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShirt) {
      return;
    }

    addItem({
      shirtId: selectedShirt.id,
      name: selectedShirt.name,
      size: selectedSize,
      quantity: quantity,
      price: selectedShirt.price,
      images: selectedShirt.images || []
    });

    // Show success message
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);

    // Reset quantity
    setQuantity(1);
    setQuantityInput('1');
  };


  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, #0f2942, #1a3a52, #0f2942)'}}>
      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      
      {/* Cart Icon - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-40">
        <CartIcon onClick={() => setCartOpen(true)} />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" style={{backgroundColor: '#b4a36b33'}}></div>
        <div className="absolute top-60 -left-40 w-96 h-96 rounded-full blur-3xl" style={{backgroundColor: '#0f294233'}}></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl" style={{backgroundColor: '#b4a36b33'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16 mt-12">
          <h1 className="text-6xl font-bold text-white mb-4" style={{textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.4)'}}>
            The Cougar Comeback
          </h1>
          <p className="text-2xl mb-4" style={{color: '#b4a36b', textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
            Down to the Wire. Up in the History Books
          </p>
          <p className="text-xl font-semibold italic" style={{color: '#b4a36b', textShadow: '0 2px 4px rgba(0,0,0,0.7)'}}>
            Wear the Win. Remember the Comeback.
          </p>
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
                          className={`border-4 rounded-xl p-6 cursor-pointer transition-all duration-300 relative ${
                            selectedShirt?.id === shirt.id
                              ? 'shadow-2xl scale-105 ring-4 ring-yellow-400/50'
                              : 'border-white/30 bg-white/5 hover:bg-white/10 hover:scale-102'
                          }`}
                          style={selectedShirt?.id === shirt.id ? {
                            borderColor: '#fbbf24', // yellow-400
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)'
                          } : {}}
                          onClick={() => setSelectedShirt(shirt)}
                        >
                          {/* HUGE selection indicator */}
                          {selectedShirt?.id === shirt.id && (
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-lg shadow-xl animate-pulse">
                              ✓ SELECTED
                            </div>
                          )}
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
                              <p className="text-lg font-medium mt-3 leading-relaxed" style={{color: '#b4a36b', textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>{shirt.description}</p>
                            )}
                            <p className="text-2xl font-bold mt-3 drop-shadow-lg" style={{color: '#b4a36b'}}>
                              ${shirt.price}
                            </p>
                          </div>
                        </div>
                        </div>

                        {/* Product images - always show on mobile */}
                        {shirt.images && shirt.images.length > 0 && (
                          <div className="lg:hidden overflow-hidden">
                            <div className="mt-4">
                              <div className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 p-4">
                                <h4 className="text-lg font-semibold text-white mb-4 text-center drop-shadow-md">Product Images</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {shirt.images.map((image, index) => (
                                    <div key={index} className="space-y-2">
                                      <p className="text-sm font-medium text-white text-center drop-shadow-md">
                                        {index === 0 ? 'Front' : 'Back'}
                                      </p>
                                      <div 
                                        className="relative aspect-square rounded-lg overflow-hidden border border-white/20 shadow-lg cursor-pointer transition-colors hover:shadow-xl"
                                        style={{'--hover-border': '#b4a36b'} as React.CSSProperties}
                                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#b4a36b'}
                                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
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

              {/* Desktop product images - show all shirts */}
              <div className="hidden lg:block bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>All Product Images</h3>
                <div className="space-y-8">
                  {shirts.map((shirt) => (
                    <div key={shirt.id} className="space-y-4">
                      {/* Simple shirt name */}
                      <div className="flex items-center gap-4">
                        <h4 className="text-2xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
                          {shirt.name}
                        </h4>
                        {selectedShirt?.id === shirt.id && (
                          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{
                            backgroundColor: '#b4a36b',
                            color: '#0f2942'
                          }}>
                            Selected
                          </span>
                        )}
                      </div>
                      
                      {/* Images grid */}
                      {shirt.images && shirt.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                          {shirt.images.map((image, index) => (
                            <div key={index} className="space-y-3">
                              <p className="text-lg font-semibold text-white text-center drop-shadow-md">
                                {index === 0 ? 'Front' : 'Back'}
                              </p>
                              <div 
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer ${
                                  selectedShirt?.id === shirt.id 
                                    ? 'border-yellow-400' 
                                    : 'border-white/30'
                                }`}
                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#b4a36b'}
                                onMouseLeave={(e) => {
                                  if (selectedShirt?.id === shirt.id) {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#fbbf24'; // yellow-400
                                  } else {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                  }
                                }}
                                onClick={() => handleImageClick(image, `${shirt.name} - ${index === 0 ? 'Front' : 'Back'}`)}
                              >
                                <Image
                                  src={image}
                                  alt={`${shirt.name} - ${index === 0 ? 'Front' : 'Back'}`}
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl p-8 mt-12">
            <h2 className="text-3xl font-bold text-white mb-8" style={{textShadow: '0 3px 6px rgba(0,0,0,0.7)'}}>Add to Cart</h2>
            
            {/* Preview of what's being added */}
            {selectedShirt && !showAddedMessage && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border-2 shadow-xl" style={{ borderColor: 'rgba(180, 163, 107, 0.4)' }}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                    You&apos;re Adding:
                  </h3>
                  <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold" style={{ 
                    backgroundColor: '#b4a36b',
                    color: '#0f2942'
                  }}>
                    Preview
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {selectedShirt.images && selectedShirt.images[0] && (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2" style={{ borderColor: '#b4a36b' }}>
                        <Image
                          src={selectedShirt.images[0]}
                          alt={selectedShirt.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-lg sm:text-xl mb-2" style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>
                        {selectedShirt.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-medium text-sm">Size:</span>
                          <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-sm sm:text-lg font-bold" style={{ 
                            backgroundColor: '#b4a36b',
                            color: '#0f2942'
                          }}>
                            {selectedSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-medium text-sm">Qty:</span>
                          <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-sm sm:text-lg font-bold" style={{ 
                            backgroundColor: '#b4a36b',
                            color: '#0f2942'
                          }}>
                            {quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-medium text-sm sm:text-base">Item Total:</span>
                        <span className="text-lg sm:text-2xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(180, 163, 107, 0.6)'}}>
                          ${(parseFloat(selectedShirt.price) * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleAddToCart} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="size" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Size:</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger 
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/15 transition-colors"
                      style={{
                        borderColor: 'rgba(180, 163, 107, 0.5)'
                      }}
                    >
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent 
                      className="border-2"
                      style={{
                        backgroundColor: '#1a3a52',
                        borderColor: '#b4a36b'
                      }}
                    >
                      {selectedShirt?.sizes?.map((size) => (
                        <SelectItem 
                          key={size} 
                          value={size}
                          className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                        >
                          <span className="font-bold">{size}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-white font-bold text-lg tracking-wide" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Quantity:</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantityInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string and numbers
                      if (value === '' || /^\d*$/.test(value)) {
                        setQuantityInput(value);
                        // Update quantity if valid number
                        if (value !== '') {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                            setQuantity(numValue);
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const numValue = parseInt(value);
                      if (value === '' || isNaN(numValue) || numValue < 1) {
                        setQuantity(1);
                        setQuantityInput('1');
                      } else if (numValue > 10) {
                        setQuantity(10);
                        setQuantityInput('10');
                      } else {
                        setQuantity(numValue);
                        setQuantityInput(numValue.toString());
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                {showAddedMessage && (
                  <div className="mb-4 p-4 rounded-lg backdrop-blur-sm animate-pulse" style={{
                    backgroundColor: 'rgba(180, 163, 107, 0.2)',
                    borderColor: 'rgba(180, 163, 107, 0.5)',
                    border: '1px solid',
                    color: '#b4a36b'
                  }}>
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-semibold">Added to cart!</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={!selectedShirt}
                    className="w-full font-bold text-lg shadow-2xl border-2 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(to right, #b4a36b, #c4b47b)',
                      color: '#0f2942',
                      borderColor: 'rgba(180, 163, 107, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #a49358, #b4a36b)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to right, #b4a36b, #c4b47b)';
                    }}
                    size="lg"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="w-full font-bold text-lg shadow-xl border-2 flex items-center justify-center gap-3 relative"
                    style={{
                      background: 'rgba(180, 163, 107, 0.1)',
                      color: '#b4a36b',
                      borderColor: '#b4a36b'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(180, 163, 107, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(180, 163, 107, 0.1)';
                    }}
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    View Cart
                    {cartItemCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm font-bold">
                        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </Button>
                </div>
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