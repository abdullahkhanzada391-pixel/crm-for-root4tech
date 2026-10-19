import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { SalesRecord } from '@/types/crm';
import {
  BadgeDollarSign,
  Search,
  Printer,
  CreditCard,
  Building,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Eye,
  X,
  ShieldCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';

export const SalesRecordsPage: React.FC = () => {
  const { salesRecords } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [viewingRecord, setViewingRecord] = useState<SalesRecord | null>(null);

  const totalRevenue = salesRecords.reduce((sum, r) => sum + r.amount, 0);
  const avgSale = salesRecords.length > 0 ? Math.round(totalRevenue / salesRecords.length) : 0;

  const handlePrintSale = (record: SalesRecord) => {
    setViewingRecord(record);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const filteredRecords = salesRecords.filter((record) => {
    const matchesMethod = methodFilter === 'all' || record.paymentMethod === methodFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      record.recordNumber.toLowerCase().includes(query) ||
      record.invoiceNumber.toLowerCase().includes(query) ||
      record.companyName.toLowerCase().includes(query) ||
      record.clientName.toLowerCase().includes(query) ||
      record.service.toLowerCase().includes(query);
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales & Revenue Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of completed commercial payments and reconciled sales in PKR
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-98"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print All Sales Summary</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Realized Sales
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              PKR {totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">100% reconciled in PKR</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BadgeDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Settled Transactions
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {salesRecords.length} Completed
            </div>
            <span className="text-[11px] text-slate-400">Paid customer invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Average Deal Value
            </span>
            <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">
              PKR {avgSale.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Per commercial contract</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Bank Wire Transfer', 'ACH Direct Deposit', 'Credit Card / Stripe'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                methodFilter === m
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {m === 'all' ? `All Methods (${salesRecords.length})` : m}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search record #, invoice #, client..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Mobile View: Touch-Friendly Sales Record Cards (Visible on < md) */}
      <div className="block md:hidden space-y-3">
        {filteredRecords.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 font-mono block">
                  {r.recordNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Ref: {r.invoiceNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-600 font-mono block">
                  +PKR {r.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">
                  {r.paidDate}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-xs">
              <div className="font-semibold text-slate-900">{r.companyName}</div>
              <div className="text-[11px] text-slate-500">{r.clientName}</div>
              <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{r.service}</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate">
                <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{r.paymentMethod}</span>
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setViewingRecord(r)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handlePrintSale(r)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sale</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No sales records found.
          </div>
        )}
      </div>

      {/* Desktop / Tablet View: Sales Records Table (Visible on >= md) */}
      <div className="hidden md:block rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Record ID</th>
                <th className="py-3.5 px-4 font-semibold">Invoice Ref</th>
                <th className="py-3.5 px-4 font-semibold">Company / Client</th>
                <th className="py-3.5 px-4 font-semibold">Service</th>
                <th className="py-3.5 px-4 font-semibold">Amount Paid (PKR)</th>
                <th className="py-3.5 px-4 font-semibold">Date Settled</th>
                <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                <th className="py-3.5 px-4 font-semibold text-right">Individual Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-blue-600 font-mono whitespace-nowrap">
                    {r.recordNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 font-mono whitespace-nowrap">
                    {r.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{r.companyName}</div>
                    <div className="text-[11px] text-slate-500">{r.clientName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={r.service}>
                    {r.service}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono text-sm whitespace-nowrap">
                    +PKR {r.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {r.paidDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      <CreditCard className="w-3 h-3 text-slate-500" />
                      {r.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrintSale(r)}
                        title="Print this individual sale record separately"
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs active:scale-98"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Sale</span>
                      </button>
                      <button
                        onClick={() => setViewingRecord(r)}
                        title="View Official Payment Receipt"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL SALE RECEIPT & PRINT MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Official Sale Receipt & Payment Voucher
                </span>
                <span className="text-xs text-slate-500">
                  Individual Transaction Certificate for {viewingRecord.recordNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-98"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document (Targeted specifically by window.print via #printableDocument) */}
            <div id="printableDocument" className="p-4 sm:p-6 bg-white space-y-6 text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      R4
                    </div>
                    Root 4 Tech
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Software Development & Technology Operations
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    NTN: 8492041-9 · billing@root4tech.com · www.root4tech.com
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold font-mono text-emerald-600">
                    PAYMENT RECEIPT
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                    {viewingRecord.recordNumber}
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SETTLED & PAID
                  </span>
                </div>
              </div>

              {/* Customer & Transaction Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                    Received From Client:
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {viewingRecord.companyName}
                  </div>
                  <div className="text-slate-600 font-medium">{viewingRecord.clientName}</div>
                  <div className="text-slate-400 mt-0.5">Commercial Client Account</div>
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div>
                    <span className="text-slate-400">Date Cleared: </span>
                    <span className="font-bold text-slate-900">{viewingRecord.paidDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Invoice Ref: </span>
                    <span className="font-mono font-semibold text-blue-600">{viewingRecord.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Channel: </span>
                    <span className="font-medium text-slate-700">{viewingRecord.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Item Breakdown */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Service Description & Project Milestone</th>
                      <th className="py-2.5 px-4 text-right">Settled Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-4 font-mono text-slate-400 text-center font-bold">1</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{viewingRecord.service}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Paid against customer commercial invoice {viewingRecord.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 text-sm whitespace-nowrap">
                        PKR {viewingRecord.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Settlement Summary & Bank Verification */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">Banking Settlement Deposit:</span>
                  <p className="font-mono text-[11px] text-slate-600">
                    Meezan Bank Ltd · Account: 0102-0105829101<br/>
                    IBAN: PK36MEZN0001020105829101 · Currency: PKR
                  </p>
                </div>
                <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Amount Received:</span>
                  <div className="text-xl font-bold font-mono text-emerald-600">
                    PKR {viewingRecord.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">Net Outstanding: PKR 0</span>
                </div>
              </div>

              {/* Verification & Stamp */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-5 text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Fully Verified & Cleared</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Certificate generated electronically by Root 4 Tech CRM Finance
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-slate-300 w-36 mb-1"></div>
                  <span className="text-[11px] text-slate-500 font-medium block">Authorized Signature</span>
                  <span className="text-[10px] text-slate-400">Finance & Accounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
