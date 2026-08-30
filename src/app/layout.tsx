import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ERPProvider } from '@/lib/erp-context';
import { AppShell } from '@/components/layout/app-shell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Mini ERP — Enterprise Operations & Financials',
  description: 'Enterprise resource planning for Governance & Financials, Sales Representative, and Inventory Clerk.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#F4F7FB] text-slate-900 min-h-screen">
        <ERPProvider>
          <AppShell>{children}</AppShell>
        </ERPProvider>
      </body>
    </html>
  );
}
