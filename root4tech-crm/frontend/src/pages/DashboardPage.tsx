import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import {
  Filter,
  Users,
  FileText,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Activity as ActivityIcon
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { leads, clients, quotations, invoices, activities } = useCRM();
  const { users } = useAuth();

  // React effect hook to dynamically make the Live PKR badge background blue
  const [isBlueBadge, setIsBlueBadge] = useState<boolean>(false);

  useEffect(() => {
    setIsBlueBadge(true);
  }, []);

  // Summary Metrics
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const totalClients = clients.length;
  const totalQuotations = quotations.length;
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length;
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'Paid').length;

  // Financial PKR Metrics
  const collectedPKR = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pendingPKR = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const pipelinePKR = quotations.reduce((s, q) => s + q.amount, 0);

  // Conversion / Collection Percentages
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const quoteAcceptanceRate = totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0;

  // Recent 5 Leads
  const recentLeads = leads.slice(0, 5);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Call Back':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Interested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Send Proposal':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'lead_added':
        return {
          icon: <Filter className="w-4 h-4 text-blue-600" />,
          classes: 'bg-blue-50 text-blue-600 border-blue-100'
        };
      case 'client_created':
        return {
          icon: <Users className="w-4 h-4 text-emerald-600" />,
          classes: 'bg-emerald-50 text-emerald-600 border-emerald-100'
        };
      case 'quotation_generated':
        return {
          icon: <FileText className="w-4 h-4 text-purple-600" />,
          classes: 'bg-purple-50 text-purple-600 border-purple-100'
        };
      case 'invoice_created':
      case 'invoice_paid':
        return {
          icon: <Receipt className="w-4 h-4 text-amber-600" />,
          classes: 'bg-amber-50 text-amber-600 border-amber-100'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-500" />,
          classes: 'bg-slate-100 text-slate-500 border-slate-200'
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Admin Quick Action Operations Hub */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Admin Operations Hub
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 transition-colors duration-300 ${
                isBlueBadge
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-xs'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isBlueBadge ? 'bg-white animate-pulse' : 'bg-blue-600'}`} />
              Live PKR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Quickly manage pipeline leads, generate commercial quotations, and issue printable PKR invoices
          </p>
        </div>

        {/* Responsive Button Grid / Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0">
          <Link
            to="/leads"
            className="px-3 py-2 sm:px-3 sm:py-2 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 group"
          >
            <Filter className="w-3.5 h-3.5 shrink-0 text-blue-600 group-hover:text-white transition-colors" />
            <span className="truncate">+ Leads</span>
          </Link>
          <Link
            to="/team"
            className="px-3 py-2 sm:px-3 sm:py-2 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 group"
          >
            <Users className="w-3.5 h-3.5 shrink-0 text-indigo-600 group-hover:text-white transition-colors" />
            <span className="truncate">+ Team ({users.length})</span>
          </Link>
          <Link
            to="/quotations"
            className="px-3 py-2 sm:px-3 sm:py-2 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 group"
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-purple-600 group-hover:text-white transition-colors" />
            <span className="truncate">+ Quotations</span>
          </Link>
          <Link
            to="/invoices"
            className="px-3 py-2 sm:px-3 sm:py-2 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 group"
          >
            <Receipt className="w-3.5 h-3.5 shrink-0 text-amber-600 group-hover:text-white transition-colors" />
            <span className="truncate">+ Billing</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive Financial Strip (PKR Revenue & Receivables) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card A: Collected Revenue - Emerald Green */}
        <div className="p-4 sm:p-4.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 shadow-xs flex items-center justify-between transition-colors">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              Collected Revenue (PKR)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono mt-0.5 truncate">
              PKR {collectedPKR.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">{paidInvoices} paid invoices</span>
              <span>· {collectionRate}% cleared</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card B: Pending Receivables - Amber Orange */}
        <div className="p-4 sm:p-4.5 rounded-xl bg-white border border-slate-200 hover:border-amber-200 shadow-xs flex items-center justify-between transition-colors">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              Pending Receivables (PKR)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 font-mono mt-0.5 truncate">
              PKR {pendingPKR.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">{totalInvoices - paidInvoices} awaiting payment</span>
              <span>· active wire</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Card C: Pipeline Quote Volume - Purple */}
        <div className="p-4 sm:p-4.5 rounded-xl bg-white border border-slate-200 hover:border-purple-200 shadow-xs flex items-center justify-between transition-colors">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              Proposal Pipeline (PKR)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-purple-600 font-mono mt-0.5 truncate">
              PKR {pipelinePKR.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">{totalQuotations} commercial quotes</span>
              <span>· {quoteAcceptanceRate}% accepted</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Core 4 Metric KPI Cards (2 Columns on Mobile, 4 Columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Leads - Blue */}
        <Link
          to="/leads"
          className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Leads
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalLeads}
            </span>
            <span className="text-[11px] sm:text-xs text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Manage</span> <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 truncate">
              {convertedLeads} converted ({conversionRate}%)
            </span>
          </div>
        </Link>

        {/* Card 2: Total Clients - Emerald Green */}
        <Link
          to="/clients"
          className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Clients
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalClients}
            </span>
            <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Directory</span> <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 truncate">
              Active customer contracts
            </span>
          </div>
        </Link>

        {/* Card 3: Total Quotations - Purple */}
        <Link
          to="/quotations"
          className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Quotations
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalQuotations}
            </span>
            <span className="text-[11px] sm:text-xs text-purple-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Proposals</span> <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 truncate">
              {acceptedQuotations} accepted ({quoteAcceptanceRate}%)
            </span>
          </div>
        </Link>

        {/* Card 4: Total Invoices - Amber Orange */}
        <Link
          to="/invoices"
          className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Invoices
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalInvoices}
            </span>
            <span className="text-[11px] sm:text-xs text-amber-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Billing</span> <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 truncate">
              {paidInvoices} paid · {totalInvoices - paidInvoices} pending
            </span>
          </div>
        </Link>
      </div>

      {/* 4. Operational Health & Pipeline Conversion Meters */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Pipeline Conversion & Efficiency Rates
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            Real-time Operational Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Conversion Rate - Blue */}
          <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100/70 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Lead Conversion</span>
              <span className="font-bold text-blue-600 font-mono">{conversionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100/80 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(conversionRate, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-blue-700 font-medium block">{convertedLeads} of {totalLeads} qualified</span>
          </div>

          {/* Collection Rate - Emerald Green */}
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100/70 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Invoice Collection</span>
              <span className="font-bold text-emerald-600 font-mono">{collectionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-100/80 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">{paidInvoices} of {totalInvoices} paid in full</span>
          </div>

          {/* Quote Acceptance - Purple */}
          <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-100/70 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Quote Acceptance</span>
              <span className="font-bold text-purple-600 font-mono">{quoteAcceptanceRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-purple-100/80 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(quoteAcceptanceRate, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-700 font-medium block">{acceptedQuotations} of {totalQuotations} signed</span>
          </div>
        </div>
      </div>

      {/* 5. Two Columns: Recent Leads (Left) & Recent Activities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Recent Leads (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Leads
              </h2>
              <p className="text-xs text-slate-500">
                Latest prospective clients in pipeline
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/leads"
                className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition"
              >
                <span>+ Add Lead</span>
              </Link>
              <Link
                to="/leads"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-50 transition"
              >
                <span>View all</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile View: Touch-Friendly Card List (Visible on < md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                to="/leads"
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 active:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {lead.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {lead.company}
                    </div>
                    <div className="text-[10px] text-blue-600 truncate mt-0.5 font-medium">
                      {lead.interestedService}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {lead.dateAdded}
                  </span>
                </div>
              </Link>
            ))}
            {recentLeads.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No leads added yet.
              </div>
            )}
          </div>

          {/* Desktop & Tablet View: Clean Responsive Data Table (Visible on >= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Lead / Contact</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{lead.company}</div>
                      <div className="text-[11px] text-blue-600 truncate max-w-[160px]">{lead.interestedService}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-slate-500 font-medium whitespace-nowrap">
                      {lead.dateAdded}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No leads added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activities (5 Cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Activities
              </h2>
              <p className="text-xs text-slate-500">
                Operational updates across the platform
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <ActivityIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5">
            {activities.slice(0, 6).map((activity) => {
              const actBadge = getActivityBadge(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50/60 transition">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${actBadge.classes}`}>
                    {actBadge.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {activity.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 break-words leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400">
                No recent activity recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

