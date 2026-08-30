'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CustomersDirectoryPage() {
  const { customers, addCustomer } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: '25000',
    paymentTerms: 'Net 30',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      ...formData,
      creditLimit: parseFloat(formData.creditLimit) || 25000,
    });
    setShowAddModal(false);
    setFormData({
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Sales Representative</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Client Accounts</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Customer Directory & Ledger
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by company, contact name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filteredCustomers.length} Total Accounts
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company & Contact</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Billing Address</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead className="text-right">Outstanding Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-bold text-slate-900">{c.company || c.name}</p>
                  <p className="text-xs text-slate-500">{c.name}</p>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{c.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                  {c.address}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px]">
                    {c.paymentTerms}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-700">
                  {formatCurrency(c.creditLimit)}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  <span
                    className={
                      c.currentBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }
                  >
                    {formatCurrency(c.currentBalance)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Register Customer Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Company Name</label>
              <Input
                type="text"
                placeholder="e.g. Apex Industrial Solutions"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Primary Contact Name</label>
              <Input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="rachel@apexind.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <Input
                  type="text"
                  placeholder="+1 (555) 332-9090"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Billing Address</label>
              <Input
                type="text"
                placeholder="1000 Commercial Row, Austin, TX"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Credit Limit (₱)</label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={formData.creditLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, creditLimit: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="mt-1 flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
                >
                  <option value="Immediate Payment">Immediate Payment</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Customer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
