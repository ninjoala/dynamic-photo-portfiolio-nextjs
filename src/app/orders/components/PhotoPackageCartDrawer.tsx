'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Trash2, Package } from 'lucide-react';
import { usePhotoPackageCart } from '../contexts/PhotoPackageCartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}
const stripePromise = loadStripe(stripeKey, {
  locale: 'en'
});

interface PhotoPackageCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoPackageCartDrawer({ open, onOpenChange }: PhotoPackageCartDrawerProps) {
  const { items, removeItem, clearCart, getTotal } = usePhotoPackageCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [school, setSchool] = useState('');

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setShowCheckoutForm(true);
  };

  const handleFinalCheckout = async () => {
    if (items.length === 0) return;

    // Validate all required fields
    if (!parentFirstName || !parentLastName || !phone || !email || !confirmEmail ||
        !studentFirstName || !studentLastName || !teacher || !school) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email match
    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parentName = `${parentFirstName} ${parentLastName}`;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productType: 'photo_package',
            productId: item.packageId,
            quantity: item.quantity,
          })),
          email,
          name: parentName,
          phone,
          parentFirstName,
          parentLastName,
          studentFirstName,
          studentLastName,
          teacher,
          school,
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
        className="w-full sm:max-w-lg overflow-y-auto bg-white"
      >
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-green-dark flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">{items.length}</span>
            </div>
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 rounded-full bg-brand-sage flex items-center justify-center mb-4 shadow-sm">
              <Package className="w-8 h-8 text-brand-green-dark" />
            </div>
            <p className="text-lg mb-4 font-medium">Your cart is empty</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="font-semibold bg-gradient-to-r from-brand-green-dark to-brand-moss hover:from-brand-moss hover:to-brand-green-dark text-white shadow-lg"
            >
              Continue Shopping
            </Button>
          </div>
        ) : showCheckoutForm ? (
          // Checkout Form
          <div className="mt-6 space-y-4">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1 font-medium"
            >
              ← Back to Cart
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentFirstName" className="font-semibold">Parent First Name</Label>
                <Input
                  id="parentFirstName"
                  type="text"
                  required
                  value={parentFirstName}
                  onChange={(e) => setParentFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentLastName" className="font-semibold">Parent Last Name</Label>
                <Input
                  id="parentLastName"
                  type="text"
                  required
                  value={parentLastName}
                  onChange={(e) => setParentLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email Address</Label>
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
                <Label htmlFor="confirmEmail" className="font-semibold">Confirm Email Address</Label>
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
                <Label htmlFor="studentFirstName" className="font-semibold">Student First Name</Label>
                <Input
                  id="studentFirstName"
                  type="text"
                  required
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentLastName" className="font-semibold">Student Last Name</Label>
                <Input
                  id="studentLastName"
                  type="text"
                  required
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="font-semibold">Teacher</Label>
                <Input
                  id="teacher"
                  type="text"
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Mrs. Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="font-semibold">School</Label>
                <Input
                  id="school"
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="School name"
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                {items.map((item, index) => (
                  <div key={`${item.packageId}-${index}`} className="bg-white rounded-lg p-3 mb-2 border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.quantity > 1 && (
                          <div className="mt-1">
                            <span className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-bold ml-4">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-brand-green-dark to-brand-moss bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleFinalCheckout}
                  disabled={loading || !parentFirstName || !parentLastName || !phone || !email || !confirmEmail ||
                           !studentFirstName || !studentLastName || !teacher || !school}
                  className="w-full font-bold text-lg shadow-lg bg-gradient-to-r from-brand-green-dark to-brand-moss hover:from-brand-moss hover:to-brand-green-dark text-white disabled:opacity-50 transition-all duration-300"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  You will be redirected to Stripe for secure payment
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Cart Items View
          <div className="mt-6 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.packageId}-${index}`}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${item.price} {item.quantity > 1 && `× ${item.quantity}`}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-lg">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.packageId)}
                    className="text-destructive hover:text-destructive/80 p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-brand-green-dark to-brand-moss bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="w-full font-bold text-lg shadow-lg bg-gradient-to-r from-brand-green-dark to-brand-moss hover:from-brand-moss hover:to-brand-green-dark text-white hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
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
