'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { usePhotoPackageCart } from '../../orders/contexts/PhotoPackageCartContext';

interface OrderItem {
  id: number;
  orderType: 'shirt' | 'photo_package';
  productName: string;
  quantity: number;
  totalAmount: string;
  status?: string;
  // Shirt-specific fields
  size?: string;
  description?: string;
  // Photo package-specific fields
  category?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  additionalDetails?: string;
  // Student information (for school photo packages)
  studentFirstName?: string;
  studentLastName?: string;
  teacher?: string;
  school?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

interface OrderDetails {
  // For single item (backward compatibility)
  id?: number;
  orderType?: 'shirt' | 'photo_package';
  productName?: string;
  size?: string;
  quantity?: number;
  totalAmount: string;
  status?: string;
  paymentVerified?: boolean;
  // Photo package fields
  category?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  additionalDetails?: string;
  description?: string;
  // Student information (for school photo packages)
  studentFirstName?: string;
  studentLastName?: string;
  teacher?: string;
  school?: string;
  parentFirstName?: string;
  parentLastName?: string;
  // For multiple items
  items?: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  itemCount?: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart: clearShirtCart } = useCart();
  const { clearCart: clearPhotoCart } = usePhotoPackageCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    // Clear both carts on successful payment
    clearShirtCart();
    clearPhotoCart();

    if (sessionId) {
      // First sync the order status with Stripe
      setSyncStatus('syncing');
      fetch('/api/sync-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((syncData) => {
          console.log('Sync response:', syncData);
          setSyncStatus(syncData.error ? 'error' : 'synced');

          // Now fetch the updated order details
          return fetch(`/api/order-confirmation?session_id=${sessionId}`);
        })
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails({
            ...data,
            paymentVerified: true
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching order details:', err);
          setSyncStatus('error');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId, clearShirtCart, clearPhotoCart]);

  // Determine if this is a shirt order or photo package order
  const isPhotoPackageOrder = orderDetails?.items
    ? orderDetails.items.some(item => item.orderType === 'photo_package')
    : orderDetails?.orderType === 'photo_package';

  const isShirtOrder = orderDetails?.items
    ? orderDetails.items.some(item => item.orderType === 'shirt')
    : orderDetails?.orderType === 'shirt';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for your {isPhotoPackageOrder ? 'photo package purchase' : 'order'}!
            A receipt has been sent to your email address.
          </p>

          {loading ? (
            <div className="space-y-2">
              <p className="text-gray-500">Verifying payment with Stripe...</p>
              {syncStatus === 'syncing' && (
                <p className="text-sm text-blue-600">Confirming payment status...</p>
              )}
            </div>
          ) : orderDetails ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
                {orderDetails.items ? (
                  // Multiple items
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={item.id} className="border-b border-gray-200 pb-3 last:border-0">
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Item {index + 1}:</span> {item.productName}
                          </p>
                          {item.orderType === 'shirt' && item.size && (
                            <p className="text-gray-600 ml-4">
                              Size: {item.size} | Quantity: {item.quantity} | Subtotal: ${item.totalAmount}
                            </p>
                          )}
                          {item.orderType === 'photo_package' && (
                            <div className="ml-4 space-y-1">
                              <p className="text-gray-600">
                                Quantity: {item.quantity} | Subtotal: ${item.totalAmount}
                              </p>
                              {(item.studentFirstName || item.studentLastName) && (
                                <p className="text-gray-600">
                                  Student: {item.studentFirstName} {item.studentLastName}
                                </p>
                              )}
                              {item.teacher && (
                                <p className="text-gray-600">
                                  Teacher: {item.teacher}
                                </p>
                              )}
                              {item.school && (
                                <p className="text-gray-600">
                                  School: {item.school}
                                </p>
                              )}
                              {item.eventDate && (
                                <p className="text-gray-600">
                                  Event Date: {item.eventDate}
                                </p>
                              )}
                              {item.eventLocation && (
                                <p className="text-gray-600">
                                  Location: {item.eventLocation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-300">
                      <p className="text-gray-900 font-semibold">
                        Total ({orderDetails.itemCount} items): ${orderDetails.totalAmount}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Single item (backward compatibility)
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Item:</span> {orderDetails.productName}
                    </p>

                    {orderDetails.orderType === 'shirt' && orderDetails.size && (
                      <>
                        <p className="text-gray-600">
                          <span className="font-medium">Size:</span> {orderDetails.size}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Quantity:</span> {orderDetails.quantity}
                        </p>
                      </>
                    )}

                    {orderDetails.orderType === 'photo_package' && (
                      <>
                        <p className="text-gray-600">
                          <span className="font-medium">Quantity:</span> {orderDetails.quantity}
                        </p>
                        {(orderDetails.studentFirstName || orderDetails.studentLastName) && (
                          <p className="text-gray-600">
                            <span className="font-medium">Student:</span> {orderDetails.studentFirstName} {orderDetails.studentLastName}
                          </p>
                        )}
                        {orderDetails.teacher && (
                          <p className="text-gray-600">
                            <span className="font-medium">Teacher:</span> {orderDetails.teacher}
                          </p>
                        )}
                        {orderDetails.school && (
                          <p className="text-gray-600">
                            <span className="font-medium">School:</span> {orderDetails.school}
                          </p>
                        )}
                        {orderDetails.eventDate && (
                          <p className="text-gray-600">
                            <span className="font-medium">Event Date:</span> {orderDetails.eventDate}
                          </p>
                        )}
                        {orderDetails.eventLocation && (
                          <p className="text-gray-600">
                            <span className="font-medium">Location:</span> {orderDetails.eventLocation}
                          </p>
                        )}
                        {orderDetails.description && (
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Details:</span> {orderDetails.description}
                          </p>
                        )}
                      </>
                    )}

                    <p className="text-gray-600">
                      <span className="font-medium">Total:</span> ${orderDetails.totalAmount}
                    </p>
                  </div>
                )}
              </div>

              {syncStatus === 'synced' && orderDetails.paymentVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <p className="text-green-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Payment verified with Stripe
                  </p>
                </div>
              )}

              {/* Additional information based on order type */}
              {isShirtOrder && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-blue-900 mb-2">Shipping Information</h3>
                  <p className="text-sm text-blue-800">
                    Your order will be shipped to the address provided during checkout.
                    You will receive tracking information via email once your order ships.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                {syncStatus === 'error'
                  ? 'Unable to verify payment at this time. Please save your confirmation email.'
                  : 'Order confirmation is being processed. Please check your email for details.'}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Return to Home
            </Link>
            {isShirtOrder && (
              <Link
                href="/cougar-comeback-shirt"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                View Shirt Store
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
