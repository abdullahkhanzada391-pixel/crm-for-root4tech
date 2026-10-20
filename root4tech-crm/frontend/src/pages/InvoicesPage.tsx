import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Invoice, InvoiceSection, InvoiceStatus, Client } from '@/types/crm';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
  Building,
  Mail,
  Phone,
  MapPin,
  Percent,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Layers
} from 'lucide-react';

interface FormItem {
  id: string;
  title: string;
  description: string;
  qty: number;
  price: number;
}

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    markInvoiceAsPaid,
    unmarkInvoiceAsPaid,
    deleteInvoice
  } = useCRM();

  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation View: 'dashboard' (Page 1) | 'create' (Page 2) | 'preview' (Page 3)
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'preview'>('dashboard');

  // Selected invoice for Preview or Edit
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Active Dropdown state (row ID)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.invoice-action-menu')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Listen for query parameter e.g. /invoices?action=new
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  /* ==========================================================================
     PAGE 1: FILTERS, SEARCH & PAGINATION
     ========================================================================== */
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.clientName.toLowerCase().includes(query) ||
        inv.companyName.toLowerCase().includes(query) ||
        inv.service.toLowerCase().includes(query);

      // Status
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      // Dates
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && inv.issueDate >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && inv.issueDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, statusFilter, startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  // Summary Cards Calculations
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    const paidInvoices = invoices.filter((i) => i.status === 'Paid');
    const paidCount = paidInvoices.length;
    const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Sent' || i.status === 'Accepted');
    const unpaidCount = unpaidInvoices.length;
    const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      totalCount,
      totalAmount,
      paidCount,
      paidAmount,
      unpaidCount,
      unpaidAmount,
      overdueCount,
      overdueAmount
    };
  }, [invoices]);

  /* ==========================================================================
     PAGE 2: FORM STATE (CREATE / EDIT)
     ========================================================================== */
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('custom');

  // Client Details
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // Items
  const [formItems, setFormItems] = useState<FormItem[]>([
    { id: 'item-1', title: '', description: '', qty: 1, price: 0 }
  ]);

  // Payment Summary
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formIncludeTax, setFormIncludeTax] = useState(false);
  const [formTaxRate, setFormTaxRate] = useState<number>(15);

  // Additional Information
  const [formPaymentInstructions, setFormPaymentInstructions] = useState(
    'Bank: Meezan Bank Ltd · Account Title: Root 4 Tech\nAccount Number: 0102-0105829101 · IBAN: PK36MEZN0001020105829101\nBranch: Main Enterprise Banking Branch, Karachi'
  );
  const [formNotes, setFormNotes] = useState(
    'Thank you for partnering with Root 4 Tech. Please quote your invoice number on wire transfers.'
  );
  const [formTerms, setFormTerms] = useState(
    'Payment is due within 21 days of invoice date. All deliverables are subject to standard enterprise SLA terms.'
  );

  // Generate Next Sequential Invoice Number
  const getNextInvoiceNumber = () => {
    const existingNums = invoices
      .map((inv) => {
        const match = inv.invoiceNumber.match(/INV-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = existingNums.length > 0 ? Math.max(...existingNums) : 100;
    return `INV-2025-${max + 1}`;
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedInvoice(null);
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormInvoiceNumber(getNextInvoiceNumber());
    setFormIssueDate(today);
    setFormDueDate(due);
    setSelectedClientId('custom');
    setFormCompanyName('');
    setFormClientName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormItems([{ id: `item-${Date.now()}`, title: '', description: '', qty: 1, price: 0 }]);
    setFormDiscountType('percentage');
    setFormDiscountValue(0);
    setFormIncludeTax(false);
    setFormTaxRate(15);
    setFormPaymentInstructions(
      'Bank: Meezan Bank Ltd · Account Title: Root 4 Tech\nAccount Number: 0102-0105829101 · IBAN: PK36MEZN0001020105829101\nBranch: Main Enterprise Banking Branch, Karachi'
    );
    setFormNotes('Thank you for partnering with Root 4 Tech. Please quote your invoice number on wire transfers.');
    setFormTerms('Payment is due within 21 days of invoice date. All deliverables are subject to standard enterprise SLA terms.');

    setCurrentView('create');
  };

  // Open Edit Form
  const handleOpenEdit = (inv: Invoice) => {
    setIsEditing(true);
    setSelectedInvoice(inv);

    setFormInvoiceNumber(inv.invoiceNumber);
    setFormIssueDate(inv.issueDate);
    setFormDueDate(inv.dueDate);

    // Check if client matches an existing client
    const matchedClient = clients.find((c) => c.company.toLowerCase() === inv.companyName.toLowerCase());
    setSelectedClientId(matchedClient ? matchedClient.id : 'custom');

    setFormCompanyName(inv.companyName || '');
    setFormClientName(inv.clientName || '');
    setFormEmail(inv.clientEmail || '');
    setFormPhone(inv.clientPhone || '');
    setFormAddress(inv.clientAddress || '');

    // Items
    if (inv.sections && inv.sections.length > 0) {
      setFormItems(
        inv.sections.map((sec, idx) => ({
          id: sec.id || `sec-${idx}`,
          title: sec.title || '',
          description: sec.description || '',
          qty: sec.qty || 1,
          price: sec.price || sec.amount || 0
        }))
      );
    } else {
      setFormItems([
        {
          id: 'item-1',
          title: inv.service || 'Software Development Deliverable',
          description: '',
          qty: 1,
          price: inv.subtotal || inv.amount || 0
        }
      ]);
    }

    // Discount
    setFormDiscountType(inv.discountType || 'percentage');
    setFormDiscountValue(inv.discountValue || 0);

    // Tax
    if (inv.taxRate && inv.taxRate > 0) {
      setFormIncludeTax(true);
      setFormTaxRate(inv.taxRate);
    } else {
      setFormIncludeTax(false);
      setFormTaxRate(15);
    }

    setFormPaymentInstructions(
      inv.bankName && inv.accountNumber
        ? `Bank: ${inv.bankName} · Account Title: Root 4 Tech\nAccount Number: ${inv.accountNumber} · IBAN: PK36MEZN0001020105829101\nBranch: Main Enterprise Banking Branch, Karachi`
        : 'Bank: Meezan Bank Ltd · Account Title: Root 4 Tech\nAccount Number: 0102-0105829101 · IBAN: PK36MEZN0001020105829101\nBranch: Main Enterprise Banking Branch, Karachi'
    );
    setFormNotes(inv.notes || 'Thank you for partnering with Root 4 Tech. Please quote your invoice number on wire transfers.');
    setFormTerms(inv.terms || 'Payment is due within 21 days of invoice date. All deliverables are subject to standard enterprise SLA terms.');

    setCurrentView('create');
  };

  // Client Selection Change
  const handleClientSelectChange = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'custom') {
      return;
    }
    const c = clients.find((item) => item.id === clientId);
    if (c) {
      setFormCompanyName(c.company);
      setFormClientName(c.name);
      setFormEmail(c.email);
      setFormPhone(c.phone || '+92 300 1234567');
      setFormAddress(c.country ? `${c.country}` : 'Enterprise Client Business Address');
    }
  };

  // Dynamic Item Row helpers
  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, title: '', description: '', qty: 1, price: 0 }
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FormItem, value: any) => {
    setFormItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: value };
        }
        return it;
      })
    );
  };

  // Financial Calculations for Form
  const calculatedSubtotal = useMemo(() => {
    return formItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  }, [formItems]);

  const calculatedDiscountAmount = useMemo(() => {
    const val = Number(formDiscountValue) || 0;
    if (val <= 0) return 0;
    if (formDiscountType === 'percentage') {
      return Math.round((calculatedSubtotal * Math.min(val, 100)) / 100);
    }
    return Math.min(val, calculatedSubtotal);
  }, [calculatedSubtotal, formDiscountType, formDiscountValue]);

  const subtotalAfterDiscount = Math.max(0, calculatedSubtotal - calculatedDiscountAmount);

  const calculatedTaxAmount = useMemo(() => {
    if (!formIncludeTax) return 0;
    const rate = Number(formTaxRate) || 0;
    if (rate <= 0) return 0;
    return Math.round((subtotalAfterDiscount * rate) / 100);
  }, [formIncludeTax, formTaxRate, subtotalAfterDiscount]);

  const calculatedGrandTotal = subtotalAfterDiscount + calculatedTaxAmount;

  // Build Invoice Object from Form
  const buildInvoiceFromForm = (status: InvoiceStatus): Invoice => {
    const mainService = formItems[0]?.title || 'Professional Technology Operations';
    const sections: InvoiceSection[] = formItems.map((it, idx) => ({
      id: it.id || `sec-${idx}`,
      title: it.title || `Deliverable #${idx + 1}`,
      description: it.description,
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
      amount: (Number(it.qty) || 1) * (Number(it.price) || 0)
    }));

    return {
      id: isEditing && selectedInvoice ? selectedInvoice.id : `inv-${Date.now()}`,
      invoiceNumber: formInvoiceNumber.trim() || getNextInvoiceNumber(),
      clientName: formClientName.trim() || 'Valued Client',
      companyName: formCompanyName.trim() || 'Client Organization',
      clientEmail: formEmail.trim(),
      clientPhone: formPhone.trim(),
      clientAddress: formAddress.trim(),
      service: mainService,
      subtotal: calculatedSubtotal,
      discountType: formDiscountValue > 0 ? formDiscountType : undefined,
      discountValue: formDiscountValue > 0 ? formDiscountValue : undefined,
      discountAmount: calculatedDiscountAmount > 0 ? calculatedDiscountAmount : undefined,
      taxRate: formIncludeTax ? formTaxRate : 0,
      taxAmount: calculatedTaxAmount > 0 ? calculatedTaxAmount : 0,
      amount: calculatedGrandTotal,
      issueDate: formIssueDate || new Date().toISOString().split('T')[0],
      dueDate: formDueDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: status,
      bankName: 'Meezan Bank Ltd',
      accountNumber: '0102-0105829101',
      terms: formTerms,
      notes: formNotes,
      sections
    };
  };

  // Form Submit Handlers
  const handleSaveInvoice = (status: InvoiceStatus) => {
    if (!formCompanyName.trim()) {
      showToast('Please provide a Client / Company Name.');
      return;
    }
    if (formItems.some((it) => !it.title.trim())) {
      showToast('Please fill in service names for all item rows.');
      return;
    }

    const invoiceData = buildInvoiceFromForm(status);

    if (isEditing && selectedInvoice) {
      updateInvoice(selectedInvoice.id, invoiceData);
      showToast(`Invoice ${invoiceData.invoiceNumber} updated successfully.`);
      setSelectedInvoice(invoiceData);
      setCurrentView('preview');
    } else {
      addInvoice(invoiceData);
      showToast(`Invoice ${invoiceData.invoiceNumber} created successfully.`);
      setSelectedInvoice(invoiceData);
      setCurrentView('preview');
    }
  };

  const handlePreviewFromForm = () => {
    if (!formCompanyName.trim()) {
      showToast('Please enter a Client or Company Name to preview.');
      return;
    }
    const tempInv = buildInvoiceFromForm(isEditing && selectedInvoice ? selectedInvoice.status : 'Draft');
    setSelectedInvoice(tempInv);
    setCurrentView('preview');
  };

  /* ==========================================================================
     PAGE 3: PREVIEW & ACTIONS
     ========================================================================== */
  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setCurrentView('preview');
  };

  const handleTogglePaidStatus = (inv: Invoice) => {
    if (inv.status === 'Paid') {
      unmarkInvoiceAsPaid(inv.id, 'Unpaid');
      showToast(`Invoice ${inv.invoiceNumber} reverted to Unpaid.`);
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice({ ...inv, status: 'Unpaid' });
      }
    } else {
      markInvoiceAsPaid(inv.id, 'Bank Wire Transfer');
      showToast(`Invoice ${inv.invoiceNumber} marked as Paid!`);
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice({ ...inv, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] });
      }
    }
  };

  const handleDeleteInvoiceConfirm = () => {
    if (!invoiceToDelete) return;
    deleteInvoice(invoiceToDelete.id);
    showToast(`Invoice ${invoiceToDelete.invoiceNumber} has been deleted.`);
    setInvoiceToDelete(null);
    if (currentView === 'preview') {
      setCurrentView('dashboard');
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  // Helper badge color
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Unpaid':
      case 'Sent':
      case 'Accepted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete Invoice</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete invoice{' '}
                  <strong className="text-slate-800">{invoiceToDelete.invoiceNumber}</strong> for{' '}
                  <strong className="text-slate-800">{invoiceToDelete.companyName}</strong> (PKR{' '}
                  {invoiceToDelete.amount.toLocaleString()})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteInvoiceConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: INVOICE DASHBOARD
          ========================================================================= */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Invoices</h1>
              <p className="text-xs text-slate-500 mt-1">
                Monitor billing cycles, issue itemized invoices in PKR, and track customer receipts
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invoices */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalCount}</div>
                <div className="text-xs font-semibold text-blue-600 font-mono">
                  PKR {stats.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Paid Invoices (Green) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Paid Invoices</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.paidCount}</div>
                <div className="text-xs font-semibold text-emerald-600 font-mono">
                  PKR {stats.paidAmount.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Unpaid Invoices (Orange) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Unpaid Invoices</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.unpaidCount}</div>
                <div className="text-xs font-semibold text-amber-600 font-mono">
                  PKR {stats.unpaidAmount.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Overdue Invoices (Red) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Overdue Invoices</span>
                <div className="text-2xl font-extrabold text-slate-900">{stats.overdueCount}</div>
                <div className="text-xs font-semibold text-rose-600 font-mono">
                  PKR {stats.overdueAmount.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filters Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number, client, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="All">All Payment Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="md:col-span-4 flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600"
                    title="From Date"
                  />
                </div>
                <span className="text-slate-400 text-xs">to</span>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600"
                    title="To Date"
                  />
                </div>
                {(startDate || endDate || statusFilter !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition shrink-0"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* All Invoices Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-4">Invoice Number</th>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Invoice Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Invoice Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenPreview(inv)}
                          className="hover:underline focus:outline-none"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>

                      {/* Client Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.clientName}</div>
                        <div className="text-[11px] text-slate-500">{inv.companyName}</div>
                      </td>

                      {/* Invoice Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{inv.issueDate}</td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{inv.dueDate}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        PKR {inv.amount.toLocaleString()}
                      </td>

                      {/* Payment Status (Green for Paid, orange for Unpaid, red for Overdue) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      {/* Actions: Three-dot dropdown */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left invoice-action-menu">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === inv.id ? null : inv.id);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              activeDropdownId === inv.id
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent hover:border-slate-200'
                            }`}
                            title="Invoice Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdownId === inv.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenPreview(inv);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenEdit(inv);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenPreview(inv);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Download PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenPreview(inv);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Print Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleTogglePaidStatus(inv);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2.5 font-medium transition"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{inv.status === 'Paid' ? 'Revert to Unpaid' : 'Mark as Paid'}</span>
                              </button>

                              <div className="border-t border-slate-100 my-1"></div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setInvoiceToDelete(inv);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 font-medium transition"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Invoice</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No invoices found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try adjusting your search query, status, or date range filters.
                        </p>
                        <button
                          onClick={handleOpenCreate}
                          className="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          Create New Invoice
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredInvoices.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-800">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> invoices
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CREATE / EDIT INVOICE (PAGE 2)
          ========================================================================= */}
      {currentView === 'create' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Bar with Navigation Back */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                title="Back to Invoices Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Invoices / {isEditing ? 'Edit Invoice' : 'New Invoice'}
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isEditing ? `Edit Invoice: ${formInvoiceNumber}` : 'Create Customer Invoice'}
                </h1>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('Draft')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handlePreviewFromForm}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('Unpaid')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                Generate Invoice
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* 1. INVOICE INFORMATION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>1. Invoice Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={formInvoiceNumber}
                      onChange={(e) => setFormInvoiceNumber(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invoice Date *</label>
                    <input
                      type="date"
                      required
                      value={formIssueDate}
                      onChange={(e) => setFormIssueDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Select Existing Client */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Existing Client</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/70 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="custom">+ New / Custom Client (Enter manually below)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} — {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. CLIENT INFORMATION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>2. Client Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Strata Engineering Group"
                      value={formCompanyName}
                      onChange={(e) => setFormCompanyName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Client Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chloe Bennett"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="c.bennett@strataengineering.com.au"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+61 2 9876 5432"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                    <textarea
                      rows={2}
                      placeholder="Street, Suite/Floor, City, Postal Code, Country"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. INVOICE ITEMS */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>3. Invoice Items & Deliverables</span>
                  </h2>

                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Item #{idx + 1}
                        </span>
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition"
                            title="Remove this item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5">
                          <label className="block font-semibold text-slate-600 mb-1">
                            Service / Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cloud Infrastructure Setup"
                            value={item.title}
                            onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-7">
                          <label className="block font-semibold text-slate-600 mb-1">
                            Description (Scope / Specification)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. AWS VPC networking, Kubernetes ingress & CI/CD deployment"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block font-semibold text-slate-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10) || 1)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white font-mono focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block font-semibold text-slate-600 mb-1">Unit Price (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white font-mono focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block font-semibold text-slate-600 mb-1">Item Total (PKR)</label>
                          <div className="h-8 px-3 rounded-lg border border-slate-200 bg-slate-100/70 font-mono font-bold text-slate-900 flex items-center justify-between">
                            <span>PKR</span>
                            <span>{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. ADDITIONAL INFORMATION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>5. Payment Instructions & Terms</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Instructions</label>
                    <textarea
                      rows={3}
                      value={formPaymentInstructions}
                      onChange={(e) => setFormPaymentInstructions(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invoice Notes</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Terms and Conditions</label>
                    <textarea
                      rows={2}
                      value={formTerms}
                      onChange={(e) => setFormTerms(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PAYMENT SUMMARY (SIDEBAR) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 sticky top-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>4. Payment Summary</span>
                </h2>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {calculatedSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Discount */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Apply Discount</span>
                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setFormDiscountType('percentage')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          formDiscountType === 'percentage'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormDiscountType('fixed')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          formDiscountType === 'fixed'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PKR
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={formDiscountType === 'percentage' ? 100 : undefined}
                      placeholder={formDiscountType === 'percentage' ? 'e.g. 10' : 'e.g. 5000'}
                      value={formDiscountValue || ''}
                      onChange={(e) => setFormDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {calculatedDiscountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                      <span>Discount Deduction:</span>
                      <span>-PKR {calculatedDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Optional Tax */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formIncludeTax}
                        onChange={(e) => setFormIncludeTax(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Include Tax (Optional)</span>
                    </label>

                    {formIncludeTax && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={formTaxRate}
                          onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-14 h-7 px-1.5 text-center rounded border border-slate-200 text-xs font-mono font-bold"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    )}
                  </div>

                  {formIncludeTax && calculatedTaxAmount > 0 && (
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Tax Amount ({formTaxRate}%):</span>
                      <span className="font-mono text-slate-800">
                        +PKR {calculatedTaxAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2 border-slate-200/90 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase font-extrabold text-slate-700">Grand Total:</span>
                    <span className="text-xl font-extrabold font-mono text-blue-600">
                      PKR {calculatedGrandTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Total payable balance in Pakistani Rupees</p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSaveInvoice('Unpaid')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-98"
                  >
                    Generate Invoice
                  </button>

                  <button
                    type="button"
                    onClick={handlePreviewFromForm}
                    className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveInvoice('Draft')}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: INVOICE PREVIEW (PAGE 3)
          ========================================================================= */}
      {currentView === 'preview' && selectedInvoice && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                title="Back to Invoices Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Invoices / Preview
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 font-mono">
                    {selectedInvoice.invoiceNumber}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedInvoice)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePaidStatus(selectedInvoice)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedInvoice.status === 'Paid' ? 'Revert to Unpaid' : 'Mark as Paid'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                title="Download or Save as PDF"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="w-full flex justify-center py-2 sm:py-6 overflow-x-auto">
            <div
              id="printableDocument"
              className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8 text-slate-800 overflow-hidden"
            >
              {/* Official Paid Watermark Stamp */}
              {selectedInvoice.status === 'Paid' && (
                <div className="absolute right-8 top-20 z-10 pointer-events-none select-none">
                  <div className="border-4 border-emerald-600/90 rounded-2xl px-6 py-2.5 rotate-[-12deg] bg-emerald-50/90 shadow-sm text-center">
                    <div className="text-xl font-black tracking-widest text-emerald-700 uppercase font-mono">
                      ★ PAID ★
                    </div>
                    <div className="text-[10px] font-bold text-emerald-800 tracking-tight font-mono">
                      ROOT 4 TECH FINANCIALS
                    </div>
                    <div className="text-[9px] font-mono text-emerald-700">
                      {selectedInvoice.paidDate || selectedInvoice.issueDate} ·{' '}
                      {selectedInvoice.paymentMethod || 'Bank Wire Transfer'}
                    </div>
                  </div>
                </div>
              )}

              {/* Document Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
                <div>
                  <Root4TechLogo
                    size="lg"
                    showText={true}
                    subtitle="Software Development & Technology Operations"
                    variant="print"
                  />
                  <p className="text-xs text-slate-500 font-mono mt-1.5">
                    NTN: 8492041-9 · billing@root4tech.com · www.root4tech.com
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <h2 className="text-2xl font-black font-mono text-blue-600 tracking-tight">
                    TAX INVOICE
                  </h2>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Client & Date Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Billed To:
                  </span>
                  <div className="text-base font-bold text-slate-900">{selectedInvoice.companyName}</div>
                  <div className="text-slate-700 font-medium">{selectedInvoice.clientName}</div>
                  {selectedInvoice.clientEmail && (
                    <div className="text-slate-500 font-mono">{selectedInvoice.clientEmail}</div>
                  )}
                  {selectedInvoice.clientPhone && (
                    <div className="text-slate-500 font-mono">{selectedInvoice.clientPhone}</div>
                  )}
                  {selectedInvoice.clientAddress && (
                    <div className="text-slate-500 leading-relaxed mt-1">
                      {selectedInvoice.clientAddress}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right space-y-1.5">
                  <div>
                    <span className="text-slate-400">Date Issued: </span>
                    <span className="font-semibold text-slate-800">{selectedInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Due: </span>
                    <span className="font-bold text-slate-900">{selectedInvoice.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Currency: </span>
                    <span className="font-mono font-bold text-slate-900">PKR (Pakistani Rupee)</span>
                  </div>
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Service & Deliverable Description</th>
                      <th className="py-2.5 px-4 text-center w-16">Qty</th>
                      <th className="py-2.5 px-4 text-right w-28">Unit Price (PKR)</th>
                      <th className="py-2.5 px-4 text-right w-32">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.sections && selectedInvoice.sections.length > 0 ? (
                      selectedInvoice.sections.map((sec, idx) => (
                        <tr key={sec.id || idx}>
                          <td className="py-3 px-4 font-mono text-slate-400 text-center font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{sec.title}</div>
                            {sec.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {sec.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">
                            {sec.qty || 1}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {((sec.price ?? (sec.amount / (sec.qty || 1))) || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            PKR {sec.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 px-4 font-mono text-slate-400 text-center font-bold">1</td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {selectedInvoice.service}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">1</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {selectedInvoice.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          PKR {selectedInvoice.amount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Bank Wire Instructions (PKR):</span>
                  <p className="font-mono text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                    Bank: {selectedInvoice.bankName || 'Meezan Bank Ltd'} · Account: {selectedInvoice.accountNumber || '0102-0105829101'}
                    <br />
                    IBAN: PK36MEZN0001020105829101 · Currency: PKR
                  </p>
                </div>

                <div className="w-full sm:w-64 border-t sm:border-t-0 pt-2 sm:pt-0 space-y-1.5 font-mono text-right">
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Subtotal:</span>
                    <span>
                      PKR{' '}
                      {(
                        selectedInvoice.subtotal ||
                        (selectedInvoice.discountAmount
                          ? selectedInvoice.amount + selectedInvoice.discountAmount
                          : selectedInvoice.amount)
                      ).toLocaleString()}
                    </span>
                  </div>

                  {selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-xs">
                      <span>
                        Discount{' '}
                        {selectedInvoice.discountType === 'percentage'
                          ? `(${selectedInvoice.discountValue}%)`
                          : ''}
                        :
                      </span>
                      <span>-PKR {selectedInvoice.discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedInvoice.taxAmount && selectedInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Tax ({selectedInvoice.taxRate}%):</span>
                      <span>+PKR {selectedInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline font-bold">
                    <span className="text-xs uppercase text-slate-800 font-sans">Grand Total:</span>
                    <span className="text-base text-blue-600 font-bold">
                      PKR {selectedInvoice.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(selectedInvoice.notes || selectedInvoice.terms) && (
                <div className="space-y-3 pt-2 text-xs">
                  {selectedInvoice.notes && (
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">Notes:</span>
                      <p className="leading-relaxed">{selectedInvoice.notes}</p>
                    </div>
                  )}

                  {selectedInvoice.terms && (
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-slate-500 text-[11px]">
                      <span className="font-bold text-slate-700 block mb-0.5">Terms and Conditions:</span>
                      <p className="leading-relaxed">{selectedInvoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Document Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
                <span>Root 4 Tech — Enterprise Software & Cloud Infrastructure</span>
                <span className="font-semibold text-slate-600">
                  Authorized Financial Department
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
