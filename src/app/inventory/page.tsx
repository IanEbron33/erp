'use client';

import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  ArrowDownToLine,
  SlidersHorizontal,
  AlertTriangle,
  Package,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  History,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export default function WarehouseDashboardPage() {
  const { products, stockTransactions, dynamicCategoryShares, metrics, currentUser, isLoading } = useERP();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const isSalesRole = currentUser.role === 'sales';

  const totalUnitsOnHand = products.reduce((sum, p) => sum + p.stockOnHand, 0);

  // Critical Low Stock Products
  const lowStockProducts = products.filter((p) => p.stockOnHand <= p.minStockLevel);

  // Monthly Inflow vs Outflow calculations from real stock transactions
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMovementData = monthNames.map((m, idx) => {
    const monthInflow = stockTransactions
      .filter((tx) => tx.type === 'stock_in' && new Date(tx.date).getMonth() === idx)
      .reduce((sum, tx) => sum + tx.quantityChange, 0);

    const monthOutflow = stockTransactions
      .filter(
        (tx) =>
          (tx.type === 'damage' || tx.type === 'sale_deduction' || (tx.type === 'adjustment' && tx.quantityChange < 0)) &&
          new Date(tx.date).getMonth() === idx
      )
      .reduce((sum, tx) => sum + Math.abs(tx.quantityChange), 0);

    return {
      month: m,
      inflow: monthInflow,
      outflow: monthOutflow,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Warehouse Operations</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Inventory Control Center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Warehouse Operations Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/inventory/catalog">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <Boxes className="h-4 w-4 text-[#1E88E5]" />
              Master Catalog
            </Button>
          </Link>
          <Link href="/inventory/stock-in">
            <Button size="sm" className="text-xs font-semibold shadow-md shadow-blue-500/20">
              <ArrowDownToLine className="h-4 w-4" />
              Receive PO Delivery
            </Button>
          </Link>
          <Link href="/inventory/adjustments">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-[#1E88E5]" />
              Stock Adjustment
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Warehouse KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Physical Units On Hand"
          value={`${totalUnitsOnHand} pcs`}
          subtitle="Total items in warehouse"
          accentColor="#10B981"
          icon={<Package className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Total Inventory Asset Value"
          value={formatCurrency(metrics.inventoryValuation)}
          subtitle="Valuation at cost price"
          accentColor="#00BCD4"
          icon={<ShieldCheck className="h-6 w-6 text-[#00BCD4]" />}
        />
        <KPICard
          label="Low Stock Safety Warnings"
          value={lowStockProducts.length}
          subtitle="SKUs at or below threshold"
          accentColor="#F59E0B"
          icon={<AlertTriangle className="h-6 w-6 text-[#F59E0B]" />}
        />
        <KPICard
          label="Active Catalog SKUs"
          value={products.length}
          subtitle="Product variants registered"
          accentColor="#1E88E5"
          icon={<Boxes className="h-6 w-6 text-[#1E88E5]" />}
        />
      </div>

      {/* Visual Analytics Grid: Inflow/Outflow + Asset by Category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Monthly Movement Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Stock Movement (Inflow vs. Outflow)
              </h3>
              <p className="text-xs text-slate-500">
                Units received from PO deliveries vs. units dispatched or adjusted
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-600">Stock Received (Inflow)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <span className="text-slate-600">Dispatched / Loss (Outflow)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMovementData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} pcs`}
                />
                <Tooltip
                  formatter={(val: any) => `${val} units`}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="inflow" name="Inflow (Received)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Outflow (Dispatched)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Category Asset Breakdown Donut */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Inventory Valuation Share</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              By Category
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicCategoryShares}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dynamicCategoryShares.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${formatCurrency(item.payload.amount)})`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {dynamicCategoryShares.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Reorder Warnings & Low Stock Hub */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Critical Reorder Alerts & Safety Stock Warnings
            </h3>
            <p className="text-xs text-slate-500">
              SKUs that have dropped to or below minimum reorder points
            </p>
          </div>
          <Link href="/inventory/transactions">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
              <History className="h-3.5 w-3.5 text-[#1E88E5]" />
              <span>Full Movement Ledger</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU & Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Physical Stock</TableHead>
              <TableHead>Safety Minimum</TableHead>
              <TableHead>Warehouse Bay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-400">
                  <CheckCircle2 className="h-7 w-7 mx-auto text-emerald-500 mb-1.5" />
                  <p className="font-bold text-slate-700">All inventory levels are optimal!</p>
                  <p className="text-[11px] text-slate-400">No items are currently below safety reorder points.</p>
                </TableCell>
              </TableRow>
            ) : (
              lowStockProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{p.category}</TableCell>
                  <TableCell className="font-bold text-rose-600 text-xs">
                    {p.stockOnHand} {p.unit}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">
                    Min {p.minStockLevel} {p.unit}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {p.location}
                  </TableCell>
                  <TableCell>
                    {p.stockOnHand === 0 ? (
                      <Badge variant="danger">Out of Stock</Badge>
                    ) : (
                      <Badge variant="warning">Low Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/inventory/stock-in`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 bg-white hover:bg-slate-50 border border-slate-200 font-semibold"
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5 text-[#1E88E5]" />
                        Restock Delivery
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
