'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Boxes,
  ShoppingCart,
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { UserRole, Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function EmployeeManagementPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currentUser } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit Modal State
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'sales',
  });

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Form State (4 Fields)
  const [createFormData, setCreateFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'sales',
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email || !createFormData.password) return;

    setIsSubmitting(true);
    try {
      await addEmployee(createFormData);
      setShowAddModal(false);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        role: 'sales',
      });
      setShowCreatePassword(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setEditFormData({
      name: emp.name,
      email: emp.email,
      password: emp.password || '',
      role: emp.role,
    });
    setShowEditPassword(false);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeToEdit || !editFormData.name || !editFormData.email) return;

    setIsSubmitting(true);
    try {
      await updateEmployee(employeeToEdit.id, editFormData);
      setEmployeeToEdit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Admin / Governance</Badge>;
      case 'sales':
        return <Badge variant="cyan">Sales Representative</Badge>;
      case 'inventory':
        return <Badge variant="warning">Inventory Clerk</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Governance & Administration</span>
            <span>•</span>
            <span className="text-[#1E88E5]">Access & Team Control</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Employee Accounts & Role Provisioning
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          Create Employee Account
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Active Staff"
          value={employees.length}
          subtitle="System user accounts"
          accentColor="#1E88E5"
          icon={<Users className="h-6 w-6 text-[#1E88E5]" />}
        />
        <KPICard
          label="Governance & Admins"
          value={employees.filter((e) => e.role === 'admin').length}
          subtitle="Managing Directors & CFOs"
          accentColor="#7C4DFF"
          icon={<ShieldCheck className="h-6 w-6 text-[#7C4DFF]" />}
        />
        <KPICard
          label="Sales Representatives"
          value={employees.filter((e) => e.role === 'sales').length}
          subtitle="Order & Client managers"
          accentColor="#00BCD4"
          icon={<ShoppingCart className="h-6 w-6 text-[#00BCD4]" />}
        />
        <KPICard
          label="Inventory Clerks"
          value={employees.filter((e) => e.role === 'inventory').length}
          subtitle="Warehouse & stock intake"
          accentColor="#F59E0B"
          icon={<Boxes className="h-6 w-6 text-[#F59E0B]" />}
        />
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, gmail, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Staff' },
              { id: 'admin', label: 'Admins' },
              { id: 'sales', label: 'Sales Reps' },
              { id: 'inventory', label: 'Inventory Clerks' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-gradient-to-b from-[#1E88E5] to-[#1565C0] text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name & Profile</TableHead>
              <TableHead>Gmail / Corporate Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                  No employee accounts found. Click <strong>Create Employee Account</strong> to register your team.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelf = emp.id === currentUser.id;

                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {emp.name}
                            {isSelf && (
                              <span className="text-[10px] text-[#1E88E5] font-semibold">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ID: {emp.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 text-xs">
                      {emp.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(emp.role)}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      {emp.roleTitle}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(emp)}
                          className="h-7.5 text-[11px] px-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs font-semibold"
                          title="Edit Employee Account"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-[#1E88E5]" />
                          Edit
                        </Button>

                        {/* Delete Button (if not self) */}
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={() => setEmployeeToDelete(emp)}
                            className="h-7.5 w-7.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ========================================================================= */}
      {/* 1. CREATE EMPLOYEE MODAL (4 FIELDS WITH EYE TOGGLE) */}
      {/* ========================================================================= */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Create Employee Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4 mt-1">
            {/* Field 1: Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                1. Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  required
                  className="pl-10 h-10 text-xs"
                />
              </div>
            </div>

            {/* Field 2: Gmail / Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                2. Gmail / Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="e.g. juan.delacruz@gmail.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  required
                  className="pl-10 h-10 text-xs"
                />
              </div>
            </div>

            {/* Field 3: Password (with Eye Icon Toggle) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                3. Initial Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showCreatePassword ? 'text' : 'password'}
                  placeholder="e.g. password123"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  required
                  className="pl-10 pr-10 h-10 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Employee will use this password alongside their Gmail to log in.
              </p>
            </div>

            {/* Field 4: Assign Role */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                4. Assign Access Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, role: 'admin' })}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    createFormData.role === 'admin'
                      ? 'border-[#1E88E5] bg-blue-50/80 text-[#1E88E5] shadow-xs font-bold ring-2 ring-blue-200/50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[9px] text-slate-400 font-normal">Governance & P&L</span>
                </button>

                {/* Sales Card */}
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, role: 'sales' })}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    createFormData.role === 'sales'
                      ? 'border-cyan-500 bg-cyan-50/80 text-cyan-800 shadow-xs font-bold ring-2 ring-cyan-200/50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs font-bold">Sales</span>
                  <span className="text-[9px] text-slate-400 font-normal">Orders & Invoices</span>
                </button>

                {/* Inventory Card */}
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, role: 'inventory' })}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    createFormData.role === 'inventory'
                      ? 'border-amber-500 bg-amber-50/80 text-amber-800 shadow-xs font-bold ring-2 ring-amber-200/50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Boxes className="h-5 w-5" />
                  <span className="text-xs font-bold">Inventory</span>
                  <span className="text-[9px] text-slate-400 font-normal">Stock & PO Intake</span>
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="font-bold"
              >
                {isSubmitting ? 'Provisioning...' : 'Save & Provision Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. EDIT EMPLOYEE MODAL (EDIT NAME, ROLE, PASSWORD WITH EYE TOGGLE) */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(employeeToEdit)}
        onOpenChange={(open) => !open && setEmployeeToEdit(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Edit Employee Account
            </DialogTitle>
          </DialogHeader>

          {employeeToEdit && (
            <form onSubmit={handleUpdateEmployee} className="space-y-4 mt-1">
              {/* Field 1: Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="pl-10 h-10 text-xs"
                  />
                </div>
              </div>

              {/* Field 2: Gmail / Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Gmail / Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="pl-10 h-10 text-xs"
                  />
                </div>
              </div>

              {/* Field 3: Password (with Eye Icon Toggle) */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Update Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 h-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Change Assigned Role */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Change Assigned Role
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Admin Card */}
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'admin' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      editFormData.role === 'admin'
                        ? 'border-[#1E88E5] bg-blue-50/80 text-[#1E88E5] shadow-xs font-bold ring-2 ring-blue-200/50'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-xs font-bold">Admin</span>
                    <span className="text-[9px] text-slate-400 font-normal">Governance</span>
                  </button>

                  {/* Sales Card */}
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'sales' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      editFormData.role === 'sales'
                        ? 'border-cyan-500 bg-cyan-50/80 text-cyan-800 shadow-xs font-bold ring-2 ring-cyan-200/50'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs font-bold">Sales</span>
                    <span className="text-[9px] text-slate-400 font-normal">Orders</span>
                  </button>

                  {/* Inventory Card */}
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'inventory' })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      editFormData.role === 'inventory'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-800 shadow-xs font-bold ring-2 ring-amber-200/50'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Boxes className="h-5 w-5" />
                    <span className="text-xs font-bold">Inventory</span>
                    <span className="text-[9px] text-slate-400 font-normal">Warehouse</span>
                  </button>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEmployeeToEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="font-bold"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Update Employee'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. DELETE EMPLOYEE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(employeeToDelete)}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Revoke Employee Account
              </DialogTitle>
            </div>
          </DialogHeader>

          {employeeToDelete && (
            <div className="space-y-3 py-2 text-xs">
              <p className="text-slate-600">
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-slate-900">{employeeToDelete.name}</strong>?
              </p>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-bold text-slate-900">{employeeToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Role:</span>
                  <span className="font-bold capitalize text-slate-800">{employeeToDelete.role}</span>
                </div>
              </div>

              <p className="text-[11px] text-rose-600">
                This will remove access to the ERP system for this user.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmployeeToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructiveSolid"
              size="sm"
              onClick={handleDeleteConfirm}
              className="font-bold"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
