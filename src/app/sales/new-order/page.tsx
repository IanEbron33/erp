'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackagePlus,
  ArrowLeft,
  Trash2,
  Plus,
  Building2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  UserPlus,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const { customers, products, createOrder, addCustomer } = useERP();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxRate, setTaxRate] = useState(0.08);
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: products[0]?.id || '',
      sku: products[0]?.sku || '',
      productName: products[0]?.name || '',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 0,
      unitCost: products[0]?.costPrice || 0,
      discountPercent: 0,
      total: products[0]?.sellingPrice || 0,
    },
  ]);

  // Quick Add Customer Dialog
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: '25000',
    paymentTerms: 'Net 30',
  });

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const discountMultiplier = (100 - (Number(item.discountPercent) || 0)) / 100;
          const numQty = Number(item.quantity) || 0;
          const total = product.sellingPrice * numQty * discountMultiplier;
          return {
            ...item,
            productId: product.id,
            sku: product.sku,
            productName: product.name,
            unitPrice: product.sellingPrice,
            unitCost: product.costPrice,
            total,
          };
        }
        return item;
      })
    );
  };

  const handleQuantityChange = (index: number, val: string) => {
    const qty = val === '' ? ('' as any) : Math.max(0, parseInt(val) || 0);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const numDisc = Number(item.discountPercent) || 0;
          const discountMultiplier = (100 - numDisc) / 100;
          const numQty = typeof qty === 'number' ? qty : 0;
          return {
            ...item,
            quantity: qty,
            total: item.unitPrice * numQty * discountMultiplier,
          };
        }
        return item;
      })
    );
  };

  const handleDiscountChange = (index: number, val: string) => {
    const disc = val === '' ? ('' as any) : Math.min(100, Math.max(0, parseFloat(val) || 0));
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const numDisc = typeof disc === 'number' ? disc : 0;
          const discountMultiplier = (100 - numDisc) / 100;
          const numQty = Number(item.quantity) || 0;
          return {
            ...item,
            discountPercent: disc,
            total: item.unitPrice * numQty * discountMultiplier,
          };
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        sku: defaultProd.sku,
        productName: defaultProd.name,
        quantity: 1,
        unitPrice: defaultProd.sellingPrice,
        unitCost: defaultProd.costPrice,
        discountPercent: 0,
        total: defaultProd.sellingPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const rawSubtotal = items.reduce(
    (sum, i) => sum + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0),
    0
  );
  const subtotalAfterDiscounts = items.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalDiscount = rawSubtotal - subtotalAfterDiscounts;
  const taxAmount = subtotalAfterDiscounts * taxRate;
  const totalAmount = subtotalAfterDiscounts + taxAmount;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const validatedItems = items.map((i) => ({
      ...i,
      quantity: Number(i.quantity) || 1,
      discountPercent: Number(i.discountPercent) || 0,
    }));

    await createOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerCompany: selectedCustomer.company,
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: 'pending',
      items: validatedItems,
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      taxRate,
      taxAmount,
      totalAmount,
      paymentTerms,
      notes,
    });

    router.push('/sales/orders');
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addCustomer({
      ...newCustForm,
      creditLimit: parseFloat(newCustForm.creditLimit) || 25000,
    });
    setSelectedCustomerId(created.id);
    setShowAddCustomerModal(false);
    setNewCustForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      creditLimit: '25000',
      paymentTerms: 'Net 30',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/orders">
            <Button variant="outline" size="iconSm" className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Sales Orders</span>
              <span>•</span>
              <span className="text-[#1E88E5]">New Order Entry</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Create New Sales Order
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-4.5 w-1.5 rounded-full bg-[#1E88E5]" />
                <h3 className="text-base font-bold text-slate-800">
                  Customer & Payment Terms
                </h3>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-xs font-semibold"
              >
                <UserPlus className="h-4 w-4 text-slate-500" />
                Quick Add Client
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Select Customer Account
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="mt-1 flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
                >
                  {customers.length === 0 ? (
                    <option value="">No customers registered yet</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name} ({c.name})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1 flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
                >
                  <option value="Immediate Payment">Immediate Payment / Cash</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            {selectedCustomer && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{selectedCustomer.company}</p>
                  <p className="text-slate-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Current Outstanding:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedCustomer.currentBalance)}
                  </span>
                  <span className="text-slate-400"> / Limit: {formatCurrency(selectedCustomer.creditLimit)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-4.5 w-1.5 rounded-full bg-[#1E88E5]" />
                <h3 className="text-base font-bold text-slate-800">
                  Line Items & Inventory Allocation
                </h3>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                className="text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No products in inventory yet. Please add products in the Inventory Catalog first.
                </div>
              ) : (
                items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  const isLowOnHand = product ? product.stockOnHand < Number(item.quantity) : false;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* Product Selector */}
                        <div className="md:col-span-6">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">
                            Product / SKU
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="mt-1 flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Stock: {p.stockOnHand}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">
                            Qty
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="mt-1 text-center"
                          />
                        </div>

                        {/* Discount % */}
                        <div className="md:col-span-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">
                            Disc %
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={item.discountPercent}
                            onChange={(e) => handleDiscountChange(index, e.target.value)}
                            className="mt-1 text-center"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="md:col-span-2 flex items-center justify-between">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase">
                              Total
                            </label>
                            <p className="text-sm font-bold text-slate-900 mt-1">
                              {formatCurrency(item.total)}
                            </p>
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isLowOnHand && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>
                            Warning: Ordered qty ({item.quantity}) exceeds available stock ({product?.stockOnHand}).
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Order Notes / Delivery Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deliver to Loading Bay 2, Gate Access PIN: 8812"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Real-time Order Summary Sheet */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#1E88E5]" />
                Order Summary
              </h3>
              <Badge variant="cyan" className="text-[10px]">
                {items.length} items
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(rawSubtotal)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Volume Discounts:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <span>Sales Tax:</span>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="rounded border border-slate-200 text-[11px] p-0.5"
                  >
                    <option value={0.12}>12% VAT</option>
                    <option value={0.08}>8% Standard</option>
                    <option value={0.00}>0% Tax Exempt</option>
                  </select>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(taxAmount)}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Due:</span>
                <span className="text-2xl font-bold text-[#1E88E5]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={products.length === 0 || customers.length === 0}
                className="w-full font-bold shadow-md shadow-blue-500/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Create Order
              </Button>
              <Link href="/sales" className="block">
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Quick Add Customer Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Company Name</label>
              <Input
                type="text"
                placeholder="e.g. Zenith Tech Corp"
                value={newCustForm.company}
                onChange={(e) => setNewCustForm({ ...newCustForm, company: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Person Name</label>
              <Input
                type="text"
                placeholder="e.g. Alexander Cole"
                value={newCustForm.name}
                onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="billing@zenith.com"
                  value={newCustForm.email}
                  onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <Input
                  type="text"
                  placeholder="+63 (2) 8012-3456"
                  value={newCustForm.phone}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Billing Address</label>
              <Input
                type="text"
                placeholder="Suite 100, BGC Innovation Blvd, Taguig City"
                value={newCustForm.address}
                onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Credit Limit (₱)</label>
              <Input
                type="number"
                placeholder="25000"
                value={newCustForm.creditLimit}
                onChange={(e) => setNewCustForm({ ...newCustForm, creditLimit: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddCustomerModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Select Client
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
