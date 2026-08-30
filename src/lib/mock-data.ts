import { Product, Customer, SalesOrder, StockTransaction, FinancialEntry, AuditLog, UserProfile } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@minierp.io',
    role: 'admin',
    roleTitle: 'Managing Director & CFO',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-2',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@minierp.io',
    role: 'sales',
    roleTitle: 'Senior Sales Representative',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-3',
    name: 'Darius Thorne',
    email: 'darius.thorne@minierp.io',
    role: 'inventory',
    roleTitle: 'Lead Warehouse & Stock Clerk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

// All operational data is dynamic from Supabase database
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_ORDERS: SalesOrder[] = [];
export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [];
export const INITIAL_FINANCIALS: FinancialEntry[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
