'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Redirect to the new universal success page
    if (sessionId) {
      router.replace(`/checkout/success?session_id=${sessionId}`);
    } else {
      router.replace('/checkout/success');
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-gray-500">Redirecting to order confirmation...</p>
      </div>
    </div>
  );
}

export default function LegacySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}