/**
 * Stripe utility functions for detecting test mode and handling Stripe-related operations
 */

import { isStripeTestEnvironment } from './env';

/**
 * Determines if a Stripe session is in test mode
 *
 * @param stripeSessionId - The Stripe checkout session ID
 * @returns boolean indicating if this is a test mode transaction
 *
 * Detection strategy:
 * 1. Check if session ID starts with 'cs_test_' (Stripe test session)
 * 2. Fallback: Check if STRIPE_SECRET_KEY starts with 'sk_test_' (via validated env)
 *
 * Examples:
 * - Production session: cs_live_a1b2c3...
 * - Test session: cs_test_a1b2c3...
 *
 * Note: Payment Intent IDs (pi_xxx) do NOT have test mode indicators.
 * The mode is determined by which API key is used, not the object ID format.
 */
export function isStripeTestMode(stripeSessionId?: string | null): boolean {
  // Primary detection: Check session ID prefix
  if (stripeSessionId) {
    // Test session IDs start with 'cs_test_'
    if (stripeSessionId.startsWith('cs_test_')) {
      return true;
    }
    // Live session IDs start with 'cs_live_'
    if (stripeSessionId.startsWith('cs_live_')) {
      return false;
    }
  }

  // Fallback detection: Check if the Stripe secret key is a test key
  // Uses validated environment variable from centralized env module
  return isStripeTestEnvironment();
}

/**
 * Gets the Stripe mode (test or live) for logging and display purposes
 *
 * @param stripeSessionId - Optional session ID to check
 * @returns 'test' | 'live'
 */
export function getStripeMode(stripeSessionId?: string | null): 'test' | 'live' {
  return isStripeTestMode(stripeSessionId) ? 'test' : 'live';
}
