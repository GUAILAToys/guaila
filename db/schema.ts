import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const customers = sqliteTable('customers', {id:text('id').primaryKey(), data:text('data').notNull(), revision:integer('revision').notNull().default(1), updated:text('updated').notNull()});
export const sources = sqliteTable('sources', {id:text('id').primaryKey(), data:text('data').notNull(), created:text('created').notNull()});
export const messages = sqliteTable('messages', {id:text('id').primaryKey(), customerId:text('customer_id').notNull(), data:text('data').notNull()});
export const events = sqliteTable('events', {id:text('id').primaryKey(), customerId:text('customer_id').notNull(), data:text('data').notNull(), created:text('created').notNull()});
