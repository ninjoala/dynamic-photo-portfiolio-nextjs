'use client';

import { useState } from 'react';
import type { PhotoPackage } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePhotoPackageCart } from '../contexts/PhotoPackageCartContext';
import { CartIcon } from '../components/CartIcon';
import { PhotoPackageCartDrawer } from '../components/PhotoPackageCartDrawer';
import { ShoppingBag, ShoppingCart, Check } from 'lucide-react';

interface PhotoPackageClientProps {
  packages: PhotoPackage[];
}

export default function PhotoPackageClient({ packages }: PhotoPackageClientProps) {
  const { addItem, getTotalItems } = usePhotoPackageCart();
  const [selectedPackage, setSelectedPackage] = useState<PhotoPackage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartItemCount = getTotalItems();

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      return;
    }

    addItem({
      packageId: selectedPackage.id,
      name: selectedPackage.name,
      price: selectedPackage.price,
      description: selectedPackage.description,
      quantity: quantity,
    });

    // Show success message
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);

    // Reset form
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-foreground">
      {/* Cart Drawer */}
      <PhotoPackageCartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Cart Icon - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-40">
        <CartIcon onClick={() => setCartOpen(true)} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Photo Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect photography package for your event. Each package is tailored to capture your special moments.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-600 text-lg">No photo packages available at this time.</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Package Selection */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-light text-gray-900 mb-6">Available Packages</h2>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                        selectedPackage?.id === pkg.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {selectedPackage?.id === pkg.id && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            SELECTED
                          </div>
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-2xl text-gray-900">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-gray-600 mt-2 leading-relaxed">{pkg.description}</p>
                          )}
                          {pkg.features && pkg.features.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-3xl font-bold text-blue-600">
                            ${pkg.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Add to Cart */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-light text-gray-900 mb-6">Add to Cart</h2>

              {/* Preview of what's being added */}
              {selectedPackage && !showAddedMessage && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      Selected Package:
                    </h3>
                    <div className="px-3 py-1 rounded-full text-sm font-bold bg-blue-500 text-white">
                      Preview
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-xl text-gray-900 mb-2">
                      {selectedPackage.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Total Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${(parseFloat(selectedPackage.price) * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddToCart} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-gray-900 font-semibold">
                    Quantity:
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 10) {
                        setQuantity(value);
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">
                    Number of packages (typically 1)
                  </p>
                </div>

                <div className="border-t pt-6">
                  {showAddedMessage && (
                    <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800 animate-pulse">
                      <div className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-semibold">Added to cart!</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {!selectedPackage && (
                      <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <span className="text-yellow-800 text-sm font-medium">
                          Please select a package to continue
                        </span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!selectedPackage}
                      className="w-full font-bold text-lg shadow-lg flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                      size="lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {!selectedPackage ? 'Select a Package' : 'Add to Cart'}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setCartOpen(true)}
                      className="w-full font-bold text-lg shadow-lg flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      View Cart
                      {cartItemCount > 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
