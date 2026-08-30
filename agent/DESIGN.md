# Mini ERP — Design System & UI Theme Specifications

> **Source Reference**: AdminPro Enterprise Dashboard & Analytical UI Architecture  
> **Target Framework**: Next.js, React, Tailwind CSS, shadcn/ui, Lucide Icons

---

## 1. Design Philosophy & Aesthetic Identity

* **Theme Structure**: High-contrast hybrid theme featuring a **Dark Slate/Navy Sidebar** (`#1E2530`) paired with an **Ultra-Crisp White Topbar & Surface Layer** (`#FFFFFF`) on a **Cool Slate-Blue Canvas** (`#F4F7FB`).
* **Visual Signature**:
  * Clean, razor-sharp metric cards with vertical indicator accents (`#2563EB` / `#1E88E5`).
  * Circular fine-line icon badges with soft monochromatic blue strokes.
  * Solid vibrant primary statistic summary ribbons (`#1E88E5` / `#2563EB`).
  * Highly legible corporate typography with generous whitespace and distinct data hierarchies.
  * No emoji icons — all icons are strictly standard Lucide React icons.

---

## 2. Color Palette & Design Tokens

### 2.1 Base & Layout Surfaces
| Token Name | Hex Code | HSL Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#F4F7FB` | `214, 45%, 97%` | Main app background canvas |
| `--surface` | `#FFFFFF` | `0, 0%, 100%` | Cards, modals, data tables, top navbar |
| `--sidebar-bg` | `#1B222C` | `216, 24%, 14%` | Left navigation sidebar background |
| `--sidebar-hover` | `#252E3B` | `216, 23%, 19%` | Sidebar menu item hover state |
| `--sidebar-active` | `#2C3646` | `217, 23%, 23%` | Active sidebar item background |
| `--sidebar-text` | `#94A3B8` | `215, 20%, 65%` | Inactive sidebar link text |
| `--sidebar-text-active` | `#FFFFFF` | `0, 0%, 100%` | Active link text & headings |
| `--border-subtle` | `#E2E8F0` | `214, 32%, 91%` | Card borders, table dividers, inputs |

### 2.2 Brand & Functional Accents
| Token Name | Hex Code | HSL Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | `#1E88E5` | `208, 79%, 51%` | Primary brand blue, buttons, active highlights |
| `--primary-hover` | `#1976D2` | `211, 79%, 46%` | Primary button hover / focus ring |
| `--primary-deep` | `#1565C0` | `214, 80%, 42%` | Chart line strokes, headers, stat banners |
| `--secondary-cyan` | `#00BCD4` | `187, 100%, 42%` | Secondary metrics, radial charts, badges |
| `--accent-purple` | `#7C4DFF` | `256, 100%, 65%` | Analytics charts, category tags |
| `--success` | `#10B981` | `160, 84%, 39%` | Completed orders, stock received, positive profit |
| `--warning` | `#F59E0B` | `38, 92%, 50%` | Pending orders, low stock warning |
| `--destructive` | `#EF4444` | `0, 84%, 60%` | Cancelled orders, damaged stock, write-offs |

### 2.3 Typography & Text Hierarchy
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#1E293B` | Main headers, large numerical metrics, table data |
| `--text-secondary` | `#64748B` | Subheaders, card labels, breadcrumbs, helper text |
| `--text-muted` | `#94A3B8` | Disabled states, timestamps, placeholder text |

---

## 3. Typography Scale & Fonts

* **Primary Font Family**: `Inter`, `Plus Jakarta Sans`, or `Roboto`, sans-serif.
* **Heading 1 (`h1` / Page Title)**: `text-2xl font-bold text-[#1E293B] tracking-tight`
* **Heading 2 (`h2` / Section Title)**: `text-lg font-semibold text-[#1E293B]`
* **KPI Metric Number**: `text-2xl md:text-3xl font-bold text-[#1E293B] tracking-tight`
* **KPI Metric Label**: `text-xs font-medium text-[#64748B] uppercase tracking-wider`
* **Body / Table Content**: `text-sm font-normal text-[#334155]`
* **Badges / Tags**: `text-xs font-semibold px-2.5 py-0.5 rounded-full`

---

## 4. Component Design Specifications (Custom shadcn/ui)

### 4.1 Navigation Sidebar (Dark Slate)
* **Width**: `w-64` (desktop), collapsible to `w-20` on compact view.
* **Header Profile Block**:
  * Rounded avatar (`w-10 h-10 ring-2 ring-white/10`) with user name and role badge (Admin / Sales / Inventory).
* **Section Labels**:
  * Uppercase, tracking-widest, `text-[11px] font-semibold text-[#64748B] px-4 py-2 mt-4`.
