'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  ArrowDownToLine,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { StockTransactionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function StockTransactionsPage() {
  const { stockTransactions } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = stockTransactions.filter((tx) => {
    const matchesSearch =
      tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceDoc && tx.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.reason && tx.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalInflow = stockTransactions
    .filter((tx) => tx.type === 'stock_in')
    .reduce((sum, tx) => sum + tx.quantityChange, 0);

  const totalOutflow = stockTransactions
    .filter((tx) => tx.type === 'damage' || tx.type === 'sale_deduction' || (tx.type === 'adjustment' && tx.quantityChange < 0))
    .reduce((sum, tx) => sum + Math.abs(tx.quantityChange), 0);

  const getTypeBadge = (type: StockTransactionType) => {
    switch (type) {
      case 'stock_in':
        return (
          <Badge variant="success" className="gap-1 text-[11px]">
            <TrendingUp className="h-3 w-3" />
            PO Receiving
          </Badge>
        );
      case 'damage':
        return (
          <Badge variant="danger" className="gap-1 text-[11px]">
            <TrendingDown className="h-3 w-3" />
            Damage Write-Off
          </Badge>
        );
      case 'adjustment':
        return (
          <Badge variant="warning" className="gap-1 text-[11px]">
            <SlidersHorizontal className="h-3 w-3" />
            Manual Adjustment
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Inventory & Warehouse</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Movement Ledger</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Stock Movement & Intake Ledger
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <KPICard
          label="Total Logged Movements"
          value={stockTransactions.length}
          subtitle="All transactions on record"
          accentColor="#1E88E5"
          icon={<History className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Total Units Inflow"
          value={`+${totalInflow} pcs`}
          subtitle="Stock received from suppliers"
          accentColor="#10B981"
          icon={<TrendingUp className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Total Units Outflow / Deductions"
          value={`-${totalOutflow} pcs`}
          subtitle="Adjusted or written-off units"
          accentColor="#EF4444"
          icon={<TrendingDown className="h-6 w-6 text-[#EF4444]" />}
        />
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, product name, PO #, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Movements' },
              { id: 'stock_in', label: 'PO Receiving' },
              { id: 'adjustment', label: 'Adjustments' },
              { id: 'damage', label: 'Write-Offs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  typeFilter === tab.id
                    ? 'bg-gradient-to-b from-[#1E88E5] to-[#1565C0] text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SKU & Product</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Before → After</TableHead>
              <TableHead>Reference / Reason</TableHead>
              <TableHead className="text-right">Logged By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                  No stock transactions found. Receive deliveries or log adjustments to populate the ledger.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell>{getTypeBadge(tx.type)}</TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-900">{tx.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{tx.sku}</p>
                  </TableCell>
                  <TableCell className="font-bold">
                    <span
                      className={`text-xs ${
                        tx.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange} pcs
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {tx.previousStock} → <strong className="text-slate-900">{tx.newStock} pcs</strong>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-800 font-medium">
                      {tx.referenceDoc ? `Ref: ${tx.referenceDoc}` : tx.reason || 'Manual entry'}
                    </p>
                    {tx.referenceDoc && tx.reason && (
                      <p className="text-[10px] text-slate-400">{tx.reason}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-slate-700">
                    {tx.performedBy}
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
