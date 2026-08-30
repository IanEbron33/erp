'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ArrowDownToLine,
  Search,
  Plus,
  PackagePlus,
  Eye,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

const PRESET_CATEGORIES = [
  'Peripherals',
  'Displays & Monitors',
  'Computers & Laptops',
  'Hardware & Components',
  'Office Furniture',
  'Audio & Accessories',
  'Networking & Cables',
  'Power & Batteries',
  'Packaging & Supplies',
  'Other / General',
];

export default function MasterCatalogPage() {
  const { products, addProduct, currentUser, metrics, isLoading } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const isSalesRole = currentUser.role === 'sales';

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Peripherals',
    unit: 'pcs',
    costPrice: '',
    sellingPrice: '',
    stockOnHand: '',
    minStockLevel: '',
    location: 'Aisle 1 - Shelf A',
    description: '',
  });

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      ...formData,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      stockOnHand: parseInt(formData.stockOnHand) || 0,
      reservedStock: 0,
      minStockLevel: parseInt(formData.minStockLevel) || 10,
    });
    setShowAddModal(false);
    setFormData({
      sku: '',
      name: '',
      category: 'Peripherals',
      unit: 'pcs',
      costPrice: '',
      sellingPrice: '',
      stockOnHand: '',
      minStockLevel: '',
      location: 'Aisle 1 - Shelf A',
      description: '',
    });
  };

  const totalUnitsOnHand = products.reduce((sum, p) => sum + p.stockOnHand, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Inventory & Warehouse</span>
            <span>•</span>
            <span className="text-[#1E88E5]">SKU Management</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Inventory Master Catalog
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/inventory/stock-in">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <ArrowDownToLine className="h-4 w-4 text-[#1E88E5]" />
              Receive PO Delivery
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add New SKU
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Active SKUs"
          value={products.length}
          subtitle="Catalog product variants"
          accentColor="#1E88E5"
          icon={<Boxes className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Physical Units On Hand"
          value={totalUnitsOnHand}
          subtitle="Warehouse stock count"
          accentColor="#10B981"
          icon={<CheckCircle2 className="h-6 w-6 text-[#10B981]" />}
        />
        <KPICard
          label="Low Stock Warnings"
          value={metrics.lowStockCount}
          subtitle="At or below safety threshold"
          accentColor="#F59E0B"
          icon={<Boxes className="h-6 w-6 text-[#F59E0B]" />}
        />
        <KPICard
          label="Total Inventory Asset"
          value={formatCurrency(metrics.inventoryValuation)}
          subtitle="Valuation at cost price"
          accentColor="#00BCD4"
          icon={<ShieldCheck className="h-6 w-6 text-[#00BCD4]" />}
        />
      </div>

      {/* Product Catalog Table Container */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, product title, or bay location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-b from-[#1E88E5] to-[#1565C0] text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Catalog Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU & Product Name</TableHead>
              <TableHead>Category / Bin</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Stock On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available to Sell</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                  No product variants found in inventory catalog. Click <strong>Add New SKU</strong> above!
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => {
                const availableToSell = Math.max(0, p.stockOnHand - (p.reservedStock || 0));
                const isLowStock = p.stockOnHand <= p.minStockLevel;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-700 font-medium">{p.category}</p>
                      <p className="text-[10px] text-slate-400">{p.location}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {formatCurrency(p.costPrice)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-xs">
                      {p.stockOnHand} {p.unit}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {p.reservedStock || 0} {p.unit}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-700">
                      {availableToSell} {p.unit}
                    </TableCell>
                    <TableCell>
                      {p.stockOnHand === 0 ? (
                        <Badge variant="danger">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Optimal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add SKU Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add New Product to Inventory
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddProduct} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  SKU Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g. MON-4K-01"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Product Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Ultra HD 4K Monitor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1E88E5] focus:outline-none cursor-pointer"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Unit of Measurement
                </label>
                <Input
                  type="text"
                  placeholder="pcs / box / kg"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Cost Price (₱)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Selling Price (₱)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Initial Stock On Hand
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stockOnHand}
                  onChange={(e) => setFormData({ ...formData, stockOnHand: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Safety Min Stock Level
                </label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  required
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Warehouse Location / Bay
              </label>
              <Input
                type="text"
                placeholder="e.g. Aisle 3 - Shelf C"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Save Product to Catalog
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
