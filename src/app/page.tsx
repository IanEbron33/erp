'use client';

import React from 'react';
import { useERP } from '@/lib/erp-context';
import GovernanceDashboard from './governance/page';
import SalesDashboardPage from './sales/page';
import InventoryPage from './inventory/page';

export default function HomePage() {
  const { currentUser } = useERP();

  if (currentUser.role === 'sales') {
    return <SalesDashboardPage />;
  }

  if (currentUser.role === 'inventory') {
    return <InventoryPage />;
  }

  return <GovernanceDashboard />;
}
