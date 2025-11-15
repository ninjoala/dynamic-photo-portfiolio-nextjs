'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Trash2 } from 'lucide-react';
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
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        ) : showCheckoutForm ? (
          // Checkout Form
          <div className="mt-6 space-y-4">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors mb-2"
            >
              ← Back to Cart
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentFirstName" className="text-gray-900 font-bold">Parent First Name:</Label>
                <Input
                  id="parentFirstName"
                  type="text"
                  required
                  value={parentFirstName}
                  onChange={(e) => setParentFirstName(e.target.value)}
                  placeholder="John"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentLastName" className="text-gray-900 font-bold">Parent Last Name:</Label>
                <Input
                  id="parentLastName"
                  type="text"
                  required
                  value={parentLastName}
                  onChange={(e) => setParentLastName(e.target.value)}
                  placeholder="Doe"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900 font-bold">Phone:</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-bold">Email Address:</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail" className="text-gray-900 font-bold">Confirm Email Address:</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentFirstName" className="text-gray-900 font-bold">Student First Name:</Label>
                <Input
                  id="studentFirstName"
                  type="text"
                  required
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  placeholder="Jane"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentLastName" className="text-gray-900 font-bold">Student Last Name:</Label>
                <Input
                  id="studentLastName"
                  type="text"
                  required
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  placeholder="Doe"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="text-gray-900 font-bold">Teacher:</Label>
                <Input
                  id="teacher"
                  type="text"
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Mrs. Smith"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="text-gray-900 font-bold">School:</Label>
                <Input
                  id="school"
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="School name"
                  className="border-gray-300"
                />
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary:</h3>
                {items.map((item, index) => (
                  <div key={`${item.packageId}-${index}`} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{item.name}</p>
                        {item.quantity > 1 && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-900 font-bold ml-4">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleFinalCheckout}
                  disabled={loading || !parentFirstName || !parentLastName || !phone || !email || !confirmEmail ||
                           !studentFirstName || !studentLastName || !teacher || !school}
                  className="w-full font-bold text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-3">
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
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ${item.price} {item.quantity > 1 && `× ${item.quantity}`}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-gray-900 text-lg">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.packageId)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800">
                  {error}
                </div>
              )}

              <Button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="w-full font-bold text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-gray-600 hover:text-gray-800 transition-colors"
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
