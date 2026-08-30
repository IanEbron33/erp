'use client';

import React from 'react';
import { SalesOrder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceModalProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-slate-50">
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold text-slate-900">
              Sales Order & Invoice Preview
            </DialogTitle>
            <Badge
              variant={
                order.status === 'paid' || order.status === 'delivered'
                  ? 'success'
                  : order.status === 'pending'
                  ? 'warning'
                  : 'default'
              }
              className="text-[10px] uppercase font-bold"
            >
              {order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 pr-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-semibold"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Sheet Container */}
        <div id="printable-invoice" className="p-8 bg-white m-4 rounded-xl shadow-xs border border-slate-200 space-y-6 text-slate-800">
          {/* Company Branding & Invoice Meta */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E88E5] text-white font-bold text-base">
                  E
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Mini <span className="text-[#1E88E5]">ERP</span> Corp.
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                100 Enterprise Way, Suite 500 • Silicon Valley, CA
              </p>
              <p className="text-xs text-slate-500">
                billing@minierp.io • +1 (800) 555-0199
              </p>
            </div>

            <div className="text-right">
              <h3 className="text-xl font-black text-[#1E88E5] tracking-tight">
                SALES INVOICE
              </h3>
              <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                {order.orderNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: {formatDate(order.orderDate)}
              </p>
              <p className="text-xs text-slate-500">
                Payment Terms: <span className="font-semibold text-slate-700">{order.paymentTerms}</span>
              </p>
            </div>
          </div>

          {/* Bill To & Rep Info */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Billed To:
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {order.customerCompany || order.customerName}
              </p>
              <p className="text-slate-600">Attn: {order.customerName}</p>
              <p className="text-slate-500 mt-0.5">Account ID: {order.customerId}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Sales Representative:
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {order.createdByName}
              </p>
              <p className="text-slate-600">Commercial Accounts Division</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-left">SKU / Item</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Disc.</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Notes & Terms:
              </p>
              <p className="text-slate-600">{order.notes || 'Thank you for your business.'}</p>
              <p className="text-[11px] text-slate-400 pt-2">
                All claims for damages must be reported within 7 business days of delivery.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sales Tax ({(order.taxRate * 100).toFixed(0)}%):</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(order.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-[#1E88E5] text-base">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
