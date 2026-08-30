# Project Memory & Codebase Condition

**Last Updated:** August 30, 2026  
**Project:** Mini ERP (Governance, Sales Management, Inventory & Warehouse)  
**Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI Primitives, Supabase PostgreSQL, Recharts

---

## 1. Executive Summary & Architecture

The **Mini ERP** is a modular enterprise resource planning portal built for small-to-medium enterprises. It implements strict **Role-Based Access Control (RBAC)** across three primary business personas:

1. **Governance & Administration (`admin`)**: Executive dashboards, P&L financial ledger, security audit trail, and employee account provisioning.
2. **Sales Operations (`sales`)**: Commercial pipeline analytics, order generation, customer CRM, invoicing, and read-only warehouse stock visibility.
3. **Inventory & Warehouse Operations (`inventory`)**: Inflow/outflow stock movement analytics, SKU catalog management, PO delivery receiving, damage adjustments, stock movement ledger, and read-only order fulfillment packing slips.

---

## 2. Core Business Logic & Accounting Rules

1. **Strict Revenue Recognition**:
   * Income and Cost of Goods Sold (COGS) are recorded **only when an order status is `paid`**.
   * `pending` and `cancelled` orders record **₱0.00 revenue** and **₱0.00 COGS** in the Executive and Sales dashboards.
   * Reverting an order from `paid` to `pending` or `cancelled` automatically deletes the accounting entries from Supabase and restores physical stock.

2. **Stock Reservation & Fulfillment Lifecycle**:
   * Creating a sales order increases `reserved_stock` on line items without immediately deducting physical stock.
   * Marking an order `paid` permanently deducts `stock_on_hand` and clears `reserved_stock`.
   * Deleting or cancelling an order releases `reserved_stock` back to available inventory.

3. **Route Guard Rails & Session Security**:
   * Located in [src/components/layout/app-shell.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/layout/app-shell.tsx).
   * Unauthenticated requests to protected routes redirect immediately to `/login?error=unauthenticated`.
   * Cross-role unauthorized access attempts (e.g. Sales typing `/governance` or Inventory typing `/sales/new-order`) terminate the session and redirect to `/login?error=unauthorized`.
   * Read-only cross-role permissions:
     * **Sales** can view `/inventory` (Stock Catalog) in read-only mode (Add SKU and PO Receiving hidden).
     * **Inventory** can view `/sales/orders` (Orders) in read-only mode (Status dropdown and Delete hidden, Packing Slip generator active).

---

## 3. Role-Based Navigation & Route Map

| Role | Permitted Routes | Sidebar Navigation |
| :--- | :--- | :--- |
| **Admin (`admin`)** | Full System Access | **Governance**: Dashboard, Financials, Audit, Team<br>**Sales**: Orders & Invoices, Create Order, Customers<br>**Inventory**: Catalog, Stock-In, Adjustments, Ledger |
| **Sales (`sales`)** | `/sales/*`, `/inventory` (Read-only) | **Sales Management**: Sales Dashboard, Orders & Invoices, Create New Order, Customer Directory, Stock Availability |
| **Inventory (`inventory`)** | `/inventory/*`, `/sales/orders` (Read-only) | **Inventory & Warehouse**: Warehouse Dashboard, Master Catalog, Stock In, Adjustments, Movement Ledger, Orders & Packing |
| **Public** | `/login` | Standalone 2-field dynamic sign-in portal |

---

## 4. Database Relational Schema ([supabase/schema.sql](file:///c:/Users/ADMIN/Desktop/Folder1/erp/supabase/schema.sql))

1. **`employees`**:
   * `id`, `name`, `email` (UNIQUE), `password`, `role` (`'admin' | 'sales' | 'inventory'`), `role_title`, `status`, `avatar_url`, `created_at`.
2. **`products`**:
   * `id`, `sku`, `name`, `category`, `unit`, `cost_price`, `selling_price`, `stock_on_hand`, `reserved_stock`, `min_stock_level`, `location`, `description`.
3. **`customers`**:
   * `id`, `name`, `company`, `email`, `phone`, `address`, `credit_limit`, `current_balance`, `payment_terms`, `created_at`.
4. **`orders`**:
   * `id`, `order_number`, `customer_id`, `customer_name`, `customer_company`, `order_date`, `due_date`, `status` (`'pending' | 'paid' | 'cancelled'`), `subtotal`, `discount_amount`, `tax_rate`, `tax_amount`, `total_amount`, `payment_terms`, `notes`, `created_by_name`.
5. **`order_items`**:
   * `id`, `order_id`, `product_id`, `sku`, `product_name`, `quantity`, `unit_price`, `unit_cost`, `discount_percent`, `total`.
6. **`stock_transactions`**:
   * `id`, `type` (`'stock_in' | 'sale_deduction' | 'adjustment' | 'damage'`), `product_id`, `sku`, `product_name`, `quantity_change`, `previous_stock`, `new_stock`, `reason`, `reference_doc`, `performed_by`, `date`.
7. **`financial_entries`**:
   * `id`, `type` (`'income' | 'expense' | 'cogs'`), `category`, `amount`, `reference_id`, `description`, `date`.
8. **`audit_logs`**:
   * `id`, `action`, `module`, `details`, `user_name`, `user_role`, `timestamp`.

---

## 5. UI Components & Design System

* **Theme**: AdminPro Design System (`agent/DESIGN.md`) with Slate Dark Sidebar (`#1B222C`), Clean Canvas (`#F4F7FB`), and Blue Brand Highlights (`#1E88E5`).
* **Zero-Shift Portaled Controls**: Radix UI `DropdownMenuPortal` prevents table row height shifting and overflow clipping.
* **Loading & Skeleton Shimmering**:
  * [src/components/ui/skeleton.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/ui/skeleton.tsx): Reusable Tailwind CSS pulse primitives.
  * [src/components/ui/dashboard-skeleton.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/erp/src/components/ui/dashboard-skeleton.tsx): KPI ribbons, chart boxes, and table skeleton placeholders.
  * Animated spinning loader (`Loader2`) on `/login` sign-in action with input locking.
