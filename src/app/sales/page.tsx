'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  PackagePlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Boxes,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export default function SalesDashboardPage() {
  const { orders, customers, products, financials, isLoading } = useERP();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Dynamic Commercial Metrics
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPipelinePending = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageOrderValue = paidOrders.length > 0 ? totalPaidRevenue / paidOrders.length : 0;
  const activeCustomersCount = customers.length;

  // Monthly Sales Pipeline vs Closed Revenue (Dynamic from Live Orders)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();

  const monthlySalesChartData = monthNames.map((m, idx) => {
    const monthPaid = orders
      .filter((o) => o.status === 'paid' && new Date(o.orderDate).getMonth() === idx)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthPending = orders
      .filter((o) => o.status === 'pending' && new Date(o.orderDate).getMonth() === idx)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      month: m,
      paidRevenue: monthPaid,
      pendingPipeline: monthPending,
    };
  });

  // Top Performing Products calculation
  const productSalesMap: { [prodId: string]: { name: string; sku: string; unitsSold: number; revenue: number } } = {};
  paidOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          sku: item.sku,
          unitsSold: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].unitsSold += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Customers with Balances
  const topReceivableClients = [...customers]
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .filter((c) => c.currentBalance > 0)
    .slice(0, 3);

  // Recent 5 Orders
  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Commercial Operations</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Sales Executive Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Sales Performance & Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/sales/customers">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <Users className="h-4 w-4" />
              Customer Directory
            </Button>
          </Link>
          <Link href="/sales/new-order">
            <Button size="sm" className="text-xs font-semibold shadow-md shadow-blue-500/20">
              <PackagePlus className="h-4 w-4" />
              Create Sales Order
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Commercial KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Closed / Paid Revenue"
          value={formatCurrency(totalPaidRevenue)}
          subtitle={`${paidOrders.length} orders settled`}
          accentColor="#10B981"
          icon={<DollarSign className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Pending Pipeline Value"
          value={formatCurrency(totalPipelinePending)}
          subtitle={`${pendingOrders.length} orders awaiting collection`}
          accentColor="#F59E0B"
          icon={<Clock className="h-6 w-6 text-[#F59E0B]" />}
        />
        <KPICard
          label="Average Order Value (AOV)"
          value={formatCurrency(averageOrderValue)}
          subtitle="Revenue per settled deal"
          accentColor="#1E88E5"
          icon={<TrendingUp className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Active Client Accounts"
          value={activeCustomersCount}
          subtitle="Registered customer base"
          accentColor="#7C4DFF"
          icon={<Users className="h-6 w-6 text-[#7C4DFF]" />}
        />
      </div>

      {/* Visual Analytics Grid: Chart + Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Monthly Sales Performance Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Closed Revenue vs. Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of collected revenue vs. pending pipeline deals
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-600">Paid Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-slate-600">Pending Pipeline</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="paidColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="paidRevenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#paidColor)"
                  name="Paid Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="pendingPipeline"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#pendingColor)"
                  name="Pending Pipeline"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top Performing Products Leaderboard */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#1E88E5]" />
              Top Selling SKUs
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              By Revenue
            </span>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Boxes className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>No fulfilled orders yet.</p>
                <p className="text-[11px] text-slate-400">Mark orders as Paid to rank items.</p>
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={prod.sku}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E88E5] text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">{prod.unitsSold} units sold</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 shrink-0 ml-2">
                    {formatCurrency(prod.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders & Receivables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Sales Orders</h3>
              <p className="text-xs text-slate-500">Latest customer orders created in the system</p>
            </div>
            <Link href="/sales/orders">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                <span>View All Orders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No sales orders recorded. Click <strong>Create Sales Order</strong> to begin!
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-slate-900 font-mono text-xs">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-slate-900 text-xs">{order.customerCompany}</p>
                      <p className="text-[10px] text-slate-400">{order.customerName}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-xs">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'paid'
                            ? 'success'
                            : order.status === 'pending'
                            ? 'warning'
                            : 'danger'
                        }
                        className="capitalize text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right 1 Col: Top Outstanding Receivables */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Unpaid Receivables</h3>
            <Badge variant="warning" className="text-[10px]">
              A/R Balances
            </Badge>
          </div>

          <div className="space-y-3">
            {topReceivableClients.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/60 mb-2" />
                <p>All client accounts are settled!</p>
                <p className="text-[10px] text-slate-400">No overdue unpaid balances.</p>
              </div>
            ) : (
              topReceivableClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{client.company || client.name}</p>
                    <span className="text-xs font-bold text-amber-800">
                      {formatCurrency(client.currentBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Terms: {client.paymentTerms}</span>
                    <span>Credit Limit: {formatCurrency(client.creditLimit)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
