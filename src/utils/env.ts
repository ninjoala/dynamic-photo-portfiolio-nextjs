/**
 * Environment Variable Validation System
 *
 * This module provides type-safe, validated access to environment variables.
 * It prevents production crashes by validating all required variables at runtime.
 *
 * Usage:
 *   import { serverEnv, clientEnv } from '@/utils/env';
 *
 * Server-side only:
 *   const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);
 *
 * Client-side:
 *   const stripePromise = loadStripe(clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
 */

/**
 * Server-side environment variables (never exposed to client)
 */
interface ServerEnv {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_TEST_WEBHOOK_SECRET?: string;
  DATABASE_URL: string;
  NEXT_PUBLIC_BASE_URL?: string;
  VERCEL_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
}

/**
 * Client-side environment variables (NEXT_PUBLIC_* only)
 */
interface ClientEnv {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  NEXT_PUBLIC_BASE_URL?: string;
}

/**
 * Validates server-side environment variables
 *
 * @throws {Error} If any required environment variable is missing
 * @returns {ServerEnv} Validated server environment variables
 */
function validateServerEnv(): ServerEnv {
  const required: Record<keyof Pick<ServerEnv, 'STRIPE_SECRET_KEY' | 'STRIPE_WEBHOOK_SECRET' | 'DATABASE_URL'>, string | undefined> = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(', ')}\n` +
      `Check that .env.local exists and contains these variables.`
    );
  }

  // Validate Stripe key format
  const stripeKey = required.STRIPE_SECRET_KEY!;
  if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
    throw new Error(
      `Invalid STRIPE_SECRET_KEY format. Expected to start with 'sk_test_' or 'sk_live_', got: ${stripeKey.substring(0, 8)}...`
    );
  }

  // For test mode, validate test webhook secret if provided
  const isTestMode = stripeKey.startsWith('sk_test_');
  const testWebhookSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET;

  if (isTestMode && testWebhookSecret) {
    // Test webhook secrets start with 'whsec_'
    if (!testWebhookSecret.startsWith('whsec_')) {
      throw new Error(
        `Invalid STRIPE_TEST_WEBHOOK_SECRET format. Expected to start with 'whsec_', got: ${testWebhookSecret.substring(0, 8)}...`
      );
    }
  }

  return {
    STRIPE_SECRET_KEY: required.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: required.STRIPE_WEBHOOK_SECRET!,
    STRIPE_TEST_WEBHOOK_SECRET: testWebhookSecret,
    DATABASE_URL: required.DATABASE_URL!,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  };
}

/**
 * Validates client-side environment variables
 *
 * @throws {Error} If any required environment variable is missing
 * @returns {ClientEnv} Validated client environment variables
 */
function validateClientEnv(): ClientEnv {
  const required: Record<keyof Pick<ClientEnv, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'>, string | undefined> = {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missing.join(', ')}\n` +
      `Check that .env.local exists and contains these NEXT_PUBLIC_* variables.`
    );
  }

  // Validate Stripe publishable key format
  const publishableKey = required.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    throw new Error(
      `Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Expected to start with 'pk_test_' or 'pk_live_', got: ${publishableKey.substring(0, 8)}...`
    );
  }

  return {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: required.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  };
}

/**
 * Determines if Stripe is running in test mode
 *
 * @returns {boolean} True if using test mode credentials
 */
export function isStripeTestEnvironment(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? secretKey.startsWith('sk_test_') : false;
}

/**
 * Gets the appropriate webhook secret based on test mode detection
 *
 * @returns {string} The webhook secret to use (test or production)
 */
export function getWebhookSecret(): string {
  const isTest = isStripeTestEnvironment();
  const testSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET;
  const prodSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If in test mode and test secret is available, use it
  if (isTest && testSecret) {
    return testSecret;
  }

  // Otherwise use production secret (or throw if missing)
  if (!prodSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return prodSecret;
}

/**
 * Validated server-side environment variables
 * Only import this in server-side code (API routes, Server Components, server actions)
 *
 * @throws {Error} On module load if validation fails
 */
export const serverEnv: ServerEnv = (() => {
  // Only validate on server-side
  if (typeof window === 'undefined') {
    return validateServerEnv();
  }
  // Return empty object for client-side (will error if accessed)
  return {} as ServerEnv;
})();

/**
 * Validated client-side environment variables
 * Safe to import in both client and server code
 *
 * @throws {Error} On module load if validation fails
 */
export const clientEnv: ClientEnv = validateClientEnv();

/**
 * Type guard to check if code is running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Type guard to check if code is running on client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}
