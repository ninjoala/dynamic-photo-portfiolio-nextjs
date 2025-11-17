'use client';

import { useState } from 'react';
import type { PhotoPackage } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePhotoPackageCart } from '../contexts/PhotoPackageCartContext';
import { PhotoPackageCartDrawer } from '../components/PhotoPackageCartDrawer';
import { ShoppingBag, ShoppingCart, Check, Package } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-brand-green-dark via-brand-green to-brand-sage relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-brand-moss/40 before:via-transparent before:to-brand-green-light/30 before:pointer-events-none">
      {/* Cart Drawer */}
      <PhotoPackageCartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            George Jenkins Band Photo Packages
          </h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)' }}>
            Capture your band memories with our premium photography packages
          </p>
        </div>

        {packages.length === 0 ? (
          <Card className="max-w-lg mx-auto bg-white/80 backdrop-blur-sm shadow-xl border-gray-200/60">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Package className="w-8 h-8 text-brand-green-dark" />
              </div>
              <CardTitle className="mb-2">No Packages Available</CardTitle>
              <CardDescription className="text-base">
                No photo packages are currently available. Please check back later or contact us for more information.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column: Package Selection */}
            <div className="space-y-4 lg:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-gray-200/60">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-green-dark" />
                    Available Packages
                  </CardTitle>
                  <CardDescription>
                    Choose the package that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedPackage?.id === pkg.id}
                      aria-label={`Select ${pkg.name} package for $${pkg.price}`}
                      className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                        selectedPackage?.id === pkg.id
                          ? 'border-brand-green-dark bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl ring-4 ring-brand-green-dark/20 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-brand-green hover:shadow-lg hover:scale-[1.01]'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPackage(pkg);
                        }
                      }}
                    >
                      {selectedPackage?.id === pkg.id && (
                        <Badge variant="success" className="mb-3 gap-1 bg-brand-green-dark text-white hover:bg-brand-moss shadow-sm pointer-events-none">
                          <Check className="w-3 h-3" />
                          Selected
                        </Badge>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl sm:text-2xl mb-1 truncate">
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                              {pkg.description}
                            </p>
                          )}
                          {pkg.features && pkg.features.length > 0 && (
                            <ul className="mt-4 space-y-2" role="list">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="text-xs sm:text-sm flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-green-dark flex-shrink-0 mt-0.5" />
                                  <span className="flex-1">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="inline-flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-medium mb-1">Price</span>
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-green-dark to-brand-moss bg-clip-text text-transparent">
                              ${pkg.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Add to Cart */}
            <div className="lg:sticky lg:top-4 h-fit space-y-4 lg:space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-gray-200/60">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-brand-green-dark" />
                    Add to Cart
                  </CardTitle>
                  <CardDescription>
                    Configure your package and add it to your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preview of what's being added */}
                  {selectedPackage && !showAddedMessage && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/60 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Package className="w-4 h-4 text-brand-green-dark" />
                          Selected Package
                        </h3>
                        <Badge variant="success" className="bg-brand-green-dark text-white shadow-sm">Preview</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-emerald-200/40 shadow-sm">
                        <h4 className="font-bold text-lg mb-3">
                          {selectedPackage.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground font-medium">Total Price:</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-brand-green-dark to-brand-moss bg-clip-text text-transparent">
                            ${(parseFloat(selectedPackage.price) * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleAddToCart} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-semibold">
                        Quantity
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
                        aria-describedby="quantity-description"
                      />
                      <p id="quantity-description" className="text-xs text-muted-foreground">
                        Number of packages (typically 1)
                      </p>
                    </div>

                    <div className="border-t pt-6 space-y-3">
                      {showAddedMessage && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-brand-green text-brand-green-dark animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                          <div className="flex items-center justify-center gap-2">
                            <div className="rounded-full bg-brand-green-dark p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold">Added to cart!</span>
                          </div>
                        </div>
                      )}

                      {!selectedPackage && (
                        <div className="text-center p-4 rounded-xl bg-muted/50 border-2 border-border">
                          <span className="text-sm font-medium text-muted-foreground">
                            Please select a package to continue
                          </span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={!selectedPackage}
                        className="w-full text-base sm:text-lg bg-gradient-to-r from-brand-green-dark to-brand-moss hover:from-brand-moss hover:to-brand-green-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        size="lg"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {!selectedPackage ? 'Select a Package' : 'Add to Cart'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCartOpen(true)}
                        className="w-full text-base sm:text-lg border-2 border-brand-green-dark text-brand-green-dark hover:bg-brand-sage/20 shadow-sm hover:shadow-md transition-all duration-300"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        View Cart
                        {cartItemCount > 0 && (
                          <Badge variant="default" className="ml-2 bg-brand-green-dark text-white shadow-sm">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
