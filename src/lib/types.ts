export type UserRole = 'admin' | 'sales' | 'inventory';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  status: 'active' | 'suspended';
  avatar: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockOnHand: number;
  reservedStock: number;
  minStockLevel: number;
  location: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: string;
}

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'delivered' | 'paid' | 'cancelled';

export interface OrderItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  orderDate: string;
  dueDate: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  notes?: string;
  createdByName: string;
}

export type StockTransactionType = 'stock_in' | 'adjustment' | 'damage' | 'sale_deduction' | 'return';

export interface StockTransaction {
  id: string;
  type: StockTransactionType;
  productId: string;
  sku: string;
  productName: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceDoc?: string;
  performedBy: string;
  date: string;
}

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense' | 'cogs';
  category: string;
  amount: number;
  referenceId?: string;
  description: string;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: 'Governance' | 'Sales' | 'Inventory';
  details: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
}
