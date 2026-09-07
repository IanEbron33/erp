# Project Memory & Codebase Condition

**Last Updated:** August 30, 2026  
**Project:** Mini ERP (Governance, Sales Management, Inventory & Warehouse)  
**Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI Primitives, Supabase PostgreSQL, Recharts

---

## 1. Executive Summary & Architecture

The **Mini ERP** is a modular enterprise resource planning portal built for small-to-medium enterprises. It implements strict **Role-Based Access Control (RBAC)** across three primary business personas:

1. **Governance & Administration (`admin`)**: Executive financial dashboard, P&L ledger, security audit trail, and employee account provisioning (`/governance/team`).
2. **Sales Operations (`sales`)**: Commercial performance dashboard (`/sales`), order and invoice generation (`/sales/orders`), customer CRM (`/sales/customers`), and read-only warehouse stock visibility (`/inventory`).
3. **Inventory & Warehouse Operations (`inventory`)**: Warehouse operations dashboard (`/inventory`), master SKU catalog (`/inventory/catalog`), PO delivery receiving (`/inventory/stock-in`), stock adjustments (`/inventory/adjustments`), movement ledger (`/inventory/transactions`), and read-only sales order fulfillment packing slips (`/sales/orders`).

---

## 2. Authentication, Session Security & Live Database Sync

1. **Strict Login-First Guard**:
   * `isAuthenticated` is initialized to `false` by default.
   * Visiting `/` or any internal route on localhost or deployed instances (`erp-bsit.vercel.app`) without an active session automatically redirects to `/login`.
   * [AppShell](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/layout/app-shell.tsx) prevents rendering the internal layout or navigation sidebar for unauthenticated visitors.

2. **100% Live Supabase Authentication**:
   * All hardcoded fallback profiles (`Eleanor Vance`, `Marcus Sterling`, `Darius Thorne`) have been removed.
   * Staff directory and authentication strictly query live accounts from the Supabase `employees` table.
   * Deleting an account in Supabase immediately revokes access and removes them from the application.

3. **Dynamic 2-Field Login & Route Guard Rails**:
   * Sign-in requires **Gmail/Email** and **Password** with an Eye toggle.
   * Features an animated `Loader2` spinner and input-locking during active authentication.
   * Unauthorized cross-role URL entries (e.g. Sales typing `/governance` or Inventory typing `/sales/new-order`) terminate the session and bounce to `/login?error=unauthorized` with an amber security alert.

---

## 3. Core Business Logic & Accounting Rules

1. **Strict Revenue Recognition**:
   * Income and Cost of Goods Sold (COGS) are recorded **only when an order status is `paid`**.
   * `pending` and `cancelled` orders record **₱0.00 revenue** and **₱0.00 COGS** in the Executive and Sales dashboards.
   * Reverting an order from `paid` to `pending` or `cancelled` automatically deletes the accounting entries from Supabase and restores physical stock.

2. **Stock Reservation & Fulfillment Lifecycle**:
   * Creating a sales order increases `reserved_stock` on line items without immediately deducting physical stock.
   * Marking an order `paid` permanently deducts `stock_on_hand` and clears `reserved_stock`.
   * Deleting or cancelling an order releases `reserved_stock` back to available inventory.

3. **Cross-Role Read-Only Permissions**:
   * **Sales Reps** can view the Stock Catalog (`/inventory`) in read-only mode (`+ Add SKU` and `Receive PO Delivery` hidden; calculates `Available to Sell = Stock - Reserved`).
   * **Inventory Clerks** can view Sales Orders (`/sales/orders`) in read-only mode (status switcher and delete hidden; `Packing Slip` viewer active for order picking and fulfillment).

---

## 4. Role-Based Navigation & Route Map

| Role | Permitted Routes | Sidebar Navigation Hierarchy |
| :--- | :--- | :--- |
| **Admin (`admin`)** | Full System Access | **Governance**: Executive Dashboard, Financial Ledger, Audit Trail, Team & User Access<br>**Sales**: Sales Orders & Invoices, Create New Order, Customer Directory<br>**Inventory**: Stock Master Catalog, Stock In, Stock Adjustments, Movement Ledger |
| **Sales (`sales`)** | `/sales/*`, `/inventory` (Read-only) | **Sales Management**: Sales Dashboard, Sales Orders & Invoices, Create New Order, Customer Directory, Stock Availability |
| **Inventory (`inventory`)** | `/inventory/*`, `/sales/orders` (Read-only) | **Inventory & Warehouse**: Warehouse Dashboard, Stock Master Catalog, Stock In, Stock Adjustments, Movement Ledger, Orders & Packing |
| **Public** | `/login` | Standalone 2-field dynamic sign-in portal |

---

## 5. UI Architecture, Shimmer Skeletons & Design Tokens

* **Theme**: AdminPro Design System (`agent/DESIGN.md`) with Slate Dark Sidebar (`#1B222C`), Clean Canvas (`#F4F7FB`), and Blue Brand Highlights (`#1E88E5`).
* **Zero-Shift Portaled Controls**: Radix UI `DropdownMenuPortal` prevents table row height shifting and overflow clipping.
* **Loading & Skeleton Shimmering**:
  * [src/components/ui/skeleton.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/ui/skeleton.tsx): Reusable Tailwind CSS pulse primitives.
  * [src/components/ui/dashboard-skeleton.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/ui/dashboard-skeleton.tsx): Shimmering KPI ribbons, chart boxes, and table skeleton placeholders while Supabase loads.

---

## 6. Database Relational Schema ([supabase/schema.sql](file:///c:/Users/ADMIN/Desktop/Folder1/erp/supabase/schema.sql))

1. **`employees`**: `id`, `name`, `email` (UNIQUE), `password`, `role` (`'admin' | 'sales' | 'inventory'`), `role_title`, `status`, `avatar_url`, `created_at`.
2. **`products`**: `id`, `sku`, `name`, `category`, `unit`, `cost_price`, `selling_price`, `stock_on_hand`, `reserved_stock`, `min_stock_level`, `location`, `description`.
3. **`customers`**: `id`, `name`, `company`, `email`, `phone`, `address`, `credit_limit`, `current_balance`, `payment_terms`, `created_at`.
4. **`orders`**: `id`, `order_number`, `customer_id`, `customer_name`, `customer_company`, `order_date`, `due_date`, `status` (`'pending' | 'paid' | 'cancelled'`), `subtotal`, `discount_amount`, `tax_rate`, `tax_amount`, `total_amount`, `payment_terms`, `notes`, `created_by_name`.
5. **`order_items`**: `id`, `order_id`, `product_id`, `sku`, `product_name`, `quantity`, `unit_price`, `unit_cost`, `discount_percent`, `total`.
6. **`stock_transactions`**: `id`, `type` (`'stock_in' | 'sale_deduction' | 'adjustment' | 'damage'`), `product_id`, `sku`, `product_name`, `quantity_change`, `previous_stock`, `new_stock`, `reason`, `reference_doc`, `performed_by`, `date`.
7. **`financial_entries`**: `id`, `type` (`'income' | 'expense' | 'cogs'`), `category`, `amount`, `reference_id`, `description`, `date`.
8. **`audit_logs`**: `id`, `action`, `module`, `details`, `user_name`, `user_role`, `timestamp`.
