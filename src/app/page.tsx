'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '@/lib/erp-context';
import GovernanceDashboard from './governance/page';
import SalesDashboardPage from './sales/page';
import WarehouseDashboardPage from './inventory/page';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useERP();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (currentUser.role === 'sales') {
    return <SalesDashboardPage />;
  }

  if (currentUser.role === 'inventory') {
    return <WarehouseDashboardPage />;
  }

  return <GovernanceDashboard />;
}
