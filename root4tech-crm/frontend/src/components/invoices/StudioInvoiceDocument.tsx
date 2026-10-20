import React from 'react';
import { Invoice } from '@/types/crm';
import { Phone, Mail, MapPin } from 'lucide-react';

export interface StudioInvoiceDocumentProps {
  invoice: Invoice;
  currencySymbol?: string;
  className?: string;
}

// Studio Shodwe Stylized Abstract Swirl Logo Icon
export const StudioShodweLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 46
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="Studio Shodwe Brand Emblem"
  >
    <defs>
      <linearGradient id="swirl-dark-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="swirl-mid-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
      <linearGradient id="swirl-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#67E8F9" />
      </linearGradient>
    </defs>
    {/* First Outer Swoosh */}
    <path
      d="M14 44C11 38 10 28 17 19C24 10 33 11 32 17C31 23 20 25 18 35C16.8 41 21 44 24 45C22 47 16 48 14 44Z"
      fill="url(#swirl-dark-blue)"
    />
    {/* Second Central Swoosh */}
    <path
      d="M24 51C20 44 21 34 28 23C35 12 43 14 42 20C41 26 29 29 29 39C29 46 34 47 37 47C33 52 27 54 24 51Z"
      fill="url(#swirl-mid-blue)"
    />
    {/* Third Light Swoosh */}
    <path
      d="M34 53C31 48 33 39 40 30C47 21 53 23 52 28C51 33 42 36 41 44C40.5 49 44 50 47 50C43 55 37 56 34 53Z"
      fill="url(#swirl-cyan)"
    />
  </svg>
);

