import { pgTable, serial, text, integer, timestamp, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';

export const shirts = pgTable('shirts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  images: jsonb('images').$type<string[]>().default([]),
  sizes: jsonb('sizes').$type<string[]>().default(['S', 'M', 'L', 'XL', 'XXL']),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  shirtId: integer('shirt_id').references(() => shirts.id).notNull(),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSessionId: text('stripe_session_id'),
  status: text('status').default('pending'), // pending, confirmed, expired, invalid, shipped, cancelled
  shippingAddress: jsonb('shipping_address').$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Shirt = typeof shirts.$inferSelect;
export type NewShirt = typeof shirts.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;