'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, CheckCircle2, Boxes, PackageCheck, Truck } from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function StockInReceivingPage() {
  const router = useRouter();
  const { products, receiveStock } = useERP();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<string>('25');
  const [poNumber, setPoNumber] = useState<string>(
    `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [supplierName, setSupplierName] = useState<string>('TechGlobal Logistics Direct');
  const [notes, setNotes] = useState<string>('Pallet inspection passed, no external seal tamper.');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity) || 0;
    if (!selectedProductId || qtyNum <= 0) return;

    receiveStock(
      selectedProductId,
      qtyNum,
      poNumber,
      `Received from ${supplierName} (${notes})`
    );

    setIsSuccess(true);
    setTimeout(() => {
      router.push('/inventory');
    }, 1200);
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
            <span className="text-[#1E88E5]">Stock In Intake</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Receive Supplier Purchase Order Delivery
          </h2>
        </div>
      </div>

      {isSuccess ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Stock Successfully Received & Logged!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Updated {quantity} units for {selectedProduct?.name}. Redirecting back to master catalog...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-4.5 w-1.5 rounded-full bg-[#1E88E5]" />
                <h3 className="text-base font-bold text-slate-800">
                  Receiving Inspection Sheet
                </h3>
              </div>
              <Badge variant="cyan" className="text-[10px]">
                Warehouse Floor Intake
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Purchase Order / Delivery Reference #
                </label>
                <Input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  required
                  className="mt-1 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Supplier / Vendor Name
                </label>
                <Input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Product Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Target Product to Restock
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Current Stock: {p.stockOnHand} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Current Stock:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedProduct.stockOnHand} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Unit Cost Price:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {formatCurrency(selectedProduct.costPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Expected New Stock:</span>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5">
                    {(Number(selectedProduct.stockOnHand) || 0) + (parseInt(quantity) || 0)}{' '}
                    {selectedProduct.unit}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Quantity Received (Units)
              </label>
              <Input
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Inspection & Quality Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href="/inventory">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="font-bold shadow-md shadow-blue-500/20">
                <PackageCheck className="h-4 w-4" />
                Confirm Stock Reception & Post In
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