export const StudioInvoiceDocument: React.FC<StudioInvoiceDocumentProps> = ({
  invoice,
  currencySymbol = '$',
  className = ''
}) => {
  // Format dates cleanly (e.g. "25 June 2022")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '25 June 2022';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Company Details
  const companyName = invoice.companyBrandName || 'STUDIO SHODWE';
  const companySubtitle = invoice.companySubtitle || 'CREATIVE AGENCY';
  const companyWebsite = (invoice.companyWebsite || 'REALLYGREATSITE.COM').toUpperCase();

  // Client Details
  const clientName = invoice.clientName || 'Ketut Susilo';
  const clientPhone = invoice.clientPhone || '123-456-7890';
  const clientEmail = invoice.clientEmail || 'hello@reallygreatsite.com';
  const clientAddress = invoice.clientAddress || '123 Anywhere St., Any City';

  // Bank & Terms
  const bankName = invoice.bankName || 'Borcelle';
  const accountNumber = invoice.accountNumber || '123-456-7890';
  const termsText =
    invoice.terms ||
    'Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.';
  const signatoryName = invoice.signatoryName || 'Henrietta Mitchell';
  const signatoryTitle = invoice.signatoryTitle || 'Administrator';

  // Derive Items
  interface DocumentRow {
    no: number;
    description: string;
    qty: number;
    price: number;
    total: number;
  }

  let items: DocumentRow[] = [];

  if (invoice.sections && invoice.sections.length > 0) {
    items = invoice.sections.map((sec, idx) => {
      const qty = sec.qty ?? 1;
      const total = Number(sec.amount) || 0;
      const price = sec.price ?? Math.round(total / (qty || 1));
      return {
        no: idx + 1,
        description: sec.title || `Item ${idx + 1}`,
        qty,
        price,
        total: sec.price ? sec.price * qty : total
      };
    });
  } else {
    // Default / single item
    items = [
      {
        no: 1,
        description: invoice.service || 'Creative Services & Deliverables',
        qty: 1,
        price: invoice.subtotal || invoice.amount,
        total: invoice.subtotal || invoice.amount
      }
    ];
  }

  // Financial calculations
  const subtotal =
    invoice.subtotal ??
    items.reduce((acc, it) => acc + it.total, 0);

  // Tax computation (default 15% if specified or if taxAmount exists)
  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 15;
  const taxAmount =
    invoice.taxAmount !== undefined
      ? invoice.taxAmount
      : Math.round((subtotal * taxRate) / 100);

  // Discount (if any)
  const discountAmount = invoice.discountAmount || 0;

  // Grand total
  const grandTotal =
    invoice.amount && invoice.taxRate === undefined && invoice.taxAmount === undefined
      ? invoice.amount
      : Math.max(0, subtotal + taxAmount - discountAmount);

  const formatMoney = (val: number) => {
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  return (
    <div
      id="printableDocument"
      className={`relative w-full max-w-[840px] mx-auto bg-white flex flex-row min-h-[1120px] text-slate-800 shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none print:min-h-0 ${className}`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* 1. LEFT DARK SIDEBAR STRIP */}
      <div
        className="w-9 sm:w-12 md:w-14 bg-[#232832] shrink-0 self-stretch print:w-11"
        style={{ backgroundColor: '#232832' }}
      />

      {/* 2. MAIN INVOICE CANVAS */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-white print:p-8">
        <div>
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3.5">
              <StudioShodweLogo size={48} className="w-11 h-11 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-wider text-[#0f172a] uppercase leading-tight">
                  {companyName}
                </h1>
                <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#64748b] uppercase mt-0.5">
                  {companySubtitle}
                </p>
              </div>
            </div>

            {/* Title & Website */}
            <div className="text-left sm:text-right">
              <h2 className="text-3xl sm:text-4xl font-black text-[#2563eb] tracking-wide uppercase leading-none">
                INVOICE
              </h2>
              <div className="text-[11px] sm:text-xs font-medium tracking-[0.2em] text-[#334155] uppercase mt-3">
                {companyWebsite}
              </div>
            </div>
          </div>

          {/* ACCENT UNDERLINE BAR & HORIZONTAL DIVIDER */}
          <div className="relative mt-3 mb-8">
            <div className="h-[1px] w-full bg-[#cbd5e1]" />
            <div
              className="absolute left-0 -top-[1.5px] h-[3.5px] w-24 bg-[#38bdf8] rounded-full"
              style={{ backgroundColor: '#38bdf8' }}
            />
          </div>

          {/* BILL TO & INVOICE METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 text-xs sm:text-[13px]">
            {/* Left Column: Invoice to */}
            <div className="space-y-1">
              <span className="text-[#64748b] font-normal block mb-1">
                Invoice to :
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a]">
                {clientName}
              </h3>
              <p className="text-[#64748b] leading-relaxed">{clientPhone}</p>
              <p className="text-[#64748b] leading-relaxed">{clientEmail}</p>
              <p className="text-[#64748b] leading-relaxed">{clientAddress}</p>
            </div>

            {/* Right Column: Invoice Number & Date */}
            <div className="text-left sm:text-right space-y-1 sm:pt-1">
              <div className="text-sm sm:text-base text-[#0f172a] font-bold">
                <span className="font-semibold text-slate-700">Invoice no : </span>
                <span className="font-bold text-[#0f172a]">{invoice.invoiceNumber || '12345'}</span>
              </div>
              <div className="text-xs sm:text-[13px] text-[#475569] font-medium pt-0.5">
                {formatDate(invoice.issueDate)}
              </div>
            </div>
          </div>

          {/* 3. ITEMS TABLE */}
          <div className="mb-6 overflow-hidden rounded-xs">
            <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
              {/* Blue Table Header */}
              <thead>
                <tr
                  className="bg-[#2563eb] text-white"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  <th className="py-2.5 px-3 sm:px-4 text-center font-bold tracking-wider uppercase text-[11px] sm:text-xs w-12 border-r border-blue-400/40">
                    NO
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-left font-bold tracking-wider uppercase text-[11px] sm:text-xs border-r border-blue-400/40">
                    DESCRIPTION
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-center font-bold tracking-wider uppercase text-[11px] sm:text-xs w-16 sm:w-20 border-r border-blue-400/40">
                    QTY
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-right font-bold tracking-wider uppercase text-[11px] sm:text-xs w-24 sm:w-28 border-r border-blue-400/40">
                    PRICE
                  </th>
                  <th className="py-2.5 px-3 sm:px-4 text-right font-bold tracking-wider uppercase text-[11px] sm:text-xs w-24 sm:w-28">
                    TOTAL
                  </th>
                </tr>
              </thead>

              {/* Table Rows with Alternating Colors */}
              <tbody>
                {items.map((row, idx) => {
                  const isEven = idx % 2 === 1;
                  return (
                    <tr
                      key={idx}
                      className={isEven ? 'bg-[#e2effa]' : 'bg-white'}
                      style={{
                        backgroundColor: isEven ? '#e2effa' : '#ffffff'
                      }}
                    >
                      <td className="py-2.5 px-3 sm:px-4 text-center font-normal text-slate-700 border-r border-sky-200/50">
                        {row.no}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-left font-medium text-slate-800 border-r border-sky-200/50">
                        {row.description}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center font-normal text-slate-700 border-r border-sky-200/50">
                        {row.qty}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-normal text-slate-700 border-r border-sky-200/50 tabular-nums">
                        {formatMoney(row.price)}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-medium text-slate-900 tabular-nums">
                        {formatMoney(row.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. TOTALS SECTION */}
          <div className="flex flex-col items-end mb-8 space-y-2">
            <div className="w-full sm:w-72 space-y-1.5 text-xs sm:text-[13px] text-slate-700 pr-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Sub Total :</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-medium">Discount :</span>
                  <span className="font-semibold tabular-nums">
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
              )}

              {taxRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Tax {taxRate}% :</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(taxAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* GRAND TOTAL BLUE BANNER */}
            <div
              className="w-full sm:w-72 bg-[#2563eb] text-white px-4 py-2 sm:py-2.5 flex items-center justify-between rounded-xs"
              style={{ backgroundColor: '#2563eb' }}
            >
              <span className="font-extrabold uppercase tracking-wider text-xs sm:text-[13px]">
                GRAND TOTAL :
              </span>
              <span className="font-black text-sm sm:text-base tabular-nums">
                {formatMoney(grandTotal)}
              </span>
            </div>
          </div>

          {/* 5. PAYMENT METHOD & TERMS + SIGNATURE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 items-end">
            {/* Left: Payment Method & Terms */}
            <div className="space-y-3">
              {/* Payment Method Header Banner */}
              <div
                className="inline-block bg-[#2563eb] text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded-xs"
                style={{ backgroundColor: '#2563eb' }}
              >
                PAYMENT METHOD :
              </div>

              {/* Bank Details */}
              <div className="text-xs sm:text-[13px] text-slate-700 space-y-1 font-normal">
                <div>
                  <span className="font-medium text-slate-700">Bank Name : </span>
                  <span className="text-slate-900">{bankName}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Account Number : </span>
                  <span className="text-slate-900 font-mono">{accountNumber}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] w-60 bg-slate-300 my-2" />

              {/* Thank you & Terms */}
              <div className="space-y-1.5">
                <h4 className="text-xs sm:text-[13px] font-extrabold text-[#0f172a]">
                  Thank you for business with us!
                </h4>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 pt-1">
                  Term and Conditions :
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed max-w-sm">
                  {termsText}
                </p>
              </div>
            </div>

            {/* Right: Signature */}
            <div className="flex flex-col items-start sm:items-end sm:text-right space-y-1 sm:pr-2">
              {/* Handwritten Script Signature */}
              <div
                className="text-2xl sm:text-3xl md:text-4xl text-[#94a3b8] italic select-none"
                style={{
                  fontFamily: "'Caveat', 'Dancing Script', cursive",
                  letterSpacing: '1px'
                }}
              >
                {signatoryName}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-[#0f172a] pt-1">
                {signatoryName}
              </div>
              <div className="text-xs sm:text-[13px] font-medium text-slate-700">
                {signatoryTitle}
              </div>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM FOOTER WITH ICONS */}
        <div className="mt-12 pt-4">
          {/* Footer Line with Accent Endcaps */}
          <div className="relative mb-4">
            <div className="h-[1px] w-full bg-[#cbd5e1]" />
            <div
              className="absolute left-0 -top-[1px] h-[3px] w-14 bg-[#38bdf8] rounded-full"
              style={{ backgroundColor: '#38bdf8' }}
            />
            <div
              className="absolute right-0 -top-[1px] h-[3px] w-14 bg-[#38bdf8] rounded-full"
              style={{ backgroundColor: '#38bdf8' }}
            />
          </div>

          {/* 3 Contact Info Icons */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-600">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#38bdf8] flex items-center justify-center text-[#0284c7]">
                <Phone className="w-3 h-3 text-[#0284c7]" />
              </div>
              <span className="font-normal">{clientPhone}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#38bdf8] flex items-center justify-center text-[#0284c7]">
                <Mail className="w-3 h-3 text-[#0284c7]" />
              </div>
              <span className="font-normal">{clientEmail}</span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#38bdf8] flex items-center justify-center text-[#0284c7]">
                <MapPin className="w-3 h-3 text-[#0284c7]" />
              </div>
              <span className="font-normal">{clientAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
