import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Invoice, InvoiceSection, InvoiceStatus, Client } from '@/types/crm';
import { Root4TechInvoiceDocument } from '@/components/invoices/Root4TechInvoiceDocument';
import {
  Receipt,
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
  const metrics = useMemo(() => {
    const total = invoices.length;
    const paidList = invoices.filter((i) => i.status === 'Paid');
    const unpaidList = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Sent' || i.status === 'Draft' || i.status === 'Accepted');
    const overdueList = invoices.filter((i) => i.status === 'Overdue');

    const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
    const paidAmount = paidList.reduce((s, i) => s + i.amount, 0);
    const unpaidAmount = unpaidList.reduce((s, i) => s + i.amount, 0);
    const overdueAmount = overdueList.reduce((s, i) => s + i.amount, 0);

    return {
      totalCount: total,
      totalAmount,
      paidCount: paidList.length,
      paidAmount,
      unpaidCount: unpaidList.length,
      unpaidAmount,
      overdueCount: overdueList.length,
      overdueAmount,
    };
  }, [invoices]);

  /* ==========================================================================
     PAGE 2: FORM STATE (CREATE / EDIT INVOICE)
     ========================================================================== */
  const [formData, setFormData] = useState<{
    id?: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    selectedClientId: string;
    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    serviceTitle: string;
    items: FormItem[];
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applyTax: boolean;
    taxRate: number;
    notes: string;
    terms: string;
    paymentInstructions: string;
    status: InvoiceStatus;
  }>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    selectedClientId: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    serviceTitle: '',
    items: [
      {
        id: 'item-1',
        title: 'Full-Stack Web Application Development',
        description: 'React frontend architecture, Node.js API endpoints, and database schema setup',
        qty: 1,
        price: 25000,
      },
    ],
    discountType: 'percentage',
    discountValue: 0,
    applyTax: false,
    taxRate: 5,
    notes: 'Thank you for your business. We look forward to continuing our partnership.',
    terms: 'Payment due within 14 days of invoice receipt. Please include invoice number in wire remarks.',
    paymentInstructions: 'Meezan Bank Ltd · Account: 0102-0105829101 · Title: Root 4 Tech (Pvt) Ltd · IBAN: PK36MEZN0001020105829101',
    status: 'Unpaid',
  });

  // Open Create View
  const handleOpenCreate = () => {
    const nextNumber = `INV-2026-${String(invoices.length + 101).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setFormData({
      invoiceNumber: nextNumber,
      issueDate: today,
      dueDate: due,
      selectedClientId: '',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      serviceTitle: '',
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'Custom Software Engineering & Deployment',
          description: 'Architecture review, milestone development, and cloud provisioning',
          qty: 1,
          price: 18000,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      applyTax: false,
      taxRate: 5,
      notes: 'Thank you for partnering with Root 4 Tech. We appreciate your prompt payment.',
      terms: 'Payment due within 14 days. Please include invoice number in payment remarks.',
      paymentInstructions: 'Meezan Bank Ltd · Account: 0102-0105829101 · Title: Root 4 Tech (Pvt) Ltd · IBAN: PK36MEZN0001020105829101',
      status: 'Unpaid',
    });
    setIsEditing(false);
    setSelectedInvoice(null);
    setCurrentView('create');
  };

  // Open Edit View
  const handleOpenEdit = (inv: Invoice) => {
    const initialItems: FormItem[] =
      inv.sections && inv.sections.length > 0
        ? inv.sections.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description || '',
            qty: s.qty || 1,
            price: s.price || s.amount,
          }))
        : [
            {
              id: 'sec-1',
              title: inv.service,
              description: inv.notes || '',
              qty: 1,
              price: inv.subtotal || inv.amount,
            },
          ];

    setFormData({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      selectedClientId: '',
      clientName: inv.clientName,
      clientCompany: inv.companyName || '',
      clientEmail: inv.clientEmail || '',
      clientPhone: inv.clientPhone || '',
      clientAddress: inv.clientAddress || '',
      serviceTitle: inv.service,
      items: initialItems,
      discountType: inv.discountType || 'percentage',
      discountValue: inv.discountValue || 0,
      applyTax: !!inv.taxRate && inv.taxRate > 0,
      taxRate: inv.taxRate || 5,
      notes: inv.notes || '',
      terms: inv.terms || '',
      paymentInstructions: inv.bankName
        ? `${inv.bankName} · Account: ${inv.accountNumber || '0102-0105829101'} · Title: Root 4 Tech (Pvt) Ltd`
        : 'Meezan Bank Ltd · Account: 0102-0105829101 · Title: Root 4 Tech (Pvt) Ltd · IBAN: PK36MEZN0001020105829101',
      status: inv.status,
    });
    setIsEditing(true);
    setSelectedInvoice(inv);
    setCurrentView('create');
  };

  // Open Preview View
  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setCurrentView('preview');
  };

  // Handle Client Selection from Dropdown
  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setFormData((prev) => ({
        ...prev,
        selectedClientId: client.id,
        clientName: client.name,
        clientCompany: client.company || '',
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        clientAddress: client.country ? `${client.company}, ${client.country}` : 'Karachi, Pakistan',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedClientId: '',
      }));
    }
  };

  // Dynamic Item Handlers
  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: '',
          description: '',
          qty: 1,
          price: 0,
        },
      ],
    }));
  };

  const handleRemoveItemRow = (id: string) => {
    if (formData.items.length <= 1) {
      showToast('At least one item deliverable is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (id: string, field: keyof FormItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  // Live Calculations
  const calculatedTotals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, it) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.price) || 0;
      return sum + qty * price;
    }, 0);

    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * (Number(formData.discountValue) || 0)) / 100);
    } else {
      discountAmount = Number(formData.discountValue) || 0;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    let taxAmount = 0;
    if (formData.applyTax && formData.taxRate > 0) {
      taxAmount = Math.round((taxableAmount * Number(formData.taxRate)) / 100);
    }

    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
    };
  }, [formData.items, formData.discountType, formData.discountValue, formData.applyTax, formData.taxRate]);

  // Construct Invoice Payload from Form
  const buildInvoicePayload = (overrideStatus?: InvoiceStatus): Omit<Invoice, 'id'> => {
    const sections: InvoiceSection[] = formData.items.map((it) => ({
      id: it.id,
      title: it.title.trim() || 'Software Service Milestone',
      description: it.description.trim(),
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
      amount: (Number(it.qty) || 1) * (Number(it.price) || 0),
    }));

    return {
      invoiceNumber: formData.invoiceNumber.trim() || `INV-2026-${Date.now().toString().slice(-4)}`,
      clientName: formData.clientName.trim() || 'Valued Client',
      companyName: formData.clientCompany.trim() || formData.clientName.trim() || 'Client Company',
      clientEmail: formData.clientEmail.trim(),
      clientPhone: formData.clientPhone.trim(),
      clientAddress: formData.clientAddress.trim(),
      service: formData.serviceTitle.trim() || formData.items[0]?.title || 'Professional IT Services',
      subtotal: calculatedTotals.subtotal,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue) || 0,
      discountAmount: calculatedTotals.discountAmount,
      taxRate: formData.applyTax ? Number(formData.taxRate) || 0 : 0,
      taxAmount: calculatedTotals.taxAmount,
      amount: calculatedTotals.grandTotal,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: overrideStatus || formData.status,
      notes: formData.notes,
      terms: formData.terms,
      bankName: 'Meezan Bank Ltd',
      accountNumber: '0102-0105829101',
      sections,
    };
  };

  // Save / Generate Actions
  const handleSaveInvoice = (statusToSave: InvoiceStatus) => {
    if (!formData.clientName.trim() && !formData.clientCompany.trim()) {
      showToast('Please provide a client name or select an existing client.');
      return;
    }

    const payload = buildInvoicePayload(statusToSave);

    if (isEditing && formData.id) {
      updateInvoice(formData.id, payload);
      showToast(`Invoice "${payload.invoiceNumber}" updated successfully!`);
    } else {
      const created = addInvoice(payload);
      showToast(`Invoice "${created.invoiceNumber}" generated successfully!`);
    }

    setCurrentView('dashboard');
  };

  const handlePreviewFromForm = () => {
    const payload = buildInvoicePayload();
    const mockPreview: Invoice = {
      id: formData.id || `inv-preview-${Date.now()}`,
      ...payload,
    };
    setSelectedInvoice(mockPreview);
    setCurrentView('preview');
  };

  // Toggle Paid Status directly
  const handleTogglePaid = (inv: Invoice) => {
    if (inv.status === 'Paid') {
      unmarkInvoiceAsPaid(inv.id, 'Unpaid');
      showToast(`Invoice ${inv.invoiceNumber} status updated to Unpaid.`);
    } else {
      markInvoiceAsPaid(inv.id, 'Bank Wire Transfer');
      showToast(`Invoice ${inv.invoiceNumber} marked as Paid!`);
    }
    setActiveDropdownId(null);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      showToast(`Invoice ${invoiceToDelete.invoiceNumber} deleted.`);
      setInvoiceToDelete(null);
      if (selectedInvoice?.id === invoiceToDelete.id) {
        setCurrentView('dashboard');
        setSelectedInvoice(null);
      }
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Invoice</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete invoice{' '}
              <strong className="font-mono text-slate-900">{invoiceToDelete.invoiceNumber}</strong>{' '}
              ({invoiceToDelete.clientName})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 1: INVOICE DASHBOARD
          ========================================================================= */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Invoice Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage commercial billings, track client receivables, and issue official PKR statements
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Invoices */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Invoices
                </span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {metrics.totalCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Portfolio: <strong className="font-mono text-slate-700">PKR {metrics.totalAmount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Paid Invoices (Green) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Paid Invoices
                </span>
                <div className="text-2xl font-bold text-emerald-700 font-mono">
                  {metrics.paidCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Collected: <strong className="font-mono text-emerald-700">PKR {metrics.paidAmount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Unpaid Invoices (Orange) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Unpaid Invoices
                </span>
                <div className="text-2xl font-bold text-amber-700 font-mono">
                  {metrics.unpaidCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Pending: <strong className="font-mono text-amber-700">PKR {metrics.unpaidAmount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Overdue Invoices (Red) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Overdue Invoices
                </span>
                <div className="text-2xl font-bold text-rose-700 font-mono">
                  {metrics.overdueCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Arrears: <strong className="font-mono text-rose-700">PKR {metrics.overdueAmount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Table Container with Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by invoice #, client, company, service..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 transition"
                      title="Clear date filter"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                {(['All', 'Paid', 'Unpaid', 'Overdue', 'Draft'] as const).map((status) => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Invoice Number</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInvoices.map((inv) => {
                    const isPaid = inv.status === 'Paid';
                    const isOverdue = inv.status === 'Overdue';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Invoice Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {inv.invoiceNumber}
                        </td>

                        {/* Client Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{inv.clientName}</div>
                          {inv.companyName && (
                            <div className="text-[11px] text-slate-500">{inv.companyName}</div>
                          )}
                        </td>

                        {/* Invoice Date */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {inv.issueDate}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {inv.dueDate}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          PKR {inv.amount.toLocaleString()}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                            />
                            {inv.status}
                          </span>
                        </td>

                        {/* Three-Dot Dropdown Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="relative inline-block text-left invoice-action-menu">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === inv.id ? null : inv.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeDropdownId === inv.id && (
                              <div
                                className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleOpenPreview(inv);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 hover:text-blue-700 flex items-center gap-2.5 font-medium transition"
                                  >
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    <span>View Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenEdit(inv);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-700 transition"
                                  >
                                    <Edit2 className="w-4 h-4 text-indigo-600" />
                                    <span>Edit Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenPreview(inv);
                                      setActiveDropdownId(null);
                                      setTimeout(() => window.print(), 300);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-700 transition"
                                  >
                                    <Printer className="w-4 h-4 text-slate-600" />
                                    <span>Print Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenPreview(inv);
                                      setActiveDropdownId(null);
                                      setTimeout(() => window.print(), 300);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-700 transition"
                                  >
                                    <Download className="w-4 h-4 text-slate-600" />
                                    <span>Download PDF</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => handleTogglePaid(inv)}
                                    className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 font-medium transition ${
                                      isPaid ? 'hover:bg-amber-50 text-amber-700' : 'hover:bg-emerald-50 text-emerald-700'
                                    }`}
                                  >
                                    {isPaid ? (
                                      <>
                                        <RotateCcw className="w-4 h-4 text-amber-600" />
                                        <span>Mark as Unpaid</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>Mark as Paid</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setInvoiceToDelete(inv);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 font-medium transition"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                    <span>Delete Invoice</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-300" />
                          <p className="text-sm font-semibold text-slate-700">No invoices found</p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your search criteria or create a new invoice.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-semibold text-slate-800">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
          PAGE 2: CREATE / EDIT INVOICE FORM
          ========================================================================= */}
      {currentView === 'create' && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices</span>
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <div className="w-20" />
          </div>

          <div className="space-y-6">
            {/* Section 1: Invoice Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                <span>Invoice Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Existing Client</label>
                  <select
                    value={formData.selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="">-- Choose Existing Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Client Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                <span>Client Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mansour"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aura Payment Solutions"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                  <input
                    type="text"
                    placeholder="Suite / Floor, Street Address, City, Country"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Invoice Items */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Invoice Items & Deliverables</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item Row</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          #{index + 1}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5 space-y-1">
                          <label className="font-semibold text-slate-700">Service / Product Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Backend API Development"
                            value={item.title}
                            onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="font-semibold text-slate-700">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-4 space-y-1">
                          <label className="font-semibold text-slate-700">Unit Price (PKR)</label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-9 space-y-1">
                          <label className="font-semibold text-slate-500 text-[11px]">Description (optional)</label>
                          <input
                            type="text"
                            placeholder="Detailed scope description..."
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-3 flex flex-col justify-end text-right">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item Total:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            PKR {lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Payment Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                <span>Payment Summary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Adjustments: Discount & Tax */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <span className="font-semibold text-slate-800 block">Apply Discount:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (PKR)</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Math.max(0, parseFloat(e.target.value) || 0) })}
                        placeholder="Discount value"
                        className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.applyTax}
                        onChange={(e) => setFormData({ ...formData, applyTax: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">Apply Sales Tax (optional)</span>
                    </label>

                    {formData.applyTax && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-slate-500">Tax Rate:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.taxRate}
                          onChange={(e) => setFormData({ ...formData, taxRate: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none"
                        />
                        <span className="font-semibold text-slate-600">%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Calculation Box */}
                <div className="bg-slate-50/80 rounded-xl p-4.5 border border-slate-200/80 space-y-2.5 justify-between flex flex-col">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        PKR {calculatedTotals.subtotal.toLocaleString()}
                      </span>
                    </div>

                    {calculatedTotals.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="font-mono font-semibold">
                          - PKR {calculatedTotals.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {calculatedTotals.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Sales Tax ({formData.taxRate}%):</span>
                        <span className="font-mono font-semibold text-slate-800">
                          + PKR {calculatedTotals.taxAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                    <span className="text-2xl font-bold font-mono text-blue-600">
                      PKR {calculatedTotals.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Additional Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">5</span>
                <span>Additional Information</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Instructions</label>
                  <textarea
                    rows={2}
                    value={formData.paymentInstructions}
                    onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveInvoice('Draft')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={handlePreviewFromForm}
                  className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                >
                  Preview Invoice
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveInvoice('Unpaid')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: INVOICE PREVIEW (USES Root4TechInvoiceDocument)
          ========================================================================= */}
      {currentView === 'preview' && selectedInvoice && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          {/* Top Preview Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenEdit(selectedInvoice)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Render the Official Root 4 Tech Invoice Layout (NO Paid or Pending written on it) */}
          <Root4TechInvoiceDocument invoice={selectedInvoice} />
        </div>
      )}
    </div>
  );
};
