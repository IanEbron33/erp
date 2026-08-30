-- ====================================================================
-- MINI ERP POSTGRESQL SCHEMA (SUPABASE)
-- Currency: Philippine Peso (PHP / ₱)
-- ====================================================================

-- 0. EMPLOYEES & USER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT 'password123',
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'inventory')),
    role_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'pcs',
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_on_hand INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 10,
    location TEXT NOT NULL DEFAULT 'General Storage',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_terms TEXT NOT NULL DEFAULT 'Net 30',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SALES ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_company TEXT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.08,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_terms TEXT NOT NULL DEFAULT 'Net 30',
    notes TEXT,
    created_by_name TEXT NOT NULL DEFAULT 'Sales Representative',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SALES ORDER LINE ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. INVENTORY STOCK TRANSACTIONS (AUDIT & RECEPTION)
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'stock_in', 'damage', 'adjustment', 'dispatch'
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    reference_doc TEXT,
    performed_by TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. GENERAL FINANCIAL LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'income', 'expense', 'cogs'
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reference_id TEXT,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. IMMUTABLE GOVERNANCE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    module TEXT NOT NULL, -- 'Governance', 'Sales', 'Inventory'
    details TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for seamless prototype access or enable public policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for stock_transactions" ON public.stock_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for financial_entries" ON public.financial_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Default Initial Employee Accounts
INSERT INTO public.employees (id, name, email, password, role, role_title, status, avatar_url)
VALUES
  ('emp-1', 'Eleanor Vance', 'admin@minierp.io', 'admin123', 'admin', 'Managing Director & Admin', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('emp-2', 'Marcus Sterling', 'sales@minierp.io', 'sales123', 'sales', 'Senior Sales Representative', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
  ('emp-3', 'Darius Thorne', 'inventory@minierp.io', 'inventory123', 'inventory', 'Lead Inventory & Stock Clerk', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (email) DO NOTHING;
