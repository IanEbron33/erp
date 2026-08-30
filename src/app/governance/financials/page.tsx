'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function FinancialsLedgerPage() {
  const { financials, customers, metrics, addExpense } = useERP();
  const [filterType, setFilterType] = useState<string>('all');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Logistics & Shipping',
    amount: '',
    description: '',
  });

  const filteredFinancials = financials.filter((entry) => {
    if (filterType === 'all') return true;
    return entry.type === filterType;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount))) return;
    addExpense(
      expenseForm.category,
      parseFloat(expenseForm.amount),
      expenseForm.description || `Expense for ${expenseForm.category}`
    );
    setExpenseForm({ category: 'Logistics & Shipping', amount: '', description: '' });
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Governance & Financials</span>
            <span>•</span>
            <span className="text-[#1E88E5]">General Ledger & Receivables</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Financial Ledger & Accounts Receivable
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowExpenseModal(true)}
            className="text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Expense Entry
          </Button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-[#10B981] rounded-r-full" />
          <div className="pl-3">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Invoiced Revenue
            </p>
            <h4 className="mt-1 text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalRevenue)}
            </h4>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              Gross income recognized
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-[#EF4444] rounded-r-full" />
          <div className="pl-3">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Cost of Goods + OpEx
            </p>
            <h4 className="mt-1 text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalExpenses + metrics.totalCOGS)}
            </h4>
            <p className="mt-1 text-xs text-rose-600 font-medium">
              COGS: {formatCurrency(metrics.totalCOGS)} • OpEx: {formatCurrency(metrics.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-[#F59E0B] rounded-r-full" />
          <div className="pl-3">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Outstanding Receivables (A/R)
            </p>
            <h4 className="mt-1 text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalReceivables)}
            </h4>
            <p className="mt-1 text-xs text-amber-600 font-medium">
              Unpaid customer invoices
            </p>
          </div>
        </div>
      </div>

      {/* Customer Accounts Receivable Overview */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Customer Accounts Receivable
            </h3>
            <p className="text-xs text-slate-500">
              Outstanding credit balances and payment term statuses
            </p>
          </div>
          <Badge variant="warning" className="text-[11px]">
            {customers.filter((c) => c.currentBalance > 0).length} Customers with Balances
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer / Company</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead className="text-right">Outstanding Balance</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const isOverdue = c.currentBalance > c.creditLimit * 0.8;
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-bold text-slate-900">{c.company || c.name}</p>
                    <p className="text-xs text-slate-500">{c.name}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{c.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {c.paymentTerms}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {formatCurrency(c.creditLimit)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatCurrency(c.currentBalance)}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.currentBalance === 0 ? (
                      <Badge variant="success" className="text-[10px]">
                        Settled
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="danger" className="text-[10px]">
                        High Utilization
                      </Badge>
                    ) : (
                      <Badge variant="info" className="text-[10px]">
                        Active Terms
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* General Ledger Transactions */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              General Ledger Records
            </h3>
            <p className="text-xs text-slate-500">
              Full accounting audit entries for income, expenses, and COGS
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {['all', 'income', 'expense', 'cogs'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase ${
                  filterType === type
                    ? 'bg-white text-[#1E88E5] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description / Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFinancials.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.type === 'income'
                        ? 'success'
                        : item.type === 'expense'
                        ? 'danger'
                        : 'warning'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {item.category}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {item.description}{' '}
                  {item.referenceId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({item.referenceId})
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Record Accounting Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Expense Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value })
                }
                className="mt-1 flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              >
                <option value="Logistics & Shipping">Logistics & Shipping</option>
                <option value="Warehouse Operations">Warehouse Operations</option>
                <option value="Packaging Supplies">Packaging & Boxes</option>
                <option value="Marketing & Acquisition">Marketing & Acquisition</option>
                <option value="Insurance & Legal">Insurance & Legal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Amount (₱ PHP)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Memo / Reference
              </label>
              <Input
                type="text"
                placeholder="e.g. Courier invoice #CR-4410"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowExpenseModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Record Entry
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
