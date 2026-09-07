'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  RefreshCw,
  Clock,
  CheckCircle2,
  Server,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Mail,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);
  const [showAdminBypass, setShowAdminBypass] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setCheckStatusMessage(null);

    // Simulate pinging system health check
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastChecked(now);

    // Test if we can access the home page
    try {
      const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
      if (res.redirected && res.url.includes('/maintenance')) {
        setCheckStatusMessage('System is still in maintenance mode. Please check back shortly.');
      } else if (res.ok) {
        setCheckStatusMessage('System is back online! Redirecting...');
        window.location.href = '/';
      } else {
        setCheckStatusMessage('System is still in maintenance mode. Please check back shortly.');
      }
    } catch {
      setCheckStatusMessage('System is still undergoing maintenance updates.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Top Header / Branding Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-lg shadow-blue-500/30 font-bold text-lg">
            E
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              Mini <span className="text-[#38BDF8]">ERP</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 font-medium">
              Enterprise Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
            Maintenance Active
          </span>
        </div>
      </header>

      {/* Main Centerpiece Content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center items-center text-center">
        {/* Animated Glow Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 blur-xl scale-125" />
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl text-amber-400">
            <Wrench className="h-10 w-10 sm:h-12 sm:w-12 animate-[spin_12s_linear_infinite]" />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-sm">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Scheduled System Upgrades In Progress</span>
        </div>

        {/* Heading & Subtext */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          We&apos;ll Be Back <span className="bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Shortly</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
          The Mini ERP platform is currently undergoing scheduled database optimizations and system enhancements to improve security and performance.
        </p>

        {/* Status & Diagnostic Card */}
        <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 mb-8 text-left shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <Server className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">System Status</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Offline for maintenance</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Estimated Duration</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Approx. 15 – 30 mins</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>All database records and transactions are safely secured.</span>
            </div>
            {lastChecked && (
              <span className="text-[10px] text-slate-500 font-mono">
                Checked at {lastChecked}
              </span>
            )}
          </div>
        </div>

        {/* Check Status Feedback Message */}
        {checkStatusMessage && (
          <div className="mb-6 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-sky-300 animate-in fade-in flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>{checkStatusMessage}</span>
          </div>
        )}

        {/* Interactive Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1976D2] hover:to-[#0D47A1] text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking status...' : 'Check If System Is Back'}
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto px-6 h-11 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-all"
          >
            <a href="mailto:support@bsit-erp.com?subject=ERP%20System%20Maintenance%20Inquiry">
              <Mail className="h-4 w-4 mr-2 text-slate-400" />
              Contact Support
            </a>
          </Button>
        </div>

        {/* Hidden / Discreet Admin Bypass Toggle */}
        <div className="mt-8 pt-4">
          {!showAdminBypass ? (
            <button
              onClick={() => setShowAdminBypass(true)}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
            >
              <Lock className="h-3 w-3" />
              <span>Are you an administrator?</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 max-w-sm mx-auto animate-in fade-in space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                Admin Maintenance Bypass
              </p>
              <p className="text-[11px] text-slate-500">
                You can access the portal with emergency bypass mode:
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  asChild
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                >
                  <Link href="/login?bypass=admin">
                    <span>Access Admin Sign In</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAdminBypass(false)}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-800/80">
        <p>© {new Date().getFullYear()} Mini ERP Systems. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-500">HTTP 302 Maintenance Mode</span>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-400 transition-colors flex items-center gap-1 text-[11px]"
          >
            Powered by Vercel Cloud
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
