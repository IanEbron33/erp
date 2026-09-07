'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useERP } from '@/lib/erp-context';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useERP();
  const [isClientMounted, setIsClientMounted] = useState(false);

  const isStandalonePage =
    pathname === '/login' ||
    pathname === '/maintenance' ||
    pathname === '/offline';

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Strict Route Guard Rail
  useEffect(() => {
    if (!isClientMounted || isStandalonePage) return;

    // Check 1: Must be authenticated to access protected pages
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Check 2: Role Authorization Checks
    const role = currentUser.role;

    // 2.1 Governance & Admin-Only Area
    if (pathname.startsWith('/governance')) {
      if (role !== 'admin') {
        logout();
        router.replace('/login?error=unauthorized');
        return;
      }
    }

    // 2.2 Warehouse Stock-In & Adjustments (Exclusive to Inventory & Admin)
    if (
      pathname.startsWith('/inventory/stock-in') ||
      pathname.startsWith('/inventory/adjustments')
    ) {
      if (role === 'sales') {
        logout();
        router.replace('/login?error=unauthorized');
        return;
      }
    }

    // 2.3 Sales Management Modules (Exclusive to Sales & Admin, except /sales/orders read-only for Inventory)
    if (pathname.startsWith('/sales') && pathname !== '/sales/orders') {
      if (role === 'inventory') {
        logout();
        router.replace('/login?error=unauthorized');
        return;
      }
    }
  }, [pathname, isAuthenticated, currentUser.role, isClientMounted, isStandalonePage, logout, router]);

  if (isStandalonePage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Prevent rendering internal dashboard layout for unauthenticated visitors
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 animate-pulse">
          <span>Verifying security session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 antialiased flex">
      {/* Dark Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        {/* Top Header Navbar */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
