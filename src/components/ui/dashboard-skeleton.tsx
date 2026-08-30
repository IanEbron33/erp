'use client';

import React from 'react';
import { Skeleton } from './skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Ribbon Skeleton Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Chart Skeleton */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Right 1 Col: Donut / Leaderboard Skeleton */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center justify-center h-48">
            <Skeleton className="h-36 w-36 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </div>

      {/* Table Skeleton Container */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-3 px-2 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 px-2 border-b border-slate-50 last:border-0"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
