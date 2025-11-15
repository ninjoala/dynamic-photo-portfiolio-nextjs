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

export const photoPackages = pgTable('photo_packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'real-estate', 'event', 'family', 'sports'
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  features: jsonb('features').$type<string[]>().default([]),
  maxPhotos: integer('max_photos'), // null for unlimited
  turnaroundDays: integer('turnaround_days'),
  active: boolean('active').default(true),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),

  // Legacy shirt fields (kept for backward compatibility)
  shirtId: integer('shirt_id').references(() => shirts.id),
  size: text('size'),

  // New polymorphic design
  orderType: text('order_type').notNull().default('shirt'), // 'shirt' | 'photo_package'
  productId: integer('product_id').notNull(), // references shirts.id OR photoPackages.id
  productOptions: jsonb('product_options').$type<{
    // For shirts
    size?: string;
    // For photo packages
    eventDate?: string;
    eventLocation?: string;
    eventType?: string;
    additionalDetails?: string;
    // Student information (for school photo packages)
    studentFirstName?: string;
    studentLastName?: string;
    teacher?: string;
    school?: string;
    // Parent information (for school photo packages)
    parentFirstName?: string;
    parentLastName?: string;
  }>(),

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
export type PhotoPackage = typeof photoPackages.$inferSelect;
export type NewPhotoPackage = typeof photoPackages.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;