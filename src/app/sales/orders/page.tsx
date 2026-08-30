'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  PackagePlus,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Ban,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Check,
  Eye,
  Boxes,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { SalesOrder, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceModal } from '@/components/sales/invoice-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

function StatusSwitcher({
  status,
  onChange,
}: {
  status: OrderStatus;
  onChange: (newStatus: OrderStatus) => void;
}) {
  const options: { id: OrderStatus; label: string; dot: string; bg: string; text: string; border: string }[] = [
    {
      id: 'pending',
      label: 'Pending',
      dot: 'bg-amber-500 ring-2 ring-amber-200',
      bg: 'bg-amber-50/90',
      text: 'text-amber-800',
      border: 'border-amber-300',
    },
    {
      id: 'paid',
      label: 'Paid',
      dot: 'bg-emerald-500 ring-2 ring-emerald-200',
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      dot: 'bg-rose-500 ring-2 ring-rose-200',
      bg: 'bg-rose-50/90',
      text: 'text-rose-800',
      border: 'border-rose-300',
    },
  ];

  const current =
    options.find(
      (o) => o.id === (status === 'confirmed' || status === 'delivered' ? 'pending' : status)
    ) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-all hover:shadow-xs active:scale-[0.97] cursor-pointer outline-none select-none ${current.bg} ${current.text} ${current.border}`}
        >
          <span className={`h-2 w-2 rounded-full ${current.dot}`} />
          <span>{current.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-40 p-1.5 shadow-xl">
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Change Status
        </DropdownMenuLabel>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              opt.id === current.id
                ? 'bg-blue-50/80 text-[#1E88E5] font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
              <span>{opt.label}</span>
            </div>
            {opt.id === current.id && (
              <Check className="h-3.5 w-3.5 text-[#1E88E5]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SalesOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, currentUser, isLoading } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<SalesOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const isInventoryRole = currentUser.role === 'inventory';

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{isInventoryRole ? 'Inventory & Warehouse' : 'Sales Representative'}</span>
            <span>•</span>
            <span className="text-[#1E88E5]">
              {isInventoryRole ? 'Fulfillment & Orders' : 'Order Management'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {isInventoryRole ? 'Customer Orders & Packing Slips' : 'Sales Orders & Invoices'}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {isInventoryRole ? (
            <>
              <Badge variant="info" className="gap-1.5 py-1.5 px-3 text-xs font-bold">
                <Eye className="h-3.5 w-3.5" />
                Read-Only Fulfillment View
              </Badge>
              <Link href="/inventory">
                <Button variant="secondary" size="sm" className="text-xs font-semibold">
                  <Boxes className="h-4 w-4 text-[#1E88E5]" />
                  Warehouse Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sales">
                <Button variant="secondary" size="sm" className="text-xs font-semibold">
                  Sales Dashboard
                </Button>
              </Link>
              <Link href="/sales/new-order">
                <Button size="sm" className="text-xs font-semibold">
                  <PackagePlus className="h-4 w-4" />
                  Create Sales Order
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Orders"
          value={orders.length}
          subtitle="All recorded orders"
          accentColor="#1E88E5"
          icon={<ShoppingCart className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Pending Orders"
          value={orders.filter((o) => o.status === 'pending').length}
          subtitle="Awaiting payment"
          accentColor="#F59E0B"
          icon={<Clock className="h-6 w-6 text-[#F59E0B]" />}
        />
        <KPICard
          label="Paid / Completed"
          value={orders.filter((o) => o.status === 'paid').length}
          subtitle="Fulfilled & Dispatched"
          accentColor="#10B981"
          icon={<CheckCircle2 className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Cancelled Orders"
          value={orders.filter((o) => o.status === 'cancelled').length}
          subtitle="Voided orders"
          accentColor="#EF4444"
          icon={<Ban className="h-6 w-6 text-[#EF4444]" />}
        />
      </div>

      {/* Orders Table Container */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, client, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'paid', label: 'Paid' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-b from-[#1E88E5] to-[#1565C0] text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Data Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer / Company</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>{isInventoryRole ? 'Order Status' : 'Status (Click to Change)'}</TableHead>
              <TableHead className="text-right">{isInventoryRole ? 'Packing Slip' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                  No sales orders found in the system.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p className="font-bold text-slate-900 font-mono">{order.orderNumber}</p>
                    <p className="text-[10px] text-slate-400">{order.paymentTerms}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-900">{order.customerCompany}</p>
                    <p className="text-xs text-slate-500">{order.customerName}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {formatDate(order.orderDate)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} units
                    </span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {order.items.map((i) => i.productName).join(', ')}
                    </p>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  
                  {/* Status Column */}
                  <TableCell>
                    {isInventoryRole ? (
                      <Badge
                        variant={
                          order.status === 'paid'
                            ? 'success'
                            : order.status === 'pending'
                            ? 'warning'
                            : 'danger'
                        }
                        className="capitalize text-xs font-bold"
                      >
                        {order.status}
                      </Badge>
                    ) : (
                      <StatusSwitcher
                        status={order.status}
                        onChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                      />
                    )}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveInvoiceOrder(order)}
                        className="h-7.5 text-[11px] px-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs font-semibold"
                        title={isInventoryRole ? 'View Packing Slip / Invoice' : 'View Invoice'}
                      >
                        <FileText className="h-3.5 w-3.5 text-[#1E88E5]" />
                        {isInventoryRole ? 'Packing Slip' : 'Invoice'}
                      </Button>

                      {!isInventoryRole && (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setOrderToDelete(order)}
                          className="h-7.5 w-7.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice / Packing Slip Modal */}
      <InvoiceModal
        order={activeInvoiceOrder}
        isOpen={Boolean(activeInvoiceOrder)}
        onClose={() => setActiveInvoiceOrder(null)}
      />

      {/* Delete Order Confirmation Dialog */}
      {!isInventoryRole && (
        <Dialog open={Boolean(orderToDelete)} onOpenChange={(open) => !open && setOrderToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Delete Sales Order
                </DialogTitle>
              </div>
            </DialogHeader>

            {orderToDelete && (
              <div className="space-y-3 py-2 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete order{' '}
                  <strong className="text-slate-900 font-mono font-bold">{orderToDelete.orderNumber}</strong>?
                </p>

                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <span className="font-bold text-slate-900">{orderToDelete.customerCompany || orderToDelete.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Total Amount:</span>
                    <span className="font-bold text-[#1E88E5]">{formatCurrency(orderToDelete.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-bold capitalize text-slate-800">{orderToDelete.status}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                  <strong>Warning:</strong> This action permanently deletes the order and line items from Supabase. Any reserved stock will be immediately returned to inventory.
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructiveSolid"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