* **Nav Links**:
  * Inactive: `flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#252E3B] rounded-lg transition-all`.
  * Active: `flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white bg-[#2563EB] shadow-md shadow-blue-500/20 rounded-lg`.
  * Badge indicator: `ml-auto bg-[#3B82F6] text-white text-[11px] font-bold px-2 py-0.5 rounded-full`.

### 4.2 Top Header Navbar
* **Height**: `h-16`, background `#FFFFFF`, border-b `border-slate-200/80`, sticky top.
* **Left Section**: Brand logo / Title with subtle toggle icon.
* **Right Section**:
  * Search trigger button (`rounded-full p-2 hover:bg-slate-100 text-slate-500`).
  * Notification & message action buttons with red dot ping indicators.
  * User profile dropdown with role identifier badge.

### 4.3 KPI / Metric Cards (AdminPro Style)
* **Container**: `bg-white rounded-xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex items-center justify-between`.
* **Accent Indicator**: `w-1.5 h-10 bg-[#1E88E5] rounded-full absolute left-0 top-1/2 -translate-y-1/2`.
* **Left Content**:
  * Top label: `text-xs font-medium uppercase text-slate-500 tracking-wide`.
  * Bottom value: `text-2xl font-bold text-slate-900 mt-1`.
* **Right Icon Graphic**:
  * Fine-line outline Lucide icon inside a circular container with soft blue border: `w-12 h-12 rounded-full border border-blue-200/60 bg-blue-50/50 flex items-center justify-center text-blue-600`.

### 4.4 Analytical Card & Stat Ribbon
* **Header**:
  * Title with vertical accent indicator: `flex items-center gap-2 font-semibold text-slate-800 text-base`.
  * Right filter: Clean select dropdown with rounded border (`rounded-lg border-slate-200 text-xs`).
* **Statistic Summary Ribbon (Blue Banner)**:
  * Full-width or top strip: `bg-[#1E88E5] text-white rounded-t-lg px-6 py-3 flex items-center justify-between`.
  * Items: `Total Sales`, `This Month`, `This Week` with prominent white bold figures.
* **Chart Canvas**:
  * Clean background, responsive Recharts / Chart.js container.
  * Primary stroke: `#1E88E5` (width: 3), smooth curve, subtle area gradient or clean tick marks.

### 4.5 Data Tables (Orders, Customers, Inventory)
* **Card Wrapper**: White background, `rounded-xl border border-slate-200/80 shadow-sm`.
* **Table Header (`<thead>`)**: `bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200`.
* **Table Row (`<tr>`)**: `hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0`.
* **Table Cell (`<td>`)**: `py-3.5 px-4 text-sm text-slate-700`.

### 4.6 Buttons & Interactive Elements (Polished, Non-Default)
* **Primary Button**:
  * `bg-[#1E88E5] hover:bg-[#1976D2] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2`.
* **Secondary / Outline Button**:
  * `bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg shadow-xs transition-all`.
* **Destructive Button**:
  * `bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-medium text-sm px-4 py-2 rounded-lg transition-all`.

### 4.7 Modals, Dialogs & Alerts
* **Dialog Overlay**: `bg-slate-950/40 backdrop-blur-xs`.
* **Dialog Content**: `bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-lg`.
* **Dialog Header**: Bold slate-900 title with a subtle accent bar and clear close icon button.
* **Alerts**:
  * Info: Soft blue background (`bg-blue-50 border-l-4 border-[#1E88E5] text-blue-900 p-4 rounded-r-lg`).
  * Warning: Soft amber background (`bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg`).
  * Success: Soft emerald background (`bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 p-4 rounded-r-lg`).

---

## 5. Role-Specific Module Themes

| Role | Primary Color Accent | Key Visual Highlights |
| :--- | :--- | :--- |
| **1. Governance & Financials (Admin)** | `#1E88E5` (Royal Blue) & `#1565C0` | Full P&L charts, blue KPI stat ribbons, financial ledger table, approval badges |
| **2. Sales Representative (Sales Staff)** | `#0284C7` (Sky Blue) & `#00BCD4` | Order pipeline badges (Draft, Confirmed, Delivered), quick-add customer drawers, clean invoice previews |
| **3. Inventory Clerk (Stock)** | `#0D9488` (Teal) & `#F59E0B` | Stock level progress bars, low-stock amber alert badges, receiving PO sheets |

---

## 6. Icons & Asset Guidelines

* **Icon Library**: `lucide-react` strictly.
* **Rule**: Absolutely no raw emoji characters in navigation, buttons, status indicators, or tables.
* **Standard Icon Mappings**:
  * Governance/Financials: `LayoutDashboard`, `TrendingUp`, `DollarSign`, `FileText`, `ShieldCheck`, `Users`
  * Sales: `ShoppingCart`, `PackagePlus`, `UserCheck`, `Receipt`, `CreditCard`, `Send`
  * Inventory: `Boxes`, `Layers`, `ArrowDownToLine`, `ArrowUpFromLine`, `AlertTriangle`, `QrCode`
