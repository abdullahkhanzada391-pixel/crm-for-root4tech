import React from 'react';
import { Invoice } from '@/types/crm';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';

interface Root4TechInvoiceDocumentProps {
  invoice: Invoice;
}

/**
 * Root4TechInvoiceDocument
 * 
 * Official, print-ready commercial invoice document specifically tailored
 * for Root 4 Tech (Pvt) Ltd.
 * 
 * Specifications:
 * - Logo on top left (Root4TechLogo with company branding)
 * - Complete Pakistani & international business credentials (NTN, STRN, Bank wire)
 * - Strict compliance: Does NOT write "Paid", "Pending", or "Unpaid" on the document
 * - Targeted specifically by window.print() via #printableDocument in index.css
 */
export const Root4TechInvoiceDocument: React.FC<Root4TechInvoiceDocumentProps> = ({ invoice }) => {
  // Compute calculated line items
  const items = invoice.sections && invoice.sections.length > 0
    ? invoice.sections
    : [
        {
          id: 'def-item-1',
          title: invoice.service || 'Technology Consulting & Software Development',
          description: invoice.notes || 'Professional engineering, deployment, and milestone deliverables',
          qty: 1,
          price: invoice.subtotal || invoice.amount,
          amount: invoice.subtotal || invoice.amount
        }
      ];

  const subtotal = invoice.subtotal || items.reduce((sum, it) => sum + (it.amount || ((it.qty || 1) * (it.price || 0))), 0);
  const discountAmount = invoice.discountAmount || 0;
  const taxAmount = invoice.taxAmount || 0;
  const grandTotal = invoice.amount || (subtotal - discountAmount + taxAmount);

  return (
    <div
      id="printableDocument"
      className="w-full bg-white text-slate-800 p-6 sm:p-10 font-sans space-y-7 border border-slate-200/80 shadow-xs rounded-2xl"
    >
      {/* 1. Header: Company Info (Top Left) & Invoice Reference (Top Right) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-slate-200 pb-6">
        {/* Top Left: Root 4 Tech Branding */}
        <div className="space-y-3">
          <Root4TechLogo
            size="xl"
            showText={true}
            subtitle="Software Development & Technology Operations"
            variant="print"
          />
          <div className="text-xs text-slate-500 space-y-0.5 leading-relaxed pt-1">
            <p className="font-bold text-slate-900 text-sm">Root 4 Tech (Pvt) Ltd</p>
            <p>Suite 402, Business Avenue, Shahrah-e-Faisal</p>
            <p>Karachi, 75400, Pakistan</p>
            <p className="font-mono text-slate-600">
              NTN: 8492041-9 · STRN: 3277876123456
            </p>
            <p className="text-slate-600">
              Email: <span className="font-medium text-slate-800">billing@root4tech.com</span> · Web:{' '}
              <span className="font-medium text-slate-800">www.root4tech.com</span>
            </p>
            <p className="text-slate-600">
              Direct: <span className="font-mono text-slate-800">+92 (21) 3456-7890</span>
            </p>
          </div>
        </div>

        {/* Top Right: Invoice Metadata (NO "Paid" or "Pending") */}
        <div className="text-left sm:text-right space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            INVOICE
          </h1>
          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Invoice Number: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Issue Date: </span>
              <span className="font-semibold text-slate-800">{invoice.issueDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Payment Due: </span>
              <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Currency: </span>
              <span className="font-mono font-bold text-blue-600">PKR (Pakistani Rupee)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Billing Party & Client Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bill To Card */}
        <div className="bg-slate-50/80 rounded-xl p-4.5 border border-slate-200/80 space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Billed To (Client / Customer):
          </span>
          <div className="text-sm font-bold text-slate-900">{invoice.clientName}</div>
          {invoice.companyName && (
            <div className="text-xs font-semibold text-blue-700">{invoice.companyName}</div>
          )}
          {invoice.clientAddress && (
            <div className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
              {invoice.clientAddress}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 pt-1 font-mono text-[11px]">
            {invoice.clientEmail && <span>Email: {invoice.clientEmail}</span>}
            {invoice.clientPhone && <span>Phone: {invoice.clientPhone}</span>}
          </div>
        </div>

        {/* Project Scope / Engagement Info */}
        <div className="bg-slate-50/80 rounded-xl p-4.5 border border-slate-200/80 space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Project Engagement:
          </span>
          <div className="text-sm font-bold text-slate-900">{invoice.service}</div>
          <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
            Deliverables provisioned under Root 4 Tech professional service engagement guidelines and agreed statements of work.
          </p>
          <div className="pt-1 text-[11px] text-slate-500">
            Terms: <span className="font-medium text-slate-700">{invoice.terms || 'Net 15 Days from Date of Invoice'}</span>
          </div>
        </div>
      </div>

      {/* 3. Itemized Deliverables Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Service Description & Deliverables</th>
              <th className="py-3 px-4 text-center w-20">Qty</th>
              <th className="py-3 px-4 text-right w-36">Unit Price (PKR)</th>
              <th className="py-3 px-4 text-right w-36">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const qty = item.qty || 1;
              const price = item.price || item.amount || 0;
              const total = item.amount || qty * price;
              return (
                <tr key={item.id || index} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-center">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700 font-medium">
                    {qty}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                    PKR {price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    PKR {total.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculation Summary & Bank Settlement Details */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-1 items-start">
        {/* Left: Banking / Wire Instructions (7 cols) */}
        <div className="sm:col-span-7 bg-blue-50/50 rounded-xl p-4.5 border border-blue-100/80 space-y-2 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
            Payment & Bank Wire Settlement Instructions:
          </span>
          <div className="font-mono text-[11px] text-slate-700 space-y-1">
            <p>
              <strong className="text-slate-900">Bank Name:</strong> Meezan Bank Ltd
            </p>
            <p>
              <strong className="text-slate-900">Account Title:</strong> Root 4 Tech (Pvt) Ltd
            </p>
            <p>
              <strong className="text-slate-900">Account Number:</strong> 0102-0105829101
            </p>
            <p>
              <strong className="text-slate-900">IBAN:</strong> PK36MEZN0001020105829101
            </p>
            <p>
              <strong className="text-slate-900">Branch:</strong> Shahrah-e-Faisal Branch, Karachi, Pakistan
            </p>
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            Please include invoice number <span className="font-mono font-semibold text-slate-700">{invoice.invoiceNumber}</span> in wire transfer payment remarks.
          </p>
        </div>

        {/* Right: Calculations (5 cols) */}
        <div className="sm:col-span-5 bg-slate-50/70 rounded-xl p-4.5 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-800">
              PKR {subtotal.toLocaleString()}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-700">
              <span>Corporate Discount:</span>
              <span className="font-mono font-semibold">
                - PKR {discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Sales Tax ({invoice.taxRate || 0}%):</span>
              <span className="font-mono font-semibold text-slate-800">
                + PKR {taxAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-2.5 mt-2 flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Total Amount:
            </span>
            <span className="text-xl font-bold font-mono text-blue-700">
              PKR {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Terms, Notes & Signatory Footer */}
      <div className="border-t border-slate-200 pt-5 space-y-3 text-xs">
        {invoice.notes && (
          <div className="text-slate-600 text-[11px] leading-relaxed">
            <strong className="text-slate-800">Notes: </strong>
            {invoice.notes}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-[11px] text-slate-500">
          <div>
            Authorized Signatory: <strong className="text-slate-700">Root 4 Tech Administration</strong>
          </div>
          <div className="font-mono text-slate-400">
            Official Computer-Generated Commercial Invoice
          </div>
        </div>
      </div>
    </div>
  );
};
