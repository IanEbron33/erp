'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ArrowLeft,
  MinusCircle,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  PackageMinus,
  PackagePlus,
  Sparkles,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function StockAdjustmentsPage() {
  const { products, logStockAdjustment } = useERP();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [actionDirection, setActionDirection] = useState<'deduct' | 'add'>('deduct');
  const [adjustmentType, setAdjustmentType] = useState<'damage' | 'adjustment'>('damage');
  const [quantityInput, setQuantityInput] = useState<string>('2');
  const [reasonCode, setReasonCode] = useState<string>('Broken packaging / transit water damage');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const positiveQty = parseInt(quantityInput) || 0;
  const computedDelta = actionDirection === 'deduct' ? -positiveQty : positiveQty;

  const currentStock = selectedProduct?.stockOnHand || 0;
  const postStock = Math.max(0, currentStock + computedDelta);

  const DEDUCT_REASONS = [
    'Broken packaging / transit water damage',
    'Expired / quality degraded',
    'Physical count discrepancy (shortage)',
    'Defective manufacturer unit',
    'Internal showroom / sample usage',
  ];

  const ADD_REASONS = [
    'Found extra units during cycle count',
    'Supplier freebie / bonus stock',
    'Customer return unrecorded restock',
    'Inventory audit reconciliation',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || positiveQty <= 0) return;

    logStockAdjustment(selectedProductId, computedDelta, reasonCode, adjustmentType);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setQuantityInput('1');
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/inventory">
          <Button variant="outline" size="iconSm" className="rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Inventory & Warehouse</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Stock Reconciliation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Stock Adjustments & Damage Write-Offs
          </h2>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Adjustment successfully applied! Stock updated by <strong>{computedDelta > 0 ? `+${computedDelta}` : computedDelta} units</strong> and logged to audit trail & financials.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`h-4.5 w-1.5 rounded-full ${
                  actionDirection === 'deduct' ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                }`}
              />
              <h3 className="text-base font-bold text-slate-800">
                Adjustment Direction & Details
              </h3>
            </div>
            <Badge
              variant={actionDirection === 'deduct' ? 'danger' : 'success'}
              className="text-[10px] uppercase font-bold"
            >
              {actionDirection === 'deduct' ? 'Stock Deduction' : 'Stock Addition'}
            </Badge>
          </div>

          {/* 1. Segmented Action Pill Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Adjustment Action
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Deduct Button */}
              <button
                type="button"
                onClick={() => {
                  setActionDirection('deduct');
                  setAdjustmentType('damage');
                  setReasonCode(DEDUCT_REASONS[0]);
                }}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  actionDirection === 'deduct'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-xs ring-2 ring-rose-200/50'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <MinusCircle className={`h-4 w-4 ${actionDirection === 'deduct' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>− Deduct / Write-Off Stock</span>
              </button>

              {/* Add Button */}
              <button
                type="button"
                onClick={() => {
                  setActionDirection('add');
                  setAdjustmentType('adjustment');
                  setReasonCode(ADD_REASONS[0]);
                }}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  actionDirection === 'add'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-xs ring-2 ring-emerald-200/50'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <PlusCircle className={`h-4 w-4 ${actionDirection === 'add' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>+ Add / Restock to Inventory</span>
              </button>
            </div>
          </div>

          {/* 2. Product Selector & Adjustment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Select Item to Adjust
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              >
                {products.length === 0 ? (
                  <option value="">No products in inventory yet</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Stock: {p.stockOnHand} {p.unit}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Accounting Category
              </label>
              <select
                value={adjustmentType}
                onChange={(e) =>
                  setAdjustmentType(e.target.value as 'damage' | 'adjustment')
                }
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              >
                {actionDirection === 'deduct' ? (
                  <>
                    <option value="damage">Damaged / Expired / Spoilage Loss (Posts to Financials)</option>
                    <option value="adjustment">Cycle Count Shortfall Correction</option>
                  </>
                ) : (
                  <>
                    <option value="adjustment">Cycle Count Surplus Correction</option>
                    <option value="adjustment">Supplier Freebie / Bonus Inventory</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Live Stock Calculation Preview Card */}
          {selectedProduct && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Current Available Stock:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedProduct.stockOnHand} {selectedProduct.unit}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Cost Valuation:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatCurrency(selectedProduct.costPrice)} / unit
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200">
                <span className="text-slate-500 font-medium">Post-Adjustment Stock:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-bold text-base text-slate-900">
                    {postStock} {selectedProduct.unit}
                  </p>
                  {positiveQty > 0 && (
                    <Badge
                      variant={actionDirection === 'deduct' ? 'danger' : 'success'}
                      className="text-[10px] font-bold"
                    >
                      {actionDirection === 'deduct' ? `−${positiveQty}` : `+${positiveQty}`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Positive Quantity Input & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-700">
                {actionDirection === 'deduct' ? 'Units to Deduct' : 'Units to Add'}
              </label>
              <div className="relative mt-1">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-base ${
                    actionDirection === 'deduct' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {actionDirection === 'deduct' ? '−' : '+'}
                </div>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  required
                  className="pl-8 text-sm font-bold h-10"
                />
              </div>
            </div>

            <div className="md:col-span-8">
              <label className="text-xs font-semibold text-slate-700">
                Reason / Investigation Memo
              </label>
              <Input
                type="text"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                placeholder="Enter adjustment reason..."
                required
                className="mt-1 h-10 text-xs"
              />

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">
                  Quick tags:
                </span>
                {(actionDirection === 'deduct' ? DEDUCT_REASONS : ADD_REASONS).map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setReasonCode(reason)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link href="/inventory">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>

            {actionDirection === 'deduct' ? (
              <Button
                type="submit"
                variant="destructive"
                disabled={positiveQty <= 0 || !selectedProductId}
                className="font-bold shadow-md shadow-rose-500/15"
              >
                <MinusCircle className="h-4 w-4" />
                Apply & Deduct Stock Write-Off
              </Button>
            ) : (
              <Button
                type="submit"
                variant="success"
                disabled={positiveQty <= 0 || !selectedProductId}
                className="font-bold shadow-md shadow-emerald-500/15"
              >
                <PlusCircle className="h-4 w-4" />
                Apply & Add Inventory Stock
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
