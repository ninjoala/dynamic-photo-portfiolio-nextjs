'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/order-confirmation?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching order details:', err);
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
            <p className="text-gray-500">Loading order details...</p>
          ) : orderDetails ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
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
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                Order confirmation is being processed. Please check your email for details.
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