'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { UserRole, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function Header() {
  const router = useRouter();
  const { currentUser, availableUsers, switchUser, logout, metrics } = useERP();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleUserSelect = (user: UserProfile) => {
    switchUser(user);
    setShowRoleModal(false);

    if (user.role === 'admin') router.push('/governance');
    else if (user.role === 'sales') router.push('/sales');
    else if (user.role === 'inventory') router.push('/inventory');
  };

  const handleLogout = () => {
    logout();
    setShowRoleModal(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b border-slate-200/80 bg-white px-6 shadow-2xs">
      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9.5 w-9.5 rounded-full text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {(metrics.lowStockCount > 0 || metrics.pendingOrdersCount > 0) && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </Button>

          {/* Quick Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  System Alerts
                </h4>
                <Badge variant="info" className="text-[10px]">
                  Live Sync
                </Badge>
              </div>
              <div className="mt-3 space-y-2.5">
                {metrics.lowStockCount > 0 && (
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-amber-900">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Low Stock Threshold</p>
                      <p className="text-[11px] text-amber-800">
                        {metrics.lowStockCount} items are at or below reorder safety points.
                      </p>
                    </div>
                  </div>
                )}
                {metrics.pendingOrdersCount > 0 && (
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-blue-50/80 border border-blue-200/60 text-blue-900">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Pending Sales Orders</p>
                      <p className="text-[11px] text-blue-800">
                        {metrics.pendingOrdersCount} orders waiting for payment or fulfillment.
                      </p>
                    </div>
                  </div>
                )}
                {metrics.lowStockCount === 0 && metrics.pendingOrdersCount === 0 && (
                  <p className="text-center text-xs text-slate-400 py-3">
                    All clear! No pending urgent alerts.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Direct Quick Sign Out Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9.5 w-9.5 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign Out to Login"
        >
          <LogOut className="h-4.5 w-4.5" />
        </Button>

        {/* User Avatar & Info (Clickable for Role Switching / Profile) */}
        <button
          onClick={() => setShowRoleModal(true)}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-[#1E88E5] transition-all"
          />
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
            </div>
            <p className="text-[10px] text-slate-500">{currentUser.roleTitle}</p>
          </div>
        </button>
      </div>

      {/* Role Switching & Account Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Active User & Role Switcher
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <p className="text-xs text-slate-500">
              Switch between provisioned employee accounts or sign out of your session:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableUsers.map((user) => {
                const isSelected = currentUser.id === user.id || currentUser.email === user.email;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1E88E5] bg-blue-50/70 shadow-xs ring-2 ring-blue-200/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            {user.name}
                          </p>
                          <Badge
                            variant={
                              user.role === 'admin'
                                ? 'default'
                                : user.role === 'sales'
                                ? 'cyan'
                                : 'warning'
                            }
                            className="text-[10px] py-0 px-1.5"
                          >
                            {user.role.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-[#1E88E5]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-semibold gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out to Login
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowRoleModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
