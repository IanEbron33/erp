'use client';

import React, { useState } from 'react';
import { ShieldCheck, Filter, Download, User, Clock, Search } from 'lucide-react';
import { useERP } from '@/lib/erp-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AuditLogsPage() {
  const { auditLogs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule =
      selectedModule === 'all' || log.module.toLowerCase() === selectedModule.toLowerCase();

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Governance & Financials</span>
            <span>•</span>
            <span className="text-[#1E88E5]">System Compliance</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Enterprise Audit Trail & System Activity
          </h2>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          className="text-xs font-semibold"
        >
          <Download className="h-4 w-4 text-slate-500" />
          Export Audit Report
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter logs by action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Module:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#1E88E5] focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="Governance">Governance</option>
            <option value="Sales">Sales Orders</option>
            <option value="Inventory">Inventory</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-4.5 w-1.5 rounded-full bg-[#7C4DFF]" />
            <h3 className="text-base font-bold text-slate-800">
              Immutable Activity Records
            </h3>
          </div>
          <Badge variant="purple" className="text-[11px]">
            {filteredLogs.length} events logged
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action Event</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>User / Role</TableHead>
              <TableHead>Event Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded font-mono">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.module === 'Governance'
                        ? 'default'
                        : log.module === 'Sales'
                        ? 'cyan'
                        : 'warning'
                    }
                    className="text-[10px]"
                  >
                    {log.module}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-800">
                      {log.userName}
                    </span>
                    <Badge variant="secondary" className="text-[9px] py-0 px-1">
                      {log.userRole}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-700 max-w-md">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
