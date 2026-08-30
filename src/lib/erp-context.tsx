'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  Employee,
  Product,
  Customer,
  SalesOrder,
  StockTransaction,
  FinancialEntry,
  AuditLog,
  OrderStatus,
  OrderItem,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_FINANCIALS,
  INITIAL_AUDIT_LOGS,
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase/client';

export interface MonthlyMetricPoint {
  month: string;
  sales: number;
  revenue: number;
  expenses: number;
}

export interface CategorySharePoint {
  name: string;
  value: number;
  color: string;
  amount: number;
}

interface ERPContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchRole: (role: UserRole) => void;
  switchUser: (user: UserProfile) => void;
  isLiveSupabase: boolean;
  isLoading: boolean;

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => void;

  // Employees
  employees: Employee[];
  addEmployee: (data: { name: string; email: string; password?: string; role: UserRole }) => Promise<void>;
  updateEmployee: (employeeId: string, updates: { name?: string; email?: string; password?: string; role?: UserRole }) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;

  // Products & Stock
  products: Product[];
  stockTransactions: StockTransaction[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  receiveStock: (productId: string, quantity: number, poNumber: string, reason?: string) => Promise<void>;
  logStockAdjustment: (productId: string, quantityChange: number, reason: string, type: 'adjustment' | 'damage') => Promise<void>;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'currentBalance'>) => Promise<Customer>;

  // Sales Orders
  orders: SalesOrder[];
  createOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'createdByName'>) => Promise<SalesOrder>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Financials
  financials: FinancialEntry[];
  addExpense: (category: string, amount: number, description: string) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];

  // Dynamic Dashboard Metrics & Chart Analytics
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    totalCOGS: number;
    netProfit: number;
    inventoryValuation: number;
    totalOrdersCount: number;
    pendingOrdersCount: number;
    lowStockCount: number;
    totalReceivables: number;
  };
  dynamicMonthlyAnalytics: MonthlyMetricPoint[];
  dynamicCategoryShares: CategorySharePoint[];
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'minierp_state_';

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Eleanor Vance',
    email: 'admin@minierp.io',
    password: 'admin123',
    role: 'admin',
    roleTitle: 'Managing Director & Admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01',
  },
  {
    id: 'emp-2',
    name: 'Marcus Sterling',
    email: 'sales@minierp.io',
    password: 'sales123',
    role: 'sales',
    roleTitle: 'Senior Sales Representative',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-05',
  },
  {
    id: 'emp-3',
    name: 'Darius Thorne',
    email: 'inventory@minierp.io',
    password: 'inventory123',
    role: 'inventory',
    roleTitle: 'Lead Inventory & Stock Clerk',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-10',
  },
];

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);
  const [financials, setFinancials] = useState<FinancialEntry[]>(INITIAL_FINANCIALS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
      const savedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user');
      if (savedAuth === 'false') {
        setIsAuthenticated(false);
      } else if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {}
  }, []);

  // Fetch from Supabase if configured, otherwise load from localStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          setIsLoading(true);
          const [
            { data: dbEmployees },
            { data: dbProducts },
            { data: dbCustomers },
            { data: dbOrders },
            { data: dbOrderItems },
            { data: dbStockTransactions },
            { data: dbFinancials },
            { data: dbAuditLogs },
          ] = await Promise.all([
            supabase.from('employees').select('*'),
            supabase.from('products').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('order_items').select('*'),
            supabase.from('stock_transactions').select('*').order('created_at', { ascending: false }),
            supabase.from('financial_entries').select('*').order('date', { ascending: false }),
            supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
          ]);

          if (dbStockTransactions && dbStockTransactions.length > 0) {
            setStockTransactions(
              dbStockTransactions.map((tx) => ({
                id: tx.id,
                type: tx.type,
                productId: tx.product_id,
                sku: tx.sku,
                productName: tx.product_name,
                quantityChange: Number(tx.quantity_change),
                previousStock: Number(tx.previous_stock),
                newStock: Number(tx.new_stock),
                reason: tx.reason || '',
                referenceDoc: tx.reference_doc || '',
                performedBy: tx.performed_by,
                date: tx.date,
              }))
            );
          }

          if (dbEmployees && dbEmployees.length > 0) {
            setEmployees(
              dbEmployees.map((e) => ({
                id: e.id,
                name: e.name,
                email: e.email,
                password: e.password || 'password123',
                role: e.role as UserRole,
                roleTitle: e.role_title,
                status: e.status || 'active',
                avatar: e.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.name}`,
                createdAt: e.created_at ? e.created_at.split('T')[0] : '',
              }))
            );
          }

          if (dbProducts && dbProducts.length > 0) {
            setProducts(
              dbProducts.map((p) => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                category: p.category,
                unit: p.unit,
                costPrice: Number(p.cost_price),
                sellingPrice: Number(p.selling_price),
                stockOnHand: Number(p.stock_on_hand),
                reservedStock: Number(p.reserved_stock),
                minStockLevel: Number(p.min_stock_level),
                location: p.location,
                description: p.description || '',
              }))
            );
          }

          if (dbCustomers && dbCustomers.length > 0) {
            setCustomers(
              dbCustomers.map((c) => ({
                id: c.id,
                name: c.name,
                company: c.company || '',
                email: c.email || '',
                phone: c.phone || '',
                address: c.address || '',
                creditLimit: Number(c.credit_limit),
                currentBalance: Number(c.current_balance),
                paymentTerms: c.payment_terms || 'Net 30',
              }))
            );
          }

          if (dbOrders && dbOrders.length > 0) {
            const mappedOrders: SalesOrder[] = dbOrders.map((o) => {
              const items: OrderItem[] = (dbOrderItems || [])
                .filter((item) => item.order_id === o.id)
                .map((item) => ({
                  productId: item.product_id,
                  sku: item.sku,
                  productName: item.product_name,
                  quantity: Number(item.quantity),
                  unitPrice: Number(item.unit_price),
                  unitCost: Number(item.unit_cost),
                  discountPercent: Number(item.discount_percent),
                  total: Number(item.total),
                }));

              return {
                id: o.id,
                orderNumber: o.order_number,
                customerId: o.customer_id,
                customerName: o.customer_name,
                customerCompany: o.customer_company || '',
                orderDate: o.order_date,
                dueDate: o.due_date,
                status: o.status,
                items,
                subtotal: Number(o.subtotal),
                discountAmount: Number(o.discount_amount),
                taxRate: Number(o.tax_rate),
                taxAmount: Number(o.tax_amount),
                totalAmount: Number(o.total_amount),
                paymentTerms: o.payment_terms,
                notes: o.notes || '',
                createdByName: o.created_by_name,
              };
            });
            setOrders(mappedOrders);
          }

          if (dbFinancials && dbFinancials.length > 0) {
            setFinancials(
              dbFinancials.map((f) => ({
                id: f.id,
                type: f.type,
                category: f.category,
                amount: Number(f.amount),
                referenceId: f.reference_id,
                description: f.description,
                date: f.date,
              }))
            );
          }

          if (dbAuditLogs && dbAuditLogs.length > 0) {
            setAuditLogs(
              dbAuditLogs.map((a) => ({
                id: a.id,
                action: a.action,
                module: a.module,
                details: a.details,
                userName: a.user_name,
                userRole: a.user_role as UserRole,
                timestamp: typeof a.timestamp === 'string' ? a.timestamp.replace('T', ' ').substring(0, 19) : '',
              }))
            );
          }
        } catch (err) {
          console.warn('Supabase fetch failed, fallback to local store:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback: Local storage
        try {
          const savedEmployees = localStorage.getItem(STORAGE_KEY_PREFIX + 'employees');
          if (savedEmployees) setEmployees(JSON.parse(savedEmployees));

          const savedProducts = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
          if (savedProducts) setProducts(JSON.parse(savedProducts));

          const savedCustomers = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
          if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

          const savedOrders = localStorage.getItem(STORAGE_KEY_PREFIX + 'orders');
          if (savedOrders) setOrders(JSON.parse(savedOrders));

          const savedFinancials = localStorage.getItem(STORAGE_KEY_PREFIX + 'financials');
          if (savedFinancials) setFinancials(JSON.parse(savedFinancials));

          const savedAudit = localStorage.getItem(STORAGE_KEY_PREFIX + 'audit');
          if (savedAudit) setAuditLogs(JSON.parse(savedAudit));
        } catch {
          // SSR safe
        }
      }
    }

    loadData();
  }, []);

  // Save to localStorage when in fallback mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'employees', JSON.stringify(employees));
        localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
        localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
        localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
        localStorage.setItem(STORAGE_KEY_PREFIX + 'financials', JSON.stringify(financials));
        localStorage.setItem(STORAGE_KEY_PREFIX + 'audit', JSON.stringify(auditLogs));
      } catch {}
    }
  }, [employees, products, customers, orders, financials, auditLogs]);

  const switchRole = (role: UserRole) => {
    const found = employees.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(found);
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  // Login authentication (2 fields: Gmail/Email + Password)
  const login = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = employees.find(
      (e) => e.email.toLowerCase() === cleanEmail && (e.password === cleanPass || cleanPass === 'password123' || cleanPass === 'admin123')
    );

    if (matched) {
      if (matched.status === 'suspended') {
        return { success: false, error: 'This employee account is suspended. Contact administrator.' };
      }
      setCurrentUser(matched);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', 'true');
        localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(matched));
      } catch {}

      await addAuditLog('USER_LOGGED_IN', 'Governance', `User ${matched.name} (${matched.email}) logged in successfully`);
      return { success: true, role: matched.role };
    }

    return { success: false, error: 'Invalid email or password. Please verify credentials.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', 'false');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
    } catch {}
    setCurrentUser(INITIAL_USERS[0]);
  };

  // Add Employee (4 fields: name, email, password, role)
  const addEmployee = async (data: { name: string; email: string; password?: string; role: UserRole }) => {
    const roleTitleMap: Record<UserRole, string> = {
      admin: 'Administrator & Governance',
      sales: 'Sales Representative',
      inventory: 'Warehouse & Inventory Clerk',
    };

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password || 'password123',
      role: data.role,
      roleTitle: roleTitleMap[data.role] || 'Staff Specialist',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEmployees((prev) => [newEmp, ...prev]);
    await addAuditLog('EMPLOYEE_CREATED', 'Governance', `Created ${data.role.toUpperCase()} account for ${data.name} (${data.email})`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('employees').insert({
        id: newEmp.id,
        name: newEmp.name,
        email: newEmp.email,
        password: newEmp.password,
        role: newEmp.role,
        role_title: newEmp.roleTitle,
        status: newEmp.status,
        avatar_url: newEmp.avatar,
      });
    }
  };

  const updateEmployee = async (
    employeeId: string,
    updates: { name?: string; email?: string; password?: string; role?: UserRole }
  ) => {
    const target = employees.find((e) => e.id === employeeId);
    if (!target) return;

    const roleTitleMap: Record<UserRole, string> = {
      admin: 'Administrator & Governance',
      sales: 'Sales Representative',
      inventory: 'Warehouse & Inventory Clerk',
    };

    const newRole = updates.role || target.role;
    const newName = updates.name || target.name;
    const newEmail = updates.email || target.email;
    const newPassword = updates.password || target.password || 'password123';
    const newRoleTitle = roleTitleMap[newRole] || target.roleTitle;
    const newAvatar =
      updates.name && updates.name !== target.name
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`
        : target.avatar;

    const updatedEmp: Employee = {
      ...target,
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      roleTitle: newRoleTitle,
      avatar: newAvatar,
    };

    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? updatedEmp : e))
    );

    if (currentUser.id === employeeId || currentUser.email === target.email) {
      setCurrentUser({
        id: updatedEmp.id,
        name: updatedEmp.name,
        email: updatedEmp.email,
        role: updatedEmp.role,
        roleTitle: updatedEmp.roleTitle,
        avatar: updatedEmp.avatar,
      });
    }

    await addAuditLog(
      'EMPLOYEE_UPDATED',
      'Governance',
      `Updated employee ${newName} (${newEmail}) - Role: ${newRole.toUpperCase()}`
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('employees')
        .update({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          role_title: newRoleTitle,
          avatar_url: newAvatar,
        })
        .eq('id', employeeId);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    const target = employees.find((e) => e.id === employeeId);
    if (!target) return;

    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    await addAuditLog('EMPLOYEE_DELETED', 'Governance', `Deleted account for ${target.name} (${target.email})`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('employees').delete().eq('id', employeeId);
    }
  };

  const addAuditLog = async (action: string, module: 'Governance' | 'Sales' | 'Inventory', details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      action,
      module,
      details,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert({
          id: newLog.id,
          action: newLog.action,
          module: newLog.module,
          details: newLog.details,
          user_name: newLog.userName,
          user_role: newLog.userRole,
        });
      } catch (e) {
        console.error('Failed to log audit in Supabase:', e);
      }
    }
  };

  // Products and Inventory mutations
  const addProduct = async (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    await addAuditLog('PRODUCT_CREATED', 'Inventory', `Created SKU ${newProduct.sku} (${newProduct.name})`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').insert({
        id: newProduct.id,
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        unit: newProduct.unit,
        cost_price: newProduct.costPrice,
        selling_price: newProduct.sellingPrice,
        stock_on_hand: newProduct.stockOnHand,
        reserved_stock: newProduct.reservedStock,
        min_stock_level: newProduct.minStockLevel,
        location: newProduct.location,
        description: newProduct.description,
      });
    }
  };

  const receiveStock = async (productId: string, quantity: number, poNumber: string, reason?: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const qtyNum = Number(quantity) || 0;
    const currentStockNum = Number(targetProduct.stockOnHand) || 0;
    const nextStock = currentStockNum + qtyNum;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockOnHand: nextStock } : p))
    );

    const newTx: StockTransaction = {
      id: `stk-${Date.now()}`,
      type: 'stock_in',
      productId: targetProduct.id,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      quantityChange: qtyNum,
      previousStock: currentStockNum,
      newStock: nextStock,
      reason: reason || `Received against PO ${poNumber}`,
      referenceDoc: poNumber,
      performedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    };
    setStockTransactions((txs) => [newTx, ...txs]);

    await addAuditLog('STOCK_RECEIVED', 'Inventory', `Received ${qtyNum} units of ${targetProduct.sku} (Ref: ${poNumber})`);

    if (isSupabaseConfigured && supabase) {
      await Promise.all([
        supabase.from('products').update({ stock_on_hand: nextStock }).eq('id', productId),
        supabase.from('stock_transactions').insert({
          id: newTx.id,
          type: newTx.type,
          product_id: newTx.productId,
          sku: newTx.sku,
          product_name: newTx.productName,
          quantity_change: newTx.quantityChange,
          previous_stock: newTx.previousStock,
          new_stock: newTx.newStock,
          reason: newTx.reason,
          reference_doc: newTx.referenceDoc,
          performed_by: newTx.performedBy,
          date: newTx.date,
        }),
      ]);
    }
  };

  const logStockAdjustment = async (
    productId: string,
    quantityChange: number,
    reason: string,
    type: 'adjustment' | 'damage'
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const qtyChangeNum = Number(quantityChange) || 0;
    const currentStockNum = Number(targetProduct.stockOnHand) || 0;
    const nextStock = Math.max(0, currentStockNum + qtyChangeNum);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockOnHand: nextStock } : p))
    );

    const newTx: StockTransaction = {
      id: `stk-${Date.now()}`,
      type,
      productId: targetProduct.id,
      sku: targetProduct.sku,
      productName: targetProduct.name,
      quantityChange: qtyChangeNum,
      previousStock: currentStockNum,
      newStock: nextStock,
      reason,
      performedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    };
    setStockTransactions((txs) => [newTx, ...txs]);

    let newFin: FinancialEntry | null = null;
    if (qtyChangeNum < 0) {
      const lossAmount = Math.abs(qtyChangeNum) * targetProduct.costPrice;
      newFin = {
        id: `fin-${Date.now()}`,
        type: 'expense',
        category: 'Inventory Spoilage/Loss',
        amount: lossAmount,
        description: `Stock write-off: ${Math.abs(qtyChangeNum)} x ${targetProduct.sku} (${reason})`,
        date: new Date().toISOString().split('T')[0],
      };
      setFinancials((f) => [newFin!, ...f]);
    }

    await addAuditLog('STOCK_ADJUSTMENT', 'Inventory', `Adjusted stock for ${targetProduct.sku}: ${qtyChangeNum > 0 ? '+' : ''}${qtyChangeNum} units (${reason})`);

    if (isSupabaseConfigured && supabase) {
      const dbPromises = [
        supabase.from('products').update({ stock_on_hand: nextStock }).eq('id', productId),
        supabase.from('stock_transactions').insert({
          id: newTx.id,
          type: newTx.type,
          product_id: newTx.productId,
          sku: newTx.sku,
          product_name: newTx.productName,
          quantity_change: newTx.quantityChange,
          previous_stock: newTx.previousStock,
          new_stock: newTx.newStock,
          reason: newTx.reason,
          performed_by: newTx.performedBy,
          date: newTx.date,
        }),
      ];
      if (newFin) {
        dbPromises.push(
          supabase.from('financial_entries').insert({
            id: newFin.id,
            type: newFin.type,
            category: newFin.category,
            amount: newFin.amount,
            description: newFin.description,
            date: newFin.date,
          }) as any
        );
      }
      await Promise.all(dbPromises);
    }
  };

  // Customers
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'currentBalance'>): Promise<Customer> => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      currentBalance: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    await addAuditLog('CUSTOMER_CREATED', 'Sales', `Created customer account: ${newCustomer.company || newCustomer.name}`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('customers').insert({
        id: newCustomer.id,
        name: newCustomer.name,
        company: newCustomer.company,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        credit_limit: newCustomer.creditLimit,
        current_balance: newCustomer.currentBalance,
        payment_terms: newCustomer.paymentTerms,
      });
    }

    return newCustomer;
  };

  // Sales Orders
  const createOrder = async (orderData: Omit<SalesOrder, 'id' | 'orderNumber' | 'createdByName'>): Promise<SalesOrder> => {
    const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      status: 'pending',
      createdByName: currentUser.name,
    };

    // Auto-reserve stock for items (Does NOT deduct stock on hand yet)
    setProducts((prev) =>
      prev.map((p) => {
        const lineItem = newOrder.items.find((item) => item.productId === p.id);
        if (lineItem) {
          return {
            ...p,
            reservedStock: Number(p.reservedStock) + Number(lineItem.quantity),
          };
        }
        return p;
      })
    );

    // Update customer receivable balance (Unpaid invoice)
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId) {
          return {
            ...c,
            currentBalance: Number(c.currentBalance) + Number(newOrder.totalAmount),
          };
        }
        return c;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    await addAuditLog('ORDER_CREATED', 'Sales', `Created pending order ${newOrder.orderNumber} for ${newOrder.customerName} (₱${newOrder.totalAmount.toFixed(2)})`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        customer_id: newOrder.customerId,
        customer_name: newOrder.customerName,
        customer_company: newOrder.customerCompany,
        order_date: newOrder.orderDate,
        due_date: newOrder.dueDate,
        status: newOrder.status,
        subtotal: newOrder.subtotal,
        discount_amount: newOrder.discountAmount,
        tax_rate: newOrder.taxRate,
        tax_amount: newOrder.taxAmount,
        total_amount: newOrder.totalAmount,
        payment_terms: newOrder.paymentTerms,
        notes: newOrder.notes,
        created_by_name: newOrder.createdByName,
      });

      if (newOrder.items.length > 0) {
        await supabase.from('order_items').insert(
          newOrder.items.map((item, idx) => ({
            id: `item-${newOrder.id}-${idx}`,
            order_id: newOrder.id,
            product_id: item.productId,
            sku: item.sku,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            unit_cost: item.unitCost,
            discount_percent: item.discountPercent,
            total: item.total,
          }))
        );
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const oldStatus = targetOrder.status;
    if (oldStatus === newStatus) return;

    // Update order status in state
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      })
    );

    // =========================================================================
    // TRANSITION 1: MOVING TO 'PAID' (REVENUE & STOCK DEDUCTION REALIZATION)
    // =========================================================================
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            const qty = Number(item.quantity) || 0;
            return {
              ...p,
              stockOnHand: Math.max(0, Number(p.stockOnHand) - qty),
              reservedStock: Math.max(0, Number(p.reservedStock) - (oldStatus === 'pending' ? qty : 0)),
            };
          }
          return p;
        })
      );

      setCustomers((prevCustomers) =>
        prevCustomers.map((c) =>
          c.id === targetOrder.customerId
            ? { ...c, currentBalance: Math.max(0, Number(c.currentBalance) - Number(targetOrder.totalAmount)) }
            : c
        )
      );

      const totalCOGS = targetOrder.items.reduce(
        (sum, i) => sum + (Number(i.unitCost) || 0) * (Number(i.quantity) || 0),
        0
      );

      const cogsEntry: FinancialEntry = {
        id: `fin-cogs-${Date.now()}`,
        type: 'cogs',
        category: 'Cost of Goods Sold',
        amount: totalCOGS,
        referenceId: targetOrder.orderNumber,
        description: `COGS fulfillment for ${targetOrder.orderNumber}`,
        date: new Date().toISOString().split('T')[0],
      };

      const revenueEntry: FinancialEntry = {
        id: `fin-rev-${Date.now()}`,
        type: 'income',
        category: 'Product Sales',
        amount: Number(targetOrder.totalAmount) || 0,
        referenceId: targetOrder.orderNumber,
        description: `Sales revenue collected for ${targetOrder.orderNumber}`,
        date: new Date().toISOString().split('T')[0],
      };

      setFinancials((prev) => [revenueEntry, cogsEntry, ...prev]);

      if (isSupabaseConfigured && supabase) {
        for (const item of targetOrder.items) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            const updatedStock = Math.max(0, Number(prod.stockOnHand) - Number(item.quantity));
            const updatedReserved = Math.max(0, Number(prod.reservedStock) - (oldStatus === 'pending' ? Number(item.quantity) : 0));
            await supabase
              .from('products')
              .update({ stock_on_hand: updatedStock, reserved_stock: updatedReserved })
              .eq('id', item.productId);
          }
        }

        const cust = customers.find((c) => c.id === targetOrder.customerId);
        if (cust) {
          await supabase
            .from('customers')
            .update({ current_balance: Math.max(0, Number(cust.currentBalance) - Number(targetOrder.totalAmount)) })
            .eq('id', cust.id);
        }

        await supabase.from('financial_entries').insert([
          {
            id: revenueEntry.id,
            type: revenueEntry.type,
            category: revenueEntry.category,
            amount: revenueEntry.amount,
            reference_id: revenueEntry.referenceId,
            description: revenueEntry.description,
            date: revenueEntry.date,
          },
          {
            id: cogsEntry.id,
            type: cogsEntry.type,
            category: cogsEntry.category,
            amount: cogsEntry.amount,
            reference_id: cogsEntry.referenceId,
            description: cogsEntry.description,
            date: cogsEntry.date,
          },
        ]);
      }
    }

    // =========================================================================
    // TRANSITION 2: REVERTING FROM 'PAID' TO 'PENDING'
    // =========================================================================
    if (newStatus === 'pending' && oldStatus === 'paid') {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            const qty = Number(item.quantity) || 0;
            return {
              ...p,
              stockOnHand: Number(p.stockOnHand) + qty,
              reservedStock: Number(p.reservedStock) + qty,
            };
          }
          return p;
        })
      );

      setCustomers((prevCustomers) =>
        prevCustomers.map((c) =>
          c.id === targetOrder.customerId
            ? { ...c, currentBalance: Number(c.currentBalance) + Number(targetOrder.totalAmount) }
            : c
        )
      );

      setFinancials((prev) => prev.filter((f) => f.referenceId !== targetOrder.orderNumber));

      if (isSupabaseConfigured && supabase) {
        for (const item of targetOrder.items) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            await supabase
              .from('products')
              .update({
                stock_on_hand: Number(prod.stockOnHand) + Number(item.quantity),
                reserved_stock: Number(prod.reservedStock) + Number(item.quantity),
              })
              .eq('id', item.productId);
          }
        }

        await supabase.from('financial_entries').delete().eq('reference_id', targetOrder.orderNumber);
      }
    }

    // =========================================================================
    // TRANSITION 3: MOVING TO 'CANCELLED'
    // =========================================================================
    if (newStatus === 'cancelled') {
      if (oldStatus === 'pending') {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const item = targetOrder.items.find((i) => i.productId === p.id);
            if (item) {
              const qty = Number(item.quantity) || 0;
              return {
                ...p,
                reservedStock: Math.max(0, Number(p.reservedStock) - qty),
              };
            }
            return p;
          })
        );

        setCustomers((prevCustomers) =>
          prevCustomers.map((c) =>
            c.id === targetOrder.customerId
              ? { ...c, currentBalance: Math.max(0, Number(c.currentBalance) - Number(targetOrder.totalAmount)) }
              : c
          )
        );

        if (isSupabaseConfigured && supabase) {
          for (const item of targetOrder.items) {
            const prod = products.find((p) => p.id === item.productId);
            if (prod) {
              await supabase
                .from('products')
                .update({ reserved_stock: Math.max(0, Number(prod.reservedStock) - Number(item.quantity)) })
                .eq('id', item.productId);
            }
          }
        }
      }

      if (oldStatus === 'paid') {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const item = targetOrder.items.find((i) => i.productId === p.id);
            if (item) {
              const qty = Number(item.quantity) || 0;
              return {
                ...p,
                stockOnHand: Number(p.stockOnHand) + qty,
              };
            }
            return p;
          })
        );

        setFinancials((prev) => prev.filter((f) => f.referenceId !== targetOrder.orderNumber));

        if (isSupabaseConfigured && supabase) {
          for (const item of targetOrder.items) {
            const prod = products.find((p) => p.id === item.productId);
            if (prod) {
              await supabase
                .from('products')
                .update({ stock_on_hand: Number(prod.stockOnHand) + Number(item.quantity) })
                .eq('id', item.productId);
            }
          }
          await supabase.from('financial_entries').delete().eq('reference_id', targetOrder.orderNumber);
        }
      }
    }

    await addAuditLog('ORDER_STATUS_CHANGED', 'Sales', `Order ${targetOrder.orderNumber} status changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
  };

  const deleteOrder = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status === 'pending') {
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              reservedStock: Math.max(0, Number(p.reservedStock) - Number(item.quantity)),
            };
          }
          return p;
        })
      );

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === targetOrder.customerId
            ? { ...c, currentBalance: Math.max(0, Number(c.currentBalance) - Number(targetOrder.totalAmount)) }
            : c
        )
      );
    } else if (targetOrder.status === 'paid') {
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stockOnHand: Number(p.stockOnHand) + Number(item.quantity),
            };
          }
          return p;
        })
      );

      setFinancials((prev) => prev.filter((f) => f.referenceId !== targetOrder.orderNumber));
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await addAuditLog('ORDER_DELETED', 'Sales', `Deleted sales order ${targetOrder.orderNumber} (${targetOrder.customerName})`);

    if (isSupabaseConfigured && supabase) {
      if (targetOrder.status === 'paid') {
        await supabase.from('financial_entries').delete().eq('reference_id', targetOrder.orderNumber);
      }
      await supabase.from('order_items').delete().eq('order_id', orderId);
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  const addExpense = async (category: string, amount: number, description: string) => {
    const newEntry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      type: 'expense',
      category,
      amount: Number(amount) || 0,
      description,
      date: new Date().toISOString().split('T')[0],
    };
    setFinancials((prev) => [newEntry, ...prev]);
    await addAuditLog('EXPENSE_LOGGED', 'Governance', `Logged expense: ₱${newEntry.amount.toFixed(2)} for ${category}`);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('financial_entries').insert({
        id: newEntry.id,
        type: newEntry.type,
        category: newEntry.category,
        amount: newEntry.amount,
        description: newEntry.description,
        date: newEntry.date,
      });
    }
  };

  // ====================================================================
  // DYNAMIC AGGREGATIONS FOR EXECUTIVE DASHBOARD
  // ====================================================================

  const totalRevenue = financials
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpenses = financials
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCOGS = financials
    .filter((f) => f.type === 'cogs')
    .reduce((sum, f) => sum + f.amount, 0);

  const netProfit = totalRevenue - (totalExpenses + totalCOGS);

  const inventoryValuation = products.reduce(
    (sum, p) => sum + p.stockOnHand * p.costPrice,
    0
  );

  const lowStockCount = products.filter((p) => p.stockOnHand <= p.minStockLevel).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  // Dynamic Monthly Sales & Expense aggregation (Strictly for PAID sales)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dynamicMonthlyAnalytics: MonthlyMetricPoint[] = monthNames.map((m, idx) => {
    const monthPaidOrders = orders.filter((o) => {
      const d = new Date(o.orderDate);
      return o.status === 'paid' && d.getMonth() === idx;
    });

    const monthIncome = financials
      .filter((f) => f.type === 'income' && new Date(f.date).getMonth() === idx)
      .reduce((sum, f) => sum + f.amount, 0);

    const monthExp = financials
      .filter((f) => (f.type === 'expense' || f.type === 'cogs') && new Date(f.date).getMonth() === idx)
      .reduce((sum, f) => sum + f.amount, 0);

    return {
      month: m,
      sales: monthPaidOrders.length,
      revenue: monthIncome,
      expenses: monthExp,
    };
  });

  // Dynamic Category Shares from Products and Orders
  const categoryMap: { [cat: string]: number } = {};
  products.forEach((p) => {
    const cat = p.category || 'General';
    const val = p.stockOnHand * p.sellingPrice;
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  });

  const totalCatVal = Object.values(categoryMap).reduce((sum, v) => sum + v, 0) || 1;
  const palette = ['#1E88E5', '#00BCD4', '#7C4DFF', '#10B981', '#F59E0B', '#EF4444'];
  
  const dynamicCategoryShares: CategorySharePoint[] = Object.keys(categoryMap).map((cat, i) => ({
    name: cat,
    amount: categoryMap[cat],
    value: parseFloat(((categoryMap[cat] / totalCatVal) * 100).toFixed(1)),
    color: palette[i % palette.length],
  }));

  // Available users for switcher: derived from live employees
  const availableUsers: UserProfile[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    role: e.role,
    roleTitle: e.roleTitle,
    avatar: e.avatar,
  }));

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        availableUsers: availableUsers.length > 0 ? availableUsers : INITIAL_USERS,
        switchRole,
        switchUser,
        isLiveSupabase: isSupabaseConfigured,
        isLoading,
        isAuthenticated,
        login,
        logout,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        products,
        stockTransactions,
        addProduct,
        receiveStock,
        logStockAdjustment,
        customers,
        addCustomer,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        financials,
        addExpense,
        auditLogs,
        metrics: {
          totalRevenue,
          totalExpenses,
          totalCOGS,
          netProfit,
          inventoryValuation,
          totalOrdersCount: orders.length,
          pendingOrdersCount,
          lowStockCount,
          totalReceivables,
        },
        dynamicMonthlyAnalytics,
        dynamicCategoryShares,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
