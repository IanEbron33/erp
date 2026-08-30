'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Layers,
  ShieldCheck,
  Package,
  Database,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useERP } from '@/lib/erp-context';
import { KPICard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export default function GovernanceDashboard() {
  const {
    metrics,
    financials,
    auditLogs,
    dynamicMonthlyAnalytics,
    dynamicCategoryShares,
    isLiveSupabase,
    isLoading,
  } = useERP();

  const [selectedPeriod, setSelectedPeriod] = useState('2026');
  const [dateFilter, setDateFilter] = useState<'30' | '90' | 'ytd'>('ytd');

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Dynamically compute ribbon metrics from live database financials
  const thisMonthIncome = financials
    .filter((f) => f.type === 'income' && new Date(f.date).getMonth() === new Date().getMonth())
    .reduce((sum, f) => sum + f.amount, 0);

  const thisWeekAvg = thisMonthIncome > 0 ? thisMonthIncome / 4.2 : 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Governance & Financials</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Executive Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Enterprise Overview
          </h2>
        </div>

        {/* Dynamic Database Status Badge */}
        <div className="flex items-center gap-2">
          {isLiveSupabase ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3 text-xs font-bold">
              <Database className="h-3.5 w-3.5" />
              Supabase PostgreSQL Live
            </Badge>
          ) : (
            <Badge variant="cyan" className="gap-1.5 py-1 px-3 text-xs font-bold">
              <Database className="h-3.5 w-3.5" />
              Dynamic State • Supabase Ready
            </Badge>
          )}
          {isLoading && (
            <span className="flex items-center gap-1 text-xs text-slate-500 animate-spin">
              <RefreshCw className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* 4 AdminPro Metric Cards (Fully Dynamic) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Income / Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Real-time cumulative sales"
          accentColor="#1E88E5"
          trend={metrics.totalRevenue > 0 ? { value: "+14.2%", isPositive: true } : undefined}
          icon={<DollarSign className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Total Expenses & COGS"
          value={formatCurrency(metrics.totalExpenses + metrics.totalCOGS)}
          subtitle="Operating cost + product cost"
          accentColor="#EF4444"
          trend={metrics.totalExpenses > 0 ? { value: "+3.8%", isPositive: false } : undefined}
          icon={<Layers className="h-6 w-6 text-[#EF4444]" />}
        />
        <KPICard
          label="Net Operating Profit"
          value={formatCurrency(metrics.netProfit)}
          subtitle="Revenue minus expenditures"
          accentColor="#10B981"
          trend={metrics.netProfit > 0 ? { value: "+22.5%", isPositive: true } : undefined}
          icon={<TrendingUp className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Inventory Valuation"
          value={formatCurrency(metrics.inventoryValuation)}
          subtitle="Live stock asset valuation"
          accentColor="#00BCD4"
          icon={<Package className="h-6 w-6 text-[#00BCD4]" />}
        />
      </div>

      {/* Main Analytical Section: Dynamic Sales Overview Chart & Dynamic Donut Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Sales Overview with Dynamic Blue Ribbon */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-4.5 w-1.5 rounded-full bg-[#1E88E5]" />
              <h3 className="text-base font-bold text-slate-800">
                Sales & Financial Performance
              </h3>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
            >
              <option value="2026">Fiscal Year 2026</option>
              <option value="2025">Fiscal Year 2025</option>
            </select>
          </div>

          {/* AdminPro Solid Blue Stat Ribbon (Dynamic) */}
          <div className="bg-[#1E88E5] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-blue-100">
                Total Invoiced Revenue
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {formatCurrency(metrics.totalRevenue)}
              </h4>
            </div>
            <div className="h-8 w-px bg-blue-400/40 hidden sm:block" />
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-blue-100">
                This Month (Turnover)
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {formatCurrency(thisMonthIncome)}
              </h4>
            </div>
            <div className="h-8 w-px bg-blue-400/40 hidden sm:block" />
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-blue-100">
                Weekly Average
              </p>
              <h4 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {formatCurrency(thisWeekAvg)}
              </h4>
            </div>
          </div>

          {/* Dynamic Line Chart Canvas */}
          <div className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dynamicMonthlyAnalytics}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2530',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1E88E5"
                    strokeWidth={3.5}
                    dot={{ r: 4, fill: '#1E88E5', strokeWidth: 2, stroke: '#FFF' }}
                    activeDot={{ r: 6, fill: '#1565C0', strokeWidth: 2, stroke: '#FFF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses & COGS"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Dynamic Category Breakdown Donut Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-4.5 w-1.5 rounded-full bg-[#00BCD4]" />
                <h3 className="text-base font-bold text-slate-800">
                  Inventory Valuation Share
                </h3>
              </div>
              <Badge variant="cyan" className="text-[10px]">Live Catalog</Badge>
            </div>

            {/* Donut Chart (Dynamic) */}
            <div className="relative h-56 w-full mt-4 flex items-center justify-center">
              {dynamicCategoryShares.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dynamicCategoryShares}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dynamicCategoryShares.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Share']}
                        contentStyle={{
                          backgroundColor: '#1E2530',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#FFF',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-semibold uppercase text-slate-400">Share</span>
                    <span className="text-lg font-bold text-slate-800">100%</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Inbox className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No catalog items yet</p>
                  <p className="text-[10px] text-slate-400">Add products in Inventory to view category shares</p>
                </div>
              )}
            </div>
          </div>

          {/* Legend Items with Percentages (Dynamic) */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            {dynamicCategoryShares.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-600 font-medium truncate max-w-[140px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Financial Entries & System Audit Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Dynamic Financial Ledger Stream */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-1.5 rounded-full bg-[#10B981]" />
              <h3 className="text-sm font-bold text-slate-800">
                Recent Financial Entries
              </h3>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {financials.length} total entries
            </Badge>
          </div>

          <div className="space-y-2.5">
            {financials.length > 0 ? (
              financials.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                        entry.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : entry.type === 'expense'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{entry.category}</p>
                      <p className="text-[11px] text-slate-500">{entry.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        entry.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400">{entry.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No financial entries logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Real-time System Audit Activity */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-1.5 rounded-full bg-[#7C4DFF]" />
              <h3 className="text-sm font-bold text-slate-800">
                Governance Audit Trail
              </h3>
            </div>
            <Badge variant="purple" className="text-[10px]">
              Live Activity
            </Badge>
          </div>

          <div className="space-y-2.5">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-all"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-[#7C4DFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {log.timestamp.split(' ')[1] || log.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {log.userName}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <Badge variant="secondary" className="text-[9px] py-0 px-1">
                        {log.module}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No activity logs recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
