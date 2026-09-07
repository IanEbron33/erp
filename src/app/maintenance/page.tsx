'use client';

import React, { useState } from 'react';
import { RefreshCw, ServerOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
      if (!res.redirected || !res.url.includes('/maintenance')) {
        window.location.href = '/';
        return;
      }
    } catch {
      // Continue to reload
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Simple, Clean Brand Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden text-center">
          {/* Top Brand Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E88E5] via-[#00BCD4] to-[#7C4DFF]" />

          {/* Logo */}
          <div className="flex flex-col items-center space-y-1.5 pt-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-md shadow-blue-500/25 font-bold text-xl mb-1">
              E
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mini <span className="text-[#1E88E5]">ERP</span>
            </p>
          </div>

          {/* Icon Badge */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 shadow-xs">
              <ServerOff className="h-7 w-7" />
            </div>
          </div>

          {/* Message Only */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              The website is temporarily off or down
            </h1>
          </div>

          {/* Refresh Action */}
          <div className="pt-2">
            <Button
              onClick={handleRefresh}
              disabled={isChecking}
              className="w-full h-11 text-sm font-semibold bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Subtle Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Mini ERP Portal</span>
        </div>
      </div>
    </div>
  );
}
