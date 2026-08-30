'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useERP();

  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getSecurityNotice = () => {
    if (urlError === 'unauthorized') {
      return 'Access Denied: Your account role does not have permission to access that module. Please sign in with an authorized account.';
    }
    if (urlError === 'unauthenticated') {
      return 'Session Required: Please sign in with your credentials to access the ERP portal.';
    }
    return null;
  };

  const securityNotice = getSecurityNotice();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Allow visual animation feedback
      await new Promise((resolve) => setTimeout(resolve, 600));

      const res = await login(email, password);
      if (res.success && res.role) {
        if (res.role === 'admin') router.push('/governance');
        else if (res.role === 'sales') router.push('/sales');
        else if (res.role === 'inventory') router.push('/inventory');
      } else {
        setErrorMessage(res.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7FB] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
          {/* Top Brand Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E88E5] via-[#00BCD4] to-[#7C4DFF]" />

          {/* Logo & Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-md shadow-blue-500/25 font-bold text-xl mb-1">
              E
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mini <span className="text-[#1E88E5]">ERP</span> Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise Governance • Sales Management • Inventory Control
            </p>
          </div>

          {/* Guard Rail Security Alert Banner */}
          {securityNotice && !errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs animate-in fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{securityNotice}</span>
            </div>
          )}

          {/* Login Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dynamic 2-Field Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field 1: Gmail / Corporate Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Gmail / Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 text-xs sm:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Field 2: Password with Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-11 text-xs sm:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button with Animated Loading State */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-bold shadow-md shadow-blue-500/25 mt-2 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating session...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Role-Based Access Control • Supabase PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-xs text-slate-400">Loading portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
