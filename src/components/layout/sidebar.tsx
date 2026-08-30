'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  ShieldCheck,
  ShoppingCart,
  PackagePlus,
  Users,
  Boxes,
  ArrowDownToLine,
  SlidersHorizontal,
  LogOut,
  History,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, metrics } = useERP();

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const navigationSections = [
    {
      title: 'GOVERNANCE & FINANCIALS',
      role: 'admin',
      items: [
        {
          name: 'Executive Dashboard',
          href: '/governance',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: 'Financial Ledger & P&L',
          href: '/governance/financials',
          icon: DollarSign,
          badge: null,
        },
        {
          name: 'Audit Trail & Logs',
          href: '/governance/audit',
          icon: ShieldCheck,
          badge: null,
        },
        {
          name: 'Team & User Access',
          href: '/governance/team',
          icon: Users,
          badge: null,
        },
      ],
    },
    {
      title: 'SALES MANAGEMENT',
      role: 'sales',
      items: [
        ...(currentUser.role === 'sales'
          ? [
              {
                name: 'Sales Dashboard',
                href: '/sales',
                icon: LayoutDashboard,
                badge: null,
              },
            ]
          : []),
        {
          name: 'Sales Orders & Invoices',
          href: '/sales/orders',
          icon: ShoppingCart,
          badge: metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} pending` : null,
        },
        {
          name: 'Create New Order',
          href: '/sales/new-order',
          icon: PackagePlus,
          badge: null,
        },
        {
          name: 'Customer Directory',
          href: '/sales/customers',
          icon: Users,
          badge: null,
        },
        ...(currentUser.role === 'sales'
          ? [
              {
                name: 'Stock Availability',
                href: '/inventory',
                icon: Boxes,
                badge: null,
              },
            ]
          : []),
      ],
    },
    {
      title: 'INVENTORY & WAREHOUSE',
      role: 'inventory',
      items: [
        ...(currentUser.role === 'inventory'
          ? [
              {
                name: 'Warehouse Dashboard',
                href: '/inventory',
                icon: LayoutDashboard,
                badge: null,
              },
            ]
          : []),
        {
          name: 'Stock Master Catalog',
          href: '/inventory/catalog',
          icon: Boxes,
          badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low` : null,
        },
        {
          name: 'Stock In (Receiving)',
          href: '/inventory/stock-in',
          icon: ArrowDownToLine,
          badge: null,
        },
        {
          name: 'Stock Adjustments',
          href: '/inventory/adjustments',
          icon: SlidersHorizontal,
          badge: null,
        },
        {
          name: 'Movement Ledger',
          href: '/inventory/transactions',
          icon: History,
          badge: null,
        },
        ...(currentUser.role === 'inventory'
          ? [
              {
                name: 'Orders & Packing',
                href: '/sales/orders',
                icon: ShoppingCart,
                badge: metrics.pendingOrdersCount > 0 ? `${metrics.pendingOrdersCount} pending` : null,
              },
            ]
          : []),
      ],
    },
  ];

  // Role-Based Access Control Filter:
  // - Admin can view all sections
  // - Sales only sees Sales Management
  // - Inventory only sees Inventory & Warehouse
  const visibleSections = navigationSections.filter((section) => {
    if (currentUser.role === 'admin') return true;
    return section.role === currentUser.role;
  });

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#1B222C] text-slate-300 border-r border-[#252E3B] transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-[#252E3B]/80 bg-[#161D26]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E88E5] text-white shadow-md shadow-blue-500/20 font-bold text-lg">
            E
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Mini <span className="text-[#1E88E5]">ERP</span>
            </h1>
          </div>
        </div>
      </div>

      {/* User Profile Summary Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-[#252E3B]/70 border border-slate-700/50">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1E88E5]/40"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {currentUser.name}
            </p>
            <div className="mt-0.5">
              <Badge
                variant={
                  currentUser.role === 'admin'
                    ? 'default'
                    : currentUser.role === 'sales'
                    ? 'cyan'
                    : 'warning'
                }
                className="text-[10px] py-0 px-1.5 font-medium"
              >
                {currentUser.role.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Filtered Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {visibleSections.map((section) => {
          return (
            <div key={section.title} className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{section.title}</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#1E88E5]" />
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#1E88E5] text-white shadow-sm shadow-blue-500/20 font-semibold'
                          : 'text-slate-300 hover:bg-[#252E3B] hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#1E88E5]/20 text-[#60A5FA]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent Sidebar Bottom Sign Out Action */}
      <div className="p-3 border-t border-[#252E3B]/80 bg-[#161D26]">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#252E3B]/60 hover:bg-rose-950/40 border border-slate-700/60 hover:border-rose-700/60 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span>Sign Out of ERP</span>
        </button>
      </div>
    </aside>
  );
}
