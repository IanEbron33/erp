'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  ServerOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    // Simulate check delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    try {
      const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
      if (res.redirected && res.url.includes('/maintenance')) {
        setStatusMessage('The website is still currently offline. Please try again in a few minutes.');
      } else if (res.ok) {
        setStatusMessage('Website is back online! Redirecting...');
        window.location.href = '/';
      } else {
        setStatusMessage('The website is still currently offline. Please try again shortly.');
      }
    } catch {
      setStatusMessage('The website is still temporarily unavailable.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 relative overflow-hidden">
      {/* Background Subtle Gradient Accents matching ERP Portal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Theme-Aligned Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden text-center">
          {/* Top Brand Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E88E5] via-[#00BCD4] to-[#7C4DFF]" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center space-y-2 pt-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-md shadow-blue-500/25 font-bold text-2xl mb-1">
              E
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mini <span className="text-[#1E88E5]">ERP</span> Portal
            </p>
          </div>

          {/* Center Graphic Icon Badge */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
              <ServerOff className="h-8 w-8" />
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Website is currently down or offline
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              We are currently performing temporary system maintenance and upgrades. Normal access will be restored shortly.
            </p>
          </div>

          {/* Theme Warning Badge Alert (from DESIGN.md Section 4.7) */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Scheduled System Maintenance</span>
              <span className="text-amber-800 text-[11px]">
                All data, database records, and pending transactions remain fully secured.
              </span>
            </div>
          </div>

          {/* Time Estimate Info */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Estimated completion: 15 – 30 minutes</span>
          </div>

          {/* Dynamic Status Message after check */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 animate-in fade-in flex items-center justify-center gap-2">
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Primary Action Button (from DESIGN.md Section 4.6) */}
          <div className="pt-2">
            <Button
              onClick={handleRefresh}
              disabled={isChecking}
              className="w-full h-11 text-sm font-semibold bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking status...' : 'Refresh / Check Again'}</span>
            </Button>
          </div>

          {/* Discreet Admin Login Bypass */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/login?bypass=admin"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Administrator Sign In</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Security / System Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Mini ERP Enterprise Portal • HTTP 302/307 Temporary Redirection</span>
        </div>
      </div>
    </div>
  );
}
