import { Product, Customer, SalesOrder, StockTransaction, FinancialEntry, AuditLog, UserProfile } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-default',
    name: 'Authenticated Staff',
    email: 'staff@minierp.io',
    role: 'admin',
    roleTitle: 'ERP Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

// All operational data is dynamic from Supabase database
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_ORDERS: SalesOrder[] = [];
export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [];
export const INITIAL_FINANCIALS: FinancialEntry[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
