'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderDetails {
  id: number;
  shirtName: string;
  size: string;
  quantity: number;
  totalAmount: string;
  status?: string;
  paymentVerified?: boolean;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
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
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
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
            Thank you for your preorder! We've sent a confirmation email with your order details.
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
                <h2 className="font-semibold text-gray-900 mb-2">Order Summary</h2>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Order ID:</span> {orderDetails.id}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Item:</span> {orderDetails.shirtName}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Size:</span> {orderDetails.size}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Quantity:</span> {orderDetails.quantity}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Total:</span> ${orderDetails.totalAmount}
                  </p>
                </div>
              </div>
              
              {syncStatus === 'synced' && orderDetails.paymentVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Payment verified with Stripe
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

          <div className="space-y-3">
            <Link
              href="/cougar-comeback-shirt"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Order Another Shirt
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}