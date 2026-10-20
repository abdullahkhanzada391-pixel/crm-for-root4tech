import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Invoice, InvoiceSection, InvoiceStatus, PaidInvoicePdfAttachment } from '@/types/crm';
import { exportToCsv } from '@/utils/exportCsv';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  Printer,
  X,
  CreditCard,
  Building,
  DollarSign,
  Edit2,
  AlertCircle,
  Clock,
  Send,
  Calendar,
  Sparkles,
  Layers,
  PlusCircle,
  Tag,
  Percent,
  BadgePercent,
  Download,
  RotateCcw,
  UploadCloud,
  Paperclip,
  FileText,
  FileCheck,
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';
import { StudioInvoiceDocument } from '@/components/invoices/StudioInvoiceDocument';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    markInvoiceAsPaid,
    unmarkInvoiceAsPaid,
    deleteInvoice,
    restoreInvoice,
    attachPaidPdfToInvoice,
    removePaidPdfFromInvoice
  } = useCRM();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // URL search parameter listener
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    const actionParam = searchParams.get('action');
    if (actionParam === 'new') {
      openAddModal();
    }
  }, [searchParams]);


  // Modals & Collapsible Section States
  const [pageViewMode, setPageViewMode] = useState<'document' | 'list'>('document');
  const [docCurrency, setDocCurrency] = useState<string>('$');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [autoPrintAfterSave, setAutoPrintAfterSave] = useState(true);

  // Table Row Action Dropdown Menu State
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenActionDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);


  // Undo Action History State
  interface UndoItem {
    id: string;
    type: 'delete' | 'mark_paid' | 'change_price' | 'edit' | 'status_change';
    title: string;
    invoice: Invoice;
    previousData?: Partial<Invoice>;
    timestamp: number;
  }
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);

  // Paid Invoice PDF Attachment State
  const [attachingPdfInvoice, setAttachingPdfInvoice] = useState<Invoice | null>(null);
  const [pdfUploadFile, setPdfUploadFile] = useState<File | null>(null);
  const [pdfUploadDataUrl, setPdfUploadDataUrl] = useState<string | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [isPdfDragActive, setIsPdfDragActive] = useState<boolean>(false);
  const [autoMarkPaidOnAttach, setAutoMarkPaidOnAttach] = useState<boolean>(true);

  // Ctrl+Z Undo Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeElem = document.activeElement;
        const isInputField = activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA');
        if (!isInputField && undoStack.length > 0) {
          e.preventDefault();
          handleExecuteUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  const pushUndo = (item: Omit<UndoItem, 'id' | 'timestamp'>) => {
    const newItem: UndoItem = {
      ...item,
      id: `undo-${Date.now()}`,
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev.slice(-9), newItem]);
  };

  const handleExecuteUndo = () => {
    if (undoStack.length === 0) return;
    const item = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    if (item.type === 'delete') {
      restoreInvoice(item.invoice);
      showToast(`Restored Invoice "${item.invoice.invoiceNumber}"!`);
    } else if (item.type === 'mark_paid') {
      unmarkInvoiceAsPaid(item.invoice.id);
      showToast(`Reverted "${item.invoice.invoiceNumber}" back to Unpaid.`);
    } else if (item.type === 'change_price' || item.type === 'edit') {
      if (item.previousData) {
        updateInvoice(item.invoice.id, item.previousData);
        showToast(`Reverted changes for "${item.invoice.invoiceNumber}".`);
      }
    } else if (item.type === 'status_change') {
      if (item.previousData?.status) {
        const revertTo = item.previousData.status as InvoiceStatus;
        if (revertTo === 'Paid') {
          markInvoiceAsPaid(item.invoice.id, item.invoice.paymentMethod || 'Bank Wire Transfer');
        } else {
          if (item.invoice.status === 'Paid') {
            unmarkInvoiceAsPaid(item.invoice.id, revertTo);
          } else {
            updateInvoice(item.invoice.id, { status: revertTo });
          }
        }
        showToast(`Reverted "${item.invoice.invoiceNumber}" status back to ${revertTo}.`);
      }
    }
  };

  const openPdfAttachmentModal = (inv: Invoice) => {
    setAttachingPdfInvoice(inv);
    setPdfUploadFile(null);
    setPdfUploadDataUrl(null);
    setPdfUploadError(null);
    setAutoMarkPaidOnAttach(inv.status !== 'Paid');
  };

  const handleProcessPdfFile = (file: File) => {
    setPdfUploadError(null);
    const isValidType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || file.type.startsWith('image/');
    if (!isValidType) {
      setPdfUploadError('Please select a valid PDF document or payment receipt image (.pdf, .png, .jpg).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setPdfUploadError('File is too large. Maximum supported size is 15MB.');
      return;
    }

    setPdfUploadFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfUploadDataUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setPdfUploadError('Failed to read file contents.');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaidPdfAttachment = () => {
    if (!attachingPdfInvoice || !pdfUploadFile || !pdfUploadDataUrl) return;

    attachPaidPdfToInvoice(attachingPdfInvoice.id, {
      name: pdfUploadFile.name,
      size: pdfUploadFile.size,
      dataUrl: pdfUploadDataUrl,
      uploadedAt: new Date().toLocaleString()
    });

    if (autoMarkPaidOnAttach && attachingPdfInvoice.status !== 'Paid') {
      markInvoiceAsPaid(attachingPdfInvoice.id, 'Bank Wire Transfer');
    }

    showToast(`Paid Invoice PDF attached to "${attachingPdfInvoice.invoiceNumber}"!`);
    setAttachingPdfInvoice(null);
  };

  const handleDownloadAttachedPdf = (inv: Invoice) => {
    if (!inv.paidPdfAttachment) return;
    const link = document.createElement('a');
    link.href = inv.paidPdfAttachment.dataUrl;
    link.download = inv.paidPdfAttachment.name || `${inv.invoiceNumber}_PAID_RECEIPT.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded attached PDF receipt for "${inv.invoiceNumber}".`);
  };

  // Form State
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('85000');
  const [basePrice, setBasePrice] = useState('85000');
  const [isManualPrice, setIsManualPrice] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('Unpaid');
  const [notes, setNotes] = useState('Bank: Meezan Bank Ltd · Account: 0102-0105829101 · IBAN: PK36MEZN0001020105829101 · Currency: PKR');

  // Quick Price & Discount Modal State (Table Row Action)
  const [priceDiscountModalInvoice, setPriceDiscountModalInvoice] = useState<Invoice | null>(null);
  const [quickBasePrice, setQuickBasePrice] = useState<string>('');
  const [quickHasDiscount, setQuickHasDiscount] = useState<boolean>(false);
  const [quickDiscountType, setQuickDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [quickDiscountValue, setQuickDiscountValue] = useState<string>('0');

  // Multi-Section Breakdown State
  const [sections, setSections] = useState<InvoiceSection[]>([
    {
      id: 'sec-1',
      title: 'Milestone 1: UI/UX Redesign & Frontend Modernization',
      description: 'System specifications, responsive wireframes, design system, and client dashboard',
      amount: 45000
    },
    {
      id: 'sec-2',
      title: 'Milestone 2: Backend Cloud Infrastructure & Database',
      description: 'REST API endpoints, PostgreSQL database, authentication, and security middleware',
      amount: 40000
    }
  ]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const initDefaultSections = (): InvoiceSection[] => [
    {
      id: `sec-${Date.now()}-1`,
      title: 'Milestone 1: UI/UX Redesign & Frontend Modernization',
      description: 'System specifications, responsive wireframes, design system, and client dashboard',
      amount: 45000
    },
    {
      id: `sec-${Date.now()}-2`,
      title: 'Milestone 2: Backend Cloud Infrastructure & Database',
      description: 'REST API endpoints, PostgreSQL database, authentication, and security middleware',
      amount: 40000
    }
  ];

  const resetInvoiceForm = (inv?: Invoice) => {
    if (inv) {
      setEditingInvoice(inv);
      setCompanyName(inv.companyName);
      setClientName(inv.clientName);
      setClientEmail(inv.clientEmail || '');
      setService(inv.service);
      setDueDate(inv.dueDate);
      setStatus(inv.status);
      setNotes(inv.notes || 'Bank: Meezan Bank Ltd · Account: 0102-0105829101 · IBAN: PK36MEZN0001020105829101 · Currency: PKR');
      setClientType('new');

      const subtotalVal = inv.subtotal || inv.amount;
      setBasePrice(subtotalVal.toString());
      setHasDiscount(Boolean(inv.discountAmount && inv.discountAmount > 0));
      setDiscountType(inv.discountType || 'percentage');
      setDiscountValue(inv.discountValue !== undefined ? inv.discountValue.toString() : '0');

      if (inv.sections && inv.sections.length > 0) {
        setSections(inv.sections.map(s => ({ ...s })));
        const sectionSum = inv.sections.reduce((s, x) => s + (Number(x.amount) || 0), 0);
        setIsManualPrice(subtotalVal !== sectionSum);
        setAmount(inv.amount.toString());
      } else {
        const fallbackSections: InvoiceSection[] = [
          {
            id: `sec-${Date.now()}`,
            title: inv.service,
            description: 'Core project deliverables & scope',
            amount: subtotalVal
          }
        ];
        setSections(fallbackSections);
        setIsManualPrice(false);
        setAmount(inv.amount.toString());
      }
    } else {
      setEditingInvoice(null);
      if (clients.length > 0) {
        setClientType('existing');
        setCompanyName(clients[0].company);
        setClientName(clients[0].name);
        setClientEmail(clients[0].email);
      } else {
        setClientType('new');
        setCompanyName('');
        setClientName('');
        setClientEmail('');
      }
      const initialSecs = initDefaultSections();
      setSections(initialSecs);
      const totalAmount = initialSecs.reduce((s, item) => s + item.amount, 0);
      setBasePrice(totalAmount.toString());
      setIsManualPrice(false);
      setHasDiscount(false);
      setDiscountType('percentage');
      setDiscountValue('10');
      setAmount(totalAmount.toString());
      setService(initialSecs.map(s => s.title).join(' + '));
      const futureDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDueDate(futureDate);
      setStatus('Unpaid');
      setNotes('Bank: Meezan Bank Ltd · Account: 0102-0105829101 · IBAN: PK36MEZN0001020105829101 · Currency: PKR');
    }
  };

  const openAddModal = () => {
    resetInvoiceForm();
    setIsModalOpen(true);
  };

  const openAddSection = () => {
    resetInvoiceForm();
    setIsAddSectionOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    resetInvoiceForm(inv);
    setIsModalOpen(true);
  };

  const handleAddInvoiceSection = () => {
    const nextNum = sections.length + 1;
    const newSec: InvoiceSection = {
      id: `sec-${Date.now()}-${nextNum}`,
      title: `Milestone ${nextNum}: Extra Deliverables Scope`,
      description: 'Additional project deliverables, testing, and deployment',
      amount: 25000
    };
    const updated = [...sections, newSec];
    setSections(updated);
    if (!isManualPrice) {
      const total = updated.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      setBasePrice(total.toString());
    }
    showToast(`Added Section #${nextNum} to invoice!`);
  };

  const handleRemoveInvoiceSection = (id: string) => {
    if (sections.length <= 1) {
      showToast('An invoice must have at least one section.');
      return;
    }
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    if (!isManualPrice) {
      const total = updated.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      setBasePrice(total.toString());
    }
  };

  const handleSectionChange = (id: string, field: 'title' | 'description' | 'amount', val: any) => {
    const updated = sections.map(s => (s.id === id ? { ...s, [field]: val } : s));
    setSections(updated);
    if (!isManualPrice) {
      const total = updated.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      setBasePrice(total.toString());
    }
  };

  const handleClientSelectChange = (company: string) => {
    setCompanyName(company);
    const matched = clients.find(c => c.company === company);
    if (matched) {
      setClientName(matched.name);
      setClientEmail(matched.email);
    }
  };

  // Compute Financials (Base Price Subtotal, Discount, Net Amount)
  const currentBaseSubtotal = isManualPrice
    ? (parseFloat(basePrice) || 0)
    : (sections.length > 0
        ? sections.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
        : (parseFloat(basePrice) || parseFloat(amount) || 0));

  const computedDiscountAmount = (() => {
    if (!hasDiscount) return 0;
    const dVal = parseFloat(discountValue) || 0;
    if (dVal <= 0) return 0;
    if (discountType === 'percentage') {
      return Math.min(currentBaseSubtotal, (currentBaseSubtotal * dVal) / 100);
    }
    return Math.min(currentBaseSubtotal, dVal);
  })();

  const computedFinalAmount = Math.max(0, currentBaseSubtotal - computedDiscountAmount);

  // Quick Price & Discount Modal handlers
  const openQuickPriceDiscountModal = (inv: Invoice) => {
    const base = inv.subtotal || inv.amount;
    setPriceDiscountModalInvoice(inv);
    setQuickBasePrice(base.toString());
    setQuickHasDiscount(Boolean(inv.discountAmount && inv.discountAmount > 0));
    setQuickDiscountType(inv.discountType || 'percentage');
    setQuickDiscountValue(inv.discountValue !== undefined && inv.discountValue > 0 ? inv.discountValue.toString() : '10');
  };

  const quickComputedDiscount = (() => {
    if (!quickHasDiscount) return 0;
    const base = parseFloat(quickBasePrice) || 0;
    const dVal = parseFloat(quickDiscountValue) || 0;
    if (dVal <= 0) return 0;
    if (quickDiscountType === 'percentage') {
      return Math.min(base, (base * dVal) / 100);
    }
    return Math.min(base, dVal);
  })();

  const quickComputedFinal = Math.max(0, (parseFloat(quickBasePrice) || 0) - quickComputedDiscount);

  const handleSaveQuickPriceDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceDiscountModalInvoice) return;
    const base = parseFloat(quickBasePrice) || 0;
    const dVal = parseFloat(quickDiscountValue) || 0;

    pushUndo({
      type: 'change_price',
      title: `Price updated for "${priceDiscountModalInvoice.invoiceNumber}"`,
      invoice: priceDiscountModalInvoice,
      previousData: {
        amount: priceDiscountModalInvoice.amount,
        subtotal: priceDiscountModalInvoice.subtotal,
        discountType: priceDiscountModalInvoice.discountType,
        discountValue: priceDiscountModalInvoice.discountValue,
        discountAmount: priceDiscountModalInvoice.discountAmount,
      }
    });

    updateInvoice(priceDiscountModalInvoice.id, {
      subtotal: base,
      amount: quickComputedFinal,
      discountType: quickHasDiscount ? quickDiscountType : undefined,
      discountValue: quickHasDiscount ? dVal : 0,
      discountAmount: quickHasDiscount ? quickComputedDiscount : 0,
    });

    showToast(`Updated price & discount for Invoice "${priceDiscountModalInvoice.invoiceNumber}"! Final: PKR ${quickComputedFinal.toLocaleString()}`);
    setPriceDiscountModalInvoice(null);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = currentBaseSubtotal;
    const finalAmount = computedFinalAmount;
    const discountAmt = computedDiscountAmount;
    const dVal = parseFloat(discountValue) || 0;

    const fullServiceName = sections.length > 0
      ? sections.map(s => s.title).filter(Boolean).join(' + ')
      : service;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        clientName,
        companyName,
        clientEmail,
        service: fullServiceName,
        amount: finalAmount,
        subtotal: subtotal,
        discountType: hasDiscount ? discountType : undefined,
        discountValue: hasDiscount ? dVal : 0,
        discountAmount: hasDiscount ? discountAmt : 0,
        dueDate,
        status,
        notes,
        sections
      });
      showToast(`Invoice "${editingInvoice.invoiceNumber}" updated! Total: PKR ${finalAmount.toLocaleString()}`);
      setIsModalOpen(false);
      setIsAddSectionOpen(false);
      setEditingInvoice(null);
    } else {
      const created = addInvoice({
        clientName,
        companyName,
        clientEmail,
        service: fullServiceName,
        amount: finalAmount,
        subtotal: subtotal,
        discountType: hasDiscount ? discountType : undefined,
        discountValue: hasDiscount ? dVal : 0,
        discountAmount: hasDiscount ? discountAmt : 0,
        dueDate,
        status,
        notes,
        sections
      });
      showToast(`Invoice "${created.invoiceNumber}" created! Total: PKR ${finalAmount.toLocaleString()}`);
      setIsModalOpen(false);
      setIsAddSectionOpen(false);

      if (autoPrintAfterSave) {
        setViewingInvoice(created);
        setTimeout(() => {
          window.print();
        }, 300);
      }
    }
  };

  const confirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    const inv = invoiceToDelete;
    deleteInvoice(inv.id);
    pushUndo({
      type: 'delete',
      title: `Invoice "${inv.invoiceNumber}" deleted`,
      invoice: inv
    });
    showToast(`Invoice "${inv.invoiceNumber}" removed.`);
    setInvoiceToDelete(null);
    if (viewingInvoice?.id === inv.id) {
      setViewingInvoice(null);
    }
  };

  const handleMarkPaid = (inv: Invoice) => {
    markInvoiceAsPaid(inv.id, 'Bank Wire Transfer');
    pushUndo({
      type: 'mark_paid',
      title: `Marked "${inv.invoiceNumber}" as Paid`,
      invoice: inv
    });
    showToast(`Invoice "${inv.invoiceNumber}" marked as Paid!`);
  };

  const handleStatusChange = (inv: Invoice, newStatus: InvoiceStatus) => {
    if (inv.status === newStatus) return;
    const prevStatus = inv.status;

    if (newStatus === 'Paid') {
      markInvoiceAsPaid(inv.id, inv.paymentMethod || 'Bank Wire Transfer');
    } else {
      if (prevStatus === 'Paid') {
        unmarkInvoiceAsPaid(inv.id, newStatus);
      } else {
        updateInvoice(inv.id, { status: newStatus });
      }
    }

    pushUndo({
      type: 'status_change',
      title: `Status of "${inv.invoiceNumber}" changed to ${newStatus}`,
      invoice: inv,
      previousData: { status: prevStatus }
    });
    showToast(`Invoice "${inv.invoiceNumber}" status set to ${newStatus}.`);
  };

  const handlePrintInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleExportCsv = () => {
    const rows = filteredInvoices.map((inv) => ({
      'Invoice #': inv.invoiceNumber,
      'Company Name': inv.companyName,
      'Client Name': inv.clientName,
      'Service / Scope': inv.service,
      'Issue Date': inv.issueDate,
      'Due Date': inv.dueDate,
      'Subtotal (PKR)': inv.subtotal || inv.amount,
      'Discount Type': inv.discountType || 'none',
      'Discount Value': inv.discountValue || 0,
      'Discount Amount (PKR)': inv.discountAmount || 0,
      'Net Amount (PKR)': inv.amount,
      'Status': inv.status,
      'Payment Method': inv.paymentMethod || 'Pending'
    }));
    exportToCsv(`Root4Tech_Invoices_${new Date().toISOString().split('T')[0]}.csv`, rows);
    showToast(`Exported ${rows.length} invoices to CSV.`);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.companyName.toLowerCase().includes(query) ||
      inv.clientName.toLowerCase().includes(query) ||
      inv.service.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (st: InvoiceStatus) => {
    switch (st) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Accepted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Unpaid':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);

  const activeDocInvoice: Invoice =
    invoices.find((i) => i.invoiceNumber === '12345') ||
    invoices[0] || {
      id: 'inv-12345',
      invoiceNumber: '12345',
      clientName: 'Ketut Susilo',
      companyName: 'Ketut Susilo Studio',
      clientEmail: 'hello@reallygreatsite.com',
      service: 'Creative Agency Brand Identity & Web Development Suite',
      amount: 8798,
      issueDate: '2022-06-25',
      dueDate: '2022-07-25',
      status: 'Paid'
    };

  // Reusable Form Fields for both the inline on-page section and the modal
  const renderInvoiceFormFields = (isInline = false) => (
    <form onSubmit={handleSaveInvoice} className="space-y-4">
      {/* Client Selection Toggle (only when creating new) */}
      {!editingInvoice && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="text-xs font-semibold text-slate-700">Recipient Organization</div>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="radio"
                name={isInline ? 'clientTypeInline' : 'clientTypeModal'}
                checked={clientType === 'existing'}
                onChange={() => setClientType('existing')}
                className="text-blue-600"
              />
              <span>Select Existing Client ({clients.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="radio"
                name={isInline ? 'clientTypeInline' : 'clientTypeModal'}
                checked={clientType === 'new'}
                onChange={() => {
                  setClientType('new');
                  setCompanyName('');
                  setClientName('');
                  setClientEmail('');
                }}
                className="text-blue-600"
              />
              <span>New / Custom Client</span>
            </label>
          </div>
        </div>
      )}

      {clientType === 'existing' && !editingInvoice && clients.length > 0 ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Client *
          </label>
          <select
            value={companyName}
            onChange={(e) => handleClientSelectChange(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.company}>
                {c.company} — {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Organization *
            </label>
            <input
              required
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Logistics Ltd"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Person *
            </label>
            <input
              required
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Billing Email
        </label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="billing@company.com"
          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* INVOICE BREAKDOWN SECTIONS */}
      <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/70 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Invoice Sections & Milestones</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                  {sections.length} Section{sections.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Divide this invoice into distinct itemized sections or deliverables
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddInvoiceSection}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Invoice Section</span>
          </button>
        </div>

        {/* Sections List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 transition-all hover:border-blue-200"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Section #{idx + 1} Scope & Deliverables
                  </span>
                </div>

                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInvoiceSection(sec.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
                    title="Remove this section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Section</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 uppercase">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Milestone 1: Frontend & UI Components"
                    value={sec.title}
                    onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 uppercase">
                    Section Price (PKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      PKR
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="0"
                      value={sec.amount || ''}
                      onChange={(e) => handleSectionChange(sec.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full h-8 pl-10 pr-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5 uppercase">
                  Section Scope Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wireframes, Figma prototype, responsive Tailwind CSS layouts..."
                  value={sec.description || ''}
                  onChange={(e) => handleSectionChange(sec.id, 'description', e.target.value)}
                  className="w-full h-7.5 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICE OVERRIDE & DISCOUNT CONFIGURATION */}
      <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-4">
        {/* Base Subtotal / Price Changer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/70 pb-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Invoice Base Price (Subtotal)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isManualPrice
                ? 'Custom direct price override is active'
                : `Calculated from ${sections.length} section(s)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isManualPrice) {
                  setIsManualPrice(false);
                  const sumSec = sections.reduce((s, x) => s + (Number(x.amount) || 0), 0);
                  setBasePrice(sumSec.toString());
                } else {
                  setIsManualPrice(true);
                }
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition"
            >
              {isManualPrice ? '↺ Sync with Sections' : '✏️ Change Base Price'}
            </button>
            <div className="relative w-36">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                PKR
              </span>
              <input
                type="number"
                min={0}
                disabled={!isManualPrice}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={`w-full h-8 pl-10 pr-2 rounded-lg border text-xs font-mono font-bold text-slate-900 focus:outline-none transition ${
                  isManualPrice
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100'
                    : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Apply Discount to this Invoice</span>
              </div>
            </label>
            {hasDiscount && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Discount Enabled
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        discountType === 'percentage'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        discountType === 'fixed'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>Fixed (PKR)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                    {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (PKR)'}
                  </label>
                  <div className="relative">
                    {discountType === 'percentage' ? (
                      <Percent className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                    ) : (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        PKR
                      </span>
                    )}
                    <input
                      type="number"
                      min={0}
                      max={discountType === 'percentage' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? '10' : '5000'}
                      className={`w-full h-8 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 ${
                        discountType === 'percentage' ? 'px-3 pr-8' : 'pl-10 pr-3'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {discountType === 'percentage' && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountValue(pct.toString())}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        discountValue === pct.toString()
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Financial Totals Breakdown Bar */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal (Base Price):</span>
            <span className="font-mono font-semibold">
              PKR {currentBaseSubtotal.toLocaleString()}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex items-center justify-between text-emerald-700 font-medium">
              <span>
                Discount ({discountType === 'percentage' ? `${discountValue || 0}%` : 'Fixed deduction'}):
              </span>
              <span className="font-mono font-bold">
                -PKR {computedDiscountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold">
            <span className="text-slate-900">Final Net Payable Amount:</span>
            <span className="text-base text-blue-600 font-mono">
              PKR {computedFinalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Due Date *
          </label>
          <input
            required
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Declined">Declined</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Payment Wire Instructions / Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Wire details, bank account, purchase order number..."
          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-[11px]"
        />
      </div>

      {!editingInvoice && (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-900">
            <input
              type="checkbox"
              checked={autoPrintAfterSave}
              onChange={(e) => setAutoPrintAfterSave(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Open & Print invoice immediately upon issuing</span>
          </label>
          <Printer className="w-4 h-4 text-blue-600" />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            if (isInline) {
              setIsAddSectionOpen(false);
            } else {
              setIsModalOpen(false);
              setEditingInvoice(null);
            }
          }}
          className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
        >
          {editingInvoice
            ? `Save Invoice Changes (${sections.length} Sections)`
            : `+ Save & Generate Invoice (${sections.length} Sections)`}
        </button>
      </div>
    </form>
  );


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification with Inline Undo */}
      {notification && (
        <div className="fixed top-5 right-5 z-55 p-3.5 pr-4 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="max-w-xs">{notification}</span>
          {undoStack.length > 0 && (
            <button
              onClick={handleExecuteUndo}
              className="ml-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
              title="Undo last action (Ctrl+Z)"
            >
              <RotateCcw className="w-3 h-3 text-slate-950" />
              <span>Undo</span>
            </button>
          )}
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue billing invoices in PKR, record customer payments, and print tax-ready invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Header Undo Button */}
          <button
            type="button"
            disabled={undoStack.length === 0}
            onClick={handleExecuteUndo}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition shadow-2xs active:scale-98 ${
              undoStack.length > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title={
              undoStack.length > 0
                ? `Undo: ${undoStack[undoStack.length - 1].title} (Ctrl+Z)`
                : 'No actions to undo'
            }
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Undo {undoStack.length > 0 ? `(${undoStack.length})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition shadow-2xs active:scale-98"
            title="Export all filtered invoices to CSV / Excel format"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (isAddSectionOpen) {
                setIsAddSectionOpen(false);
              } else {
                openAddSection();
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-xs active:scale-98 ${
              isAddSectionOpen
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAddSectionOpen ? 'Hide Invoice Section' : '+ Add New Invoice Section'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Invoice</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE TABS: STUDIO INVOICE DOCUMENT VS CRM LIST */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPageViewMode('document')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              pageViewMode === 'document'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Studio Invoice Document</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                pageViewMode === 'document' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              Image Layout
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPageViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              pageViewMode === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>CRM Invoices List ({invoices.length})</span>
          </button>
        </div>

        {pageViewMode === 'document' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Currency Switcher */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              {(['$', 'PKR '] as const).map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setDocCurrency(sym)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    docCurrency === sym
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sym.trim()}
                </button>
              ))}
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              title="Print Invoice Document (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. DOCUMENT VIEW (STUDIO SHODWE DESIGN MATCHING USER IMAGE) */}
      {pageViewMode === 'document' && (
        <div className="animate-in fade-in duration-200">
          {/* Document Stage (The Active Document control bar is completely removed, moving the preview stage upward naturally) */}
          <div className="w-full flex justify-center py-6 sm:py-8 px-2 sm:px-6 bg-slate-200/50 rounded-3xl border border-slate-300/60 shadow-inner overflow-x-auto">
            <StudioInvoiceDocument
              invoice={activeDocInvoice}
              currencySymbol={activeDocInvoice.currency || docCurrency}
            />
          </div>
        </div>
      )}

      {/* 2. CRM MANAGEMENT LIST VIEW */}
      {pageViewMode === 'list' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {/* DEDICATED ADD NEW INVOICE SECTION (ON-PAGE BUILDER) */}
          {isAddSectionOpen && (
        <div className="p-6 rounded-2xl bg-white border-2 border-indigo-200/80 shadow-md space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Add New Invoice Section & Commercial Bill
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    Itemized PKR Generator
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select client, add itemized milestone sections, and calculate total PKR billing with immediate print option
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddSectionOpen(false)}
              className="self-end sm:self-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Close Section"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderInvoiceFormFields(true)}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Invoiced
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              PKR {(totalPaid + totalUnpaid).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">{invoices.length} total invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Collected / Paid
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              PKR {totalPaid.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {invoices.filter(i => i.status === 'Paid').length} paid invoices
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Outstanding Balance
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
              PKR {totalUnpaid.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">
              {invoices.filter(i => i.status !== 'Paid').length} pending payment
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Draft', 'Sent', 'Accepted', 'Unpaid', 'Paid', 'Declined', 'Overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? `All Invoices (${invoices.length})` : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, client, company..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto min-h-[340px] pb-12">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Invoice #</th>
                <th className="py-3.5 px-4 font-semibold">Client / Company</th>
                <th className="py-3.5 px-4 font-semibold">Scope & Deliverables</th>
                <th className="py-3.5 px-4 font-semibold">Issue Date</th>
                <th className="py-3.5 px-4 font-semibold">Due Date</th>
                <th className="py-3.5 px-4 font-semibold">Amount (PKR)</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv, index) => (
                <tr key={inv.id} className={`hover:bg-slate-50/60 transition-colors ${openActionDropdownId === inv.id ? 'relative z-30' : ''}`}>
                  <td className="py-3.5 px-4 font-semibold text-blue-600 font-mono whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{inv.companyName}</div>
                    <div className="text-[11px] text-slate-500">{inv.clientName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs" title={inv.service}>
                    <div className="font-medium text-slate-900 truncate">{inv.service}</div>
                    {inv.sections && inv.sections.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mt-0.5">
                        <Layers className="w-3 h-3" />
                        <span>{inv.sections.length} Section{inv.sections.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {inv.issueDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {inv.discountAmount && inv.discountAmount > 0 ? (
                      <div>
                        <span className="line-through text-slate-400 font-mono text-[11px] block">
                          PKR {(inv.subtotal || (inv.amount + inv.discountAmount)).toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          PKR {inv.amount.toLocaleString()}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                          {inv.discountType === 'percentage' ? `${inv.discountValue}% OFF` : `-${inv.discountAmount.toLocaleString()} PKR`}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono">
                        PKR {inv.amount.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <div className="relative inline-flex items-center">
                        <select
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv, e.target.value as InvoiceStatus)}
                          className={`appearance-none text-[11px] font-semibold pl-2.5 pr-6 py-0.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${getStatusBadge(
                            inv.status
                          )}`}
                          title="Click to update invoice lifecycle stage"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                          <option value="Declined">Declined</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                      {inv.paidPdfAttachment && (
                        <button
                          type="button"
                          onClick={() => openPdfAttachmentModal(inv)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded transition"
                          title={`Attached PDF: ${inv.paidPdfAttachment.name} (Click to manage)`}
                        >
                          <Paperclip className="w-2.5 h-2.5 text-emerald-600" />
                          <span>PDF Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="relative inline-block text-left action-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionDropdownId(openActionDropdownId === inv.id ? null : inv.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition shadow-2xs active:scale-95 ${
                          openActionDropdownId === inv.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>Actions</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            openActionDropdownId === inv.id ? 'rotate-180 text-white' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      {openActionDropdownId === inv.id && (
                        <div
                          className={`absolute right-0 ${
                            index >= filteredInvoices.length - 2 && filteredInvoices.length > 2
                              ? 'bottom-full mb-1.5'
                              : 'top-full mt-1.5'
                          } w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 1. Mark as Paid / Revert */}
                          <div className="py-1">
                            {inv.status !== 'Paid' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  handleMarkPaid(inv);
                                  setOpenActionDropdownId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2.5 font-medium transition"
                              >
                                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                                <span>Mark as Paid</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  unmarkInvoiceAsPaid(inv.id);
                                  pushUndo({
                                    type: 'mark_paid',
                                    title: `Reverted "${inv.invoiceNumber}" to Unpaid`,
                                    invoice: inv
                                  });
                                  showToast(`Invoice "${inv.invoiceNumber}" reverted to Unpaid.`);
                                  setOpenActionDropdownId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-700 transition"
                              >
                                <RotateCcw className="w-4 h-4 text-slate-500" />
                                <span>Revert to Unpaid</span>
                              </button>
                            )}
                          </div>

                          {/* 2. Attach Paid Receipt PDF */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                openPdfAttachmentModal(inv);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                            >
                              {inv.paidPdfAttachment ? (
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <UploadCloud className="w-4 h-4 text-emerald-600" />
                              )}
                              <span>{inv.paidPdfAttachment ? 'Manage Receipt PDF' : 'Attach Paid Receipt PDF'}</span>
                            </button>
                          </div>

                          {/* 3. Change Price & Discount */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                openQuickPriceDiscountModal(inv);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                            >
                              <Tag className="w-4 h-4 text-amber-600" />
                              <span>Change Price & Discount</span>
                            </button>
                          </div>

                          {/* 4. Print Official Tax Invoice */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                handlePrintInvoice(inv);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 hover:text-blue-700 flex items-center gap-2.5 font-medium transition"
                            >
                              <Printer className="w-4 h-4 text-blue-600" />
                              <span>Print Official Tax Invoice</span>
                            </button>
                          </div>

                          {/* 5. Edit Invoice Details */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                openEditModal(inv);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                            >
                              <Edit2 className="w-4 h-4 text-indigo-600" />
                              <span>Edit Invoice Details</span>
                            </button>
                          </div>

                          {/* 6. View Invoice Preview */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingInvoice(inv);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 hover:text-blue-700 flex items-center gap-2.5 font-medium transition"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              <span>View Invoice Preview</span>
                            </button>
                          </div>

                          {/* 7. Delete Invoice */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceToDelete(inv);
                                setOpenActionDropdownId(null);
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
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No invoices found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Create an invoice to bill clients, track payment milestones, and print invoices in PKR.
                      </p>
                      <button
                        onClick={openAddSection}
                        className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add New Invoice Section</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}


      {/* CREATE / EDIT INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingInvoice ? `Edit Invoice — ${editingInvoice.invoiceNumber}` : '+ Add New Commercial Invoice'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingInvoice
                      ? 'Modify invoice sections, amount in PKR, due date, status, or notes'
                      : 'Issue a new customer invoice with itemized sections, bank details in PKR, and immediate print option'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingInvoice(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderInvoiceFormFields(false)}
          </div>
        </div>
      )}

      {/* DELETE INVOICE CONFIRMATION MODAL */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Invoice
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete invoice <strong className="text-slate-800">{invoiceToDelete.invoiceNumber}</strong> for <strong className="text-slate-800">{invoiceToDelete.companyName}</strong> (PKR {invoiceToDelete.amount.toLocaleString()})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteInvoice}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW & PRINT INVOICE MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[94vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Invoice Document
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                  {viewingInvoice.invoiceNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(viewingInvoice.status)}`}>
                  {viewingInvoice.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {viewingInvoice.paidPdfAttachment && (
                  <button
                    onClick={() => handleDownloadAttachedPdf(viewingInvoice)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                    title={`Download attached PDF: ${viewingInvoice.paidPdfAttachment.name}`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Receipt</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const inv = viewingInvoice;
                    openPdfAttachmentModal(inv);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                  title="Upload or manage attached paid invoice PDF/receipt"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                  <span>{viewingInvoice.paidPdfAttachment ? 'Manage Receipt PDF' : 'Attach Paid PDF'}</span>
                </button>

                <button
                  onClick={() => {
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    openEditModal(inv);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition ${
                    viewingInvoice.status === 'Paid'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={viewingInvoice.status === 'Paid' ? 'Print or Save Stamped Paid Invoice PDF' : 'Print Invoice'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>

                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Container */}
            <div className="w-full flex justify-center py-2 bg-slate-100/70 p-2 sm:p-4 rounded-xl overflow-x-auto">
              <StudioInvoiceDocument
                invoice={viewingInvoice}
                currencySymbol={viewingInvoice.currency || (viewingInvoice.id === 'inv-12345' || viewingInvoice.invoiceNumber === '12345' ? '$' : 'PKR ')}
              />
            </div>
          </div>
        </div>
      )}

      {/* ATTACH / MANAGE PAID INVOICE PDF MODAL */}
      {attachingPdfInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Paid Invoice PDF & Receipt Document
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {attachingPdfInvoice.invoiceNumber} — {attachingPdfInvoice.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttachingPdfInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Attached PDF Card (if any) */}
            {attachingPdfInvoice.paidPdfAttachment && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                        {attachingPdfInvoice.paidPdfAttachment.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(attachingPdfInvoice.paidPdfAttachment.size / 1024).toFixed(1)} KB · Attached on {attachingPdfInvoice.paidPdfAttachment.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Active Receipt
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachedPdf(attachingPdfInvoice)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newTab = window.open();
                      if (newTab) {
                        newTab.document.write(
                          `<iframe src="${attachingPdfInvoice.paidPdfAttachment?.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                        );
                      }
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-100/60 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removePaidPdfFromInvoice(attachingPdfInvoice.id);
                      showToast(`Removed attached PDF from "${attachingPdfInvoice.invoiceNumber}".`);
                      setAttachingPdfInvoice({
                        ...attachingPdfInvoice,
                        paidPdfAttachment: undefined
                      });
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                {attachingPdfInvoice.paidPdfAttachment ? 'Upload New / Replacement PDF:' : 'Upload Paid Invoice PDF / Bank Receipt:'}
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsPdfDragActive(true);
                }}
                onDragLeave={() => setIsPdfDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsPdfDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessPdfFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                  isPdfDragActive
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60 bg-slate-50/30'
                }`}
                onClick={() => document.getElementById('paidPdfFileInput')?.click()}
              >
                <input
                  id="paidPdfFileInput"
                  type="file"
                  accept=".pdf,application/pdf,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessPdfFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Click to choose or drag & drop Paid Invoice PDF
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Accepts PDF files and image receipts (.pdf, .png, .jpg) up to 15MB
                    </span>
                  </div>
                </div>
              </div>

              {pdfUploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pdfUploadError}</span>
                </div>
              )}

              {/* Ready to Attach Preview */}
              {pdfUploadFile && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {pdfUploadFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(pdfUploadFile.size / 1024).toFixed(1)} KB · Ready to save
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfUploadFile(null);
                      setPdfUploadDataUrl(null);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                    title="Clear selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Status Update Checkbox */}
              {attachingPdfInvoice.status !== 'Paid' && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={autoMarkPaidOnAttach}
                    onChange={(e) => setAutoMarkPaidOnAttach(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>
                    Automatically mark this invoice status as <strong>Paid</strong> upon attaching receipt
                  </span>
                </label>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAttachingPdfInvoice(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 text-xs transition"
              >
                Close
              </button>
              {pdfUploadFile && (
                <button
                  type="button"
                  onClick={handleSavePaidPdfAttachment}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Attach PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK PRICE & DISCOUNT MODAL */}
      {priceDiscountModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Change Price & Apply Discount
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {priceDiscountModalInvoice.invoiceNumber} — {priceDiscountModalInvoice.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPriceDiscountModalInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPriceDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Base Price (PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PKR
                  </span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={quickBasePrice}
                    onChange={(e) => setQuickBasePrice(e.target.value)}
                    className="w-full h-9 pl-11 pr-3 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Change the raw invoice subtotal price directly.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={quickHasDiscount}
                      onChange={(e) => setQuickHasDiscount(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Apply Discount to this Invoice</span>
                  </label>
                  {quickHasDiscount && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>

                {quickHasDiscount && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickDiscountType('percentage')}
                        className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                          quickDiscountType === 'percentage'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Percentage (%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDiscountType('fixed')}
                        className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                          quickDiscountType === 'fixed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>Fixed Amount</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">
                        {quickDiscountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (PKR)'}
                      </label>
                      <div className="relative">
                        {quickDiscountType === 'percentage' ? (
                          <Percent className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                        ) : (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            PKR
                          </span>
                        )}
                        <input
                          type="number"
                          min={0}
                          max={quickDiscountType === 'percentage' ? 100 : undefined}
                          value={quickDiscountValue}
                          onChange={(e) => setQuickDiscountValue(e.target.value)}
                          placeholder={quickDiscountType === 'percentage' ? '10' : '5000'}
                          className={`w-full h-9 rounded-lg border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 bg-white ${
                            quickDiscountType === 'percentage' ? 'px-3 pr-9' : 'pl-11 pr-3'
                          }`}
                        />
                      </div>
                    </div>

                    {quickDiscountType === 'percentage' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                        {[5, 10, 15, 20].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setQuickDiscountValue(pct.toString())}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              quickDiscountValue === pct.toString()
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>PKR {(parseFloat(quickBasePrice) || 0).toLocaleString()}</span>
                </div>
                {quickHasDiscount && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>-PKR {quickComputedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-sm text-blue-600">
                  <span>Final Net Payable:</span>
                  <span>PKR {quickComputedFinal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPriceDiscountModalInvoice(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
                >
                  Save Price & Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
