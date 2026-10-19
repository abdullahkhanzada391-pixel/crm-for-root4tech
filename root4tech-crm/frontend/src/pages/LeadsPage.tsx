import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Lead, LeadStatus } from '@/types/crm';
import { generateDemoLeads, INITIAL_LEADS } from '@/data/mockData';
import { exportToCsv } from '@/utils/exportCsv';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  X,
  Phone,
  Mail,
  Building,
  Globe,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  RotateCcw,
  MessageSquare,
  Download,
  LayoutGrid,
  List,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Send,
  PhoneForwarded,
  DollarSign,
  Receipt
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const {
    leads,
    addLead,
    addMultipleLeads,
    updateLead,
    deleteLead,
    deleteMultipleLeads,
    clearAllLeads,
    convertLeadToClient,
    addInvoice,
    addQuotation
  } = useCRM();

  const [searchParams] = useSearchParams();

  // View Mode: Table vs Interactive Kanban Board
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Multi-select for bulk removal
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals & Notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Convert Lead to Client Modal State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [convCompanyName, setConvCompanyName] = useState('');
  const [convClientName, setConvClientName] = useState('');
  const [convPhone, setConvPhone] = useState('');
  const [convEmail, setConvEmail] = useState('');
  const [convCountry, setConvCountry] = useState('United States');
  const [convService, setConvService] = useState('');
  const [convClientStatus, setConvClientStatus] = useState<'Active' | 'Onboarding' | 'Completed'>('Active');
  const [convInitialValue, setConvInitialValue] = useState('150000');
  const [convNotes, setConvNotes] = useState('');
  const [convCreateInvoice, setConvCreateInvoice] = useState(false);
  const [convCreateQuotation, setConvCreateQuotation] = useState(false);

  // Duplicate Warning State
  const [duplicateWarningModal, setDuplicateWarningModal] = useState<{
    match: DuplicateMatch;
    onConfirm: () => void;
  } | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [interestedService, setInterestedService] = useState('Custom Web & Cloud Platform');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddModal = () => {
    setFullName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setCountry('United States');
    setInterestedService('Custom Web & Cloud Platform');
    setNotes('');
    setStatus('New');
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFullName(lead.name);
    setCompanyName(lead.company);
    setPhone(lead.phone);
    setEmail(lead.email);
    setCountry(lead.country);
    setInterestedService(lead.interestedService);
    setNotes(lead.notes || '');
    setStatus(lead.status);
  };

  // Duplicate Detection Helpers
  const normalizePhone = (phoneStr: string) => phoneStr.replace(/[^0-9]/g, '');
  const normalizeEmail = (emailStr: string) => emailStr.trim().toLowerCase();

  interface DuplicateMatch {
    type: 'email' | 'phone' | 'both';
    matchedLead: Lead;
    details: string;
  }

  const checkDuplicateLead = (
    emailVal: string,
    phoneVal: string,
    excludeId?: string
  ): DuplicateMatch | null => {
    const cleanEmail = normalizeEmail(emailVal);
    const cleanPhone = normalizePhone(phoneVal);

    if (!cleanEmail && !cleanPhone) return null;

    for (const l of leads) {
      if (excludeId && l.id === excludeId) continue;
      const lEmail = normalizeEmail(l.email);
      const lPhone = normalizePhone(l.phone);

      const emailMatch = Boolean(cleanEmail && lEmail && cleanEmail === lEmail);
      const phoneMatch = Boolean(
        cleanPhone &&
        lPhone &&
        cleanPhone.length >= 7 &&
        (cleanPhone === lPhone || cleanPhone.endsWith(lPhone) || lPhone.endsWith(cleanPhone))
      );

      if (emailMatch && phoneMatch) {
        return {
          type: 'both',
          matchedLead: l,
          details: `Both email (${l.email}) and phone (${l.phone}) match an existing lead`
        };
      }
      if (emailMatch) {
        return {
          type: 'email',
          matchedLead: l,
          details: `Email address "${l.email}" already belongs to an existing lead`
        };
      }
      if (phoneMatch) {
        return {
          type: 'phone',
          matchedLead: l,
          details: `Phone number "${l.phone}" already belongs to an existing lead`
        };
      }
    }
    return null;
  };

  // Precomputed duplicate lookup for all pipeline leads
  const duplicateLeadMap = React.useMemo(() => {
    const map = new Map<string, DuplicateMatch>();
    for (let i = 0; i < leads.length; i++) {
      for (let j = 0; j < leads.length; j++) {
        if (i === j) continue;
        const a = leads[i];
        const b = leads[j];
        const emailMatch = Boolean(a.email && b.email && normalizeEmail(a.email) === normalizeEmail(b.email));
        const cleanA = normalizePhone(a.phone);
        const cleanB = normalizePhone(b.phone);
        const phoneMatch = Boolean(
          cleanA &&
          cleanB &&
          cleanA.length >= 7 &&
          (cleanA === cleanB || cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA))
        );
        if (emailMatch || phoneMatch) {
          map.set(a.id, {
            type: emailMatch && phoneMatch ? 'both' : emailMatch ? 'email' : 'phone',
            matchedLead: b,
            details: emailMatch && phoneMatch ? 'Duplicate Email & Phone' : emailMatch ? 'Duplicate Email' : 'Duplicate Phone'
          });
          break;
        }
      }
    }
    return map;
  }, [leads]);

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const dup = checkDuplicateLead(email, phone);
    if (dup) {
      setDuplicateWarningModal({
        match: dup,
        onConfirm: () => {
          addLead({
            name: fullName,
            company: companyName,
            phone,
            email,
            country,
            interestedService,
            notes,
            status
          });
          setIsAddModalOpen(false);
          setDuplicateWarningModal(null);
          showToast(`Lead "${fullName}" (${companyName}) added with duplicate acknowledged.`);
        }
      });
      return;
    }
    addLead({
      name: fullName,
      company: companyName,
      phone,
      email,
      country,
      interestedService,
      notes,
      status
    });
    setIsAddModalOpen(false);
    showToast(`Lead "${fullName}" (${companyName}) added successfully!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    const dup = checkDuplicateLead(email, phone, editingLead.id);
    if (dup) {
      setDuplicateWarningModal({
        match: dup,
        onConfirm: () => {
          updateLead(editingLead.id, {
            name: fullName,
            company: companyName,
            phone,
            email,
            country,
            interestedService,
            notes,
            status
          });
          setEditingLead(null);
          setDuplicateWarningModal(null);
          showToast(`Lead "${fullName}" updated with duplicate acknowledged.`);
        }
      });
      return;
    }
    updateLead(editingLead.id, {
      name: fullName,
      company: companyName,
      phone,
      email,
      country,
      interestedService,
      notes,
      status
    });
    setEditingLead(null);
    showToast(`Lead "${fullName}" updated successfully!`);
  };

  // 1. Single Lead Removal via Dedicated Confirmation Modal
  const confirmDeleteLead = () => {
    if (!leadToDelete) return;
    deleteLead(leadToDelete.id);
    setSelectedLeadIds(prev => prev.filter(item => item !== leadToDelete.id));
    showToast(`Lead "${leadToDelete.name}" was permanently removed.`);
    setLeadToDelete(null);
    if (viewingLead?.id === leadToDelete.id) {
      setViewingLead(null);
    }
  };

  // 2. Bulk Selected Leads Removal
  const handleDeleteSelected = () => {
    if (selectedLeadIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete the ${selectedLeadIds.length} selected lead(s)?`
      )
    ) {
      deleteMultipleLeads(selectedLeadIds);
      showToast(`Removed ${selectedLeadIds.length} lead(s) successfully.`);
      setSelectedLeadIds([]);
    }
  };

  // 3. Clear All Previous Leads
  const handleClearAllLeads = () => {
    if (leads.length === 0) return;
    if (
      window.confirm(
        'Are you sure you want to remove ALL previous leads? This will delete all lead records.'
      )
    ) {
      clearAllLeads();
      setSelectedLeadIds([]);
      showToast('All previous leads have been cleared.');
    }
  };

  const openConvertModal = (lead: Lead) => {
    if (lead.status === 'Converted') {
      alert(`"${lead.name}" is already converted into a Client.`);
      return;
    }
    setConvertingLead(lead);
    setConvCompanyName(lead.company || '');
    setConvClientName(lead.name || '');
    setConvPhone(lead.phone || '');
    setConvEmail(lead.email || '');
    setConvCountry(lead.country || 'United States');
    setConvService(lead.interestedService || 'Custom Web & Cloud Platform');
    setConvClientStatus('Active');
    setConvInitialValue('150000');
    setConvNotes(lead.notes ? `Lead Inquiry Notes: ${lead.notes}` : '');
    setConvCreateInvoice(false);
    setConvCreateQuotation(false);
  };

  const handleConvert = (lead: Lead) => {
    openConvertModal(lead);
  };

  const handleConfirmConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    const initialValNum = parseFloat(convInitialValue) || 0;
    const convertedClient = convertLeadToClient(convertingLead.id, {
      name: convClientName.trim() || convertingLead.name,
      company: convCompanyName.trim() || convertingLead.company,
      phone: convPhone.trim() || convertingLead.phone,
      email: convEmail.trim() || convertingLead.email,
      country: convCountry || convertingLead.country,
      service: convService || convertingLead.interestedService,
      status: convClientStatus,
      initialContractValue: initialValNum,
      notes: convNotes.trim()
    });

    // Optionally auto-generate opening invoice or quotation
    if (convCreateInvoice && convertedClient) {
      addInvoice({
        clientName: convertedClient.name,
        companyName: convertedClient.company,
        clientEmail: convertedClient.email,
        service: convService || convertingLead.interestedService,
        amount: initialValNum || 85000,
        subtotal: initialValNum || 85000,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'Unpaid',
        notes: `Opening Milestone 1 invoice for converted client ${convertedClient.name}`,
        sections: [
          {
            id: `sec-${Date.now()}`,
            title: `${convService || convertingLead.interestedService} - Milestone 1`,
            description: 'Kickoff advance invoice upon lead conversion',
            amount: initialValNum || 85000
          }
        ]
      });
    }

    if (convCreateQuotation && convertedClient) {
      addQuotation({
        clientName: convertedClient.name,
        companyName: convertedClient.company,
        clientEmail: convertedClient.email,
        service: convService || convertingLead.interestedService,
        amount: initialValNum || 150000,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'Sent',
        notes: `Agreed scope proposal for converted client ${convertedClient.company}`,
        items: [
          {
            id: `qitem-${Date.now()}`,
            service: convService || convertingLead.interestedService,
            description: 'Agreed scope of work during lead conversion',
            amount: initialValNum || 150000
          }
        ]
      });
    }

    showToast(`Lead "${convertingLead.name}" converted to Client successfully!`);
    setConvertingLead(null);
    if (viewingLead?.id === convertingLead.id) {
      setViewingLead(null);
    }
  };

  // Handle URL query parameters (e.g. from Command Palette or Notifications)
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      if (filterParam === 'duplicates' || filterParam === 'duplicate') {
        setStatusFilter('duplicate');
      } else {
        setStatusFilter(filterParam);
      }
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    const actionParam = searchParams.get('action');
    if (actionParam === 'new') {
      openAddModal();
    }
  }, [searchParams]);

  // Stage Transitions for Kanban & Quick Actions
  const stageFlow: LeadStatus[] = ['New', 'Contacted', 'Call Back', 'Interested', 'Send Proposal', 'Converted'];

  const handleAdvanceStage = (lead: Lead) => {
    const idx = stageFlow.indexOf(lead.status);
    if (idx >= 0 && idx < stageFlow.length - 1) {
      const nextStage = stageFlow[idx + 1];
      if (nextStage === 'Converted') {
        openConvertModal(lead);
        return;
      }
      updateLead(lead.id, { status: nextStage });
      showToast(`"${lead.name}" moved to stage: ${nextStage}`);
    }
  };

  const handleRegressStage = (lead: Lead) => {
    const idx = stageFlow.indexOf(lead.status);
    if (idx > 0) {
      const prevStage = stageFlow[idx - 1];
      updateLead(lead.id, { status: prevStage });
      showToast(`"${lead.name}" moved back to: ${prevStage}`);
    }
  };

  // 1-Click CSV Export for Leads
  const handleExportCsv = () => {
    const rows = filteredLeads.map((l) => ({
      'Lead ID': l.id,
      'Full Name': l.name,
      'Company Name': l.company,
      Phone: l.phone,
      Email: l.email,
      Country: l.country,
      'Interested Service': l.interestedService,
      Status: l.status,
      'Date Added': l.dateAdded,
      'Duplicate Flag': duplicateLeadMap.has(l.id) ? 'DUPLICATE' : 'UNIQUE',
      Notes: l.notes || ''
    }));
    exportToCsv(`Root4Tech_Leads_${new Date().toISOString().split('T')[0]}.csv`, rows);
    showToast(`Exported ${rows.length} leads successfully to CSV.`);
  };

  // Filter & Search Logic
  const filteredLeads = leads.filter((lead) => {
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'duplicate') {
      matchesStatus = duplicateLeadMap.has(lead.id);
    } else {
      matchesStatus = lead.status === statusFilter;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;
    const matchesSearch =
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.country.toLowerCase().includes(query) ||
      lead.interestedService.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Derived Pagination Calculations
  const totalItems = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  // Auto-clamp page when list changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Multi-select logic respecting active page
  const isAllCurrentPageSelected =
    paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeadIds.includes(l.id));
  const isPartiallySelected =
    paginatedLeads.some((l) => selectedLeadIds.includes(l.id)) && !isAllCurrentPageSelected;

  const toggleSelectAll = () => {
    const currentIds = paginatedLeads.map((l) => l.id);
    if (isAllCurrentPageSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const selectAllFilteredLeads = () => {
    setSelectedLeadIds(filteredLeads.map((l) => l.id));
  };

  const toggleSelectOne = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedLeadIds((prev) => [...prev, id]);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (st: string) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput('');
    }
  };

  const handleAddDemoBatch = (count: number = 25) => {
    const demo = generateDemoLeads(count);
    addMultipleLeads(demo);
    showToast(`Successfully added ${count} demo leads to test pagination! Total leads: ${leads.length + count}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (activePage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusBadge = (st: LeadStatus) => {
    switch (st) {
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Leads Pipeline
            </h2>
            <button
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
              title="Click for guide on adding and removing leads"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How it works</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total of <span className="font-semibold text-slate-800">{leads.length}</span> leads in pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dynamic View Mode Toggle: Table vs Kanban */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table Grid View with Pagination"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive Drag & Stage Mover Kanban Board"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          {/* Dynamic CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition shadow-2xs"
            title="Download pipeline leads to CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => handleAddDemoBatch(25)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition shadow-2xs"
            title="Add 25 realistic sample leads to immediately test pagination"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">+ Demo Leads (+25)</span>
          </button>

          {leads.length > 0 && (
            <button
              onClick={handleClearAllLeads}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition shadow-2xs"
              title="Remove all previous leads at once"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Instructional Guide Banner (Expandable) */}
      {showHelpGuide && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-800 text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-blue-900">
            <span className="flex items-center gap-1.5 text-sm">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Quick Guide: Managing Leads
            </span>
            <button onClick={() => setShowHelpGuide(false)} className="text-blue-500 hover:text-blue-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                How to Add a New Lead:
              </div>
              <p className="text-slate-600 leading-relaxed">
                Click the blue <strong>"+ Add New Lead"</strong> button at the top right. Fill in the contact name, company name, phone, email, country, interested service, and status, then click <strong>"Save Lead"</strong>.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                How to Remove Previous Leads:
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>Single delete:</strong> Click the red trash icon <Trash2 className="w-3 h-3 inline text-rose-600" /> on any row.
                <br />
                <strong>Bulk delete:</strong> Select the checkboxes next to multiple leads and click <strong>"Delete Selected"</strong>.
                <br />
                <strong>Wipe all:</strong> Click <strong>"Clear All Leads"</strong> at the top.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Select Bulk Actions Bar (Appears when 1+ rows are checked) */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5 text-xs font-medium pl-1">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {selectedLeadIds.length}
            </span>
            <span>lead(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Deselect All
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'New', 'Contacted', 'Call Back', 'Interested', 'Send Proposal', 'Converted'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? `All (${leads.length})` : st}
            </button>
          ))}

          {duplicateLeadMap.size > 0 && (
            <button
              onClick={() => handleStatusFilterChange('duplicate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs ${
                statusFilter === 'duplicate'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
              title="Show duplicate leads with matching email or phone"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Duplicates ({duplicateLeadMap.size})</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search leads, company, email..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Dynamic View: Kanban Board vs Table Grid */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {stageFlow.map((st) => {
            const stageLeads = filteredLeads.filter((l) => l.status === st);
            const getStageHeaderStyle = (stage: LeadStatus) => {
              switch (stage) {
                case 'New':
                  return {
                    border: 'border-blue-500',
                    dot: 'bg-blue-500',
                    badge: 'bg-blue-50 text-blue-700 border-blue-200'
                  };
                case 'Contacted':
                  return {
                    border: 'border-amber-500',
                    dot: 'bg-amber-500',
                    badge: 'bg-amber-50 text-amber-700 border-amber-200'
                  };
                case 'Call Back':
                  return {
                    border: 'border-indigo-500',
                    dot: 'bg-indigo-500',
                    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  };
                case 'Interested':
                  return {
                    border: 'border-purple-500',
                    dot: 'bg-purple-500',
                    badge: 'bg-purple-50 text-purple-700 border-purple-200'
                  };
                case 'Send Proposal':
                  return {
                    border: 'border-violet-500',
                    dot: 'bg-violet-500',
                    badge: 'bg-violet-50 text-violet-700 border-violet-200'
                  };
                case 'Converted':
                  return {
                    border: 'border-emerald-500',
                    dot: 'bg-emerald-500',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  };
                default:
                  return {
                    border: 'border-slate-400',
                    dot: 'bg-slate-400',
                    badge: 'bg-slate-50 text-slate-700 border-slate-200'
                  };
              }
            };
            const style = getStageHeaderStyle(st);

            return (
              <div
                key={st}
                className="bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[480px] shadow-xs"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">{st}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${style.badge}`}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                      <p className="text-xs text-slate-400 font-medium">No leads in {st}</p>
                      {st === 'New' && (
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition block mx-auto"
                        >
                          + Add a lead
                        </button>
                      )}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3 group"
                      >
                        {/* Title & Duplicate Warning */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                              {lead.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              {lead.company}
                            </p>
                          </div>
                          {duplicateLeadMap.has(lead.id) && (
                            <span
                              title={`Duplicate contact details with "${duplicateLeadMap.get(lead.id)?.matchedLead.name}"`}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5 shrink-0 cursor-help"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>Duplicate</span>
                            </span>
                          )}
                        </div>

                        {/* Service & Country Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100/60 truncate max-w-[200px]">
                            {lead.interestedService}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-medium">{lead.country}</span>
                        </div>

                        {/* Communication Quick Shortcuts */}
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-600">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, this is ROOT 4 TECH following up regarding your inquiry for ${lead.interestedService}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-1 text-[10px] font-sans font-semibold border border-emerald-100"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}?subject=${encodeURIComponent(`ROOT 4 TECH Follow-up: ${lead.interestedService}`)}`}
                              title="Send Email"
                              className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center gap-1 text-[10px] font-sans font-semibold border border-blue-100"
                            >
                              <Mail className="w-3 h-3 text-blue-600" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>

                        {/* Footer Action & Stage Move Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          {/* Left: View & Edit buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingLead(lead)}
                              title="View Lead Details"
                              className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(lead)}
                              title="Edit Lead"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(lead)}
                              title="Delete Lead"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Right: Stage Advancement Buttons */}
                          <div className="flex items-center gap-1">
                            {st !== 'New' && (
                              <button
                                type="button"
                                onClick={() => handleRegressStage(lead)}
                                title="Move to previous stage"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {st !== 'Converted' ? (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(lead)}
                                title="Advance to next pipeline stage"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-[10px] font-bold transition shadow-2xs"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConvert(lead)}
                                title="Convert to Active Client"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Convert</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Professional Leads Table with Checkboxes & Pagination */
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Cross-page selection banner when page is selected */}
        {isAllCurrentPageSelected && totalItems > paginatedLeads.length && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex flex-wrap items-center justify-center gap-2">
            <span>
              All <strong>{paginatedLeads.length}</strong> leads on this page are selected.
            </span>
            {selectedLeadIds.length < filteredLeads.length ? (
              <button
                onClick={selectAllFilteredLeads}
                className="font-bold underline text-blue-700 hover:text-blue-900 ml-1 transition"
              >
                Select all {filteredLeads.length} leads across all pages
              </button>
            ) : (
              <span className="font-semibold text-emerald-700 ml-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline" /> All {filteredLeads.length} leads across all pages selected
              </span>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 flex items-center justify-center w-full"
                    title={isAllCurrentPageSelected ? "Deselect page" : "Select all leads on this page"}
                  >
                    {isAllCurrentPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isPartiallySelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 font-semibold">Lead Name</th>
                <th className="py-3.5 px-4 font-semibold">Company</th>
                <th className="py-3.5 px-4 font-semibold">Phone</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Country</th>
                <th className="py-3.5 px-4 font-semibold">Interested Service</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Date Added</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => toggleSelectOne(lead.id)}
                        className="text-slate-400 hover:text-slate-600 flex items-center justify-center w-full"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{lead.name}</span>
                        {duplicateLeadMap.has(lead.id) && (
                          <span
                            title={`Duplicate warning: shares contact details with "${duplicateLeadMap.get(lead.id)?.matchedLead.name}" (${duplicateLeadMap.get(lead.id)?.matchedLead.company})`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Duplicate</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {lead.company}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={duplicateLeadMap.get(lead.id)?.type === 'phone' || duplicateLeadMap.get(lead.id)?.type === 'both' ? 'text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200' : ''}>
                          {lead.phone}
                        </span>
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, this is ROOT 4 TECH regarding your inquiry for ${lead.interestedService}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Direct WhatsApp Chat"
                            className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shrink-0"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={duplicateLeadMap.get(lead.id)?.type === 'email' || duplicateLeadMap.get(lead.id)?.type === 'both' ? 'text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200' : ''}>
                          {lead.email}
                        </span>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=${encodeURIComponent(`ROOT 4 TECH Follow-up: ${lead.interestedService}`)}`}
                            title="Send Email"
                            className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition shrink-0"
                          >
                            <Mail className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {lead.country}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={lead.interestedService}>
                      {lead.interestedService}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          const newSt = e.target.value as LeadStatus;
                          if (newSt === 'Converted') {
                            openConvertModal(lead);
                          } else {
                            updateLead(lead.id, { status: newSt });
                            showToast(`"${lead.name}" status updated to: ${newSt}`);
                          }
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition shadow-2xs ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Call Back">Call Back</option>
                        <option value="Interested">Interested</option>
                        <option value="Send Proposal">Send Proposal</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium">
                      {lead.dateAdded}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {lead.status !== 'Converted' ? (
                          <button
                            onClick={() => handleConvert(lead)}
                            title="Convert into Client with Details"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Convert</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openConvertModal(lead)}
                            title="Review / Edit Client Details"
                            className="px-2 py-1 rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-200 transition"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Client</span>
                          </button>
                        )}
                        <button
                          onClick={() => setViewingLead(lead)}
                          title="View Lead Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(lead)}
                          title="Edit Lead Information"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Lead</span>
                        </button>
                        <button
                          onClick={() => setLeadToDelete(lead)}
                          title="Delete this lead separately"
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Lead</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Filter className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No leads available</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        There are currently no leads matching your search criteria or in the pipeline.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <button
                          onClick={openAddModal}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Your First Lead</span>
                        </button>
                        {leads.length === 0 && (
                          <button
                            onClick={() => {
                              addMultipleLeads(INITIAL_LEADS);
                              showToast('Loaded 32 initial demo leads to pipeline!');
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Load 32 Demo Leads</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive Responsive Pagination Bar */}
        {filteredLeads.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Summary and Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 text-slate-600 w-full md:w-auto justify-between md:justify-start">
              <span>
                Showing <strong className="text-slate-900 font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
                <strong className="text-slate-900 font-semibold">{endIndex}</strong> of{' '}
                <strong className="text-slate-900 font-semibold">{totalItems}</strong> leads
                {filteredLeads.length !== leads.length && (
                  <span className="text-slate-400 ml-1">
                    (filtered from {leads.length} total)
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-slate-500 hidden sm:inline">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-600 transition cursor-pointer shadow-2xs"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            {/* Right: Page Buttons & Quick Jump */}
            <div className="flex items-center gap-1 w-full md:w-auto justify-center md:justify-end overflow-x-auto py-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={activePage === 1}
                title="First Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-2xs"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={activePage === 1}
                title="Previous Page"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none font-bold">
                        …
                      </span>
                    );
                  }
                  const isCur = item === activePage;
                  return (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition ${
                        isCur
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-2xs'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={activePage === totalPages}
                title="Next Page"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-2xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={activePage === totalPages}
                title="Last Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35 disabled:cursor-not-allowed transition shadow-2xs"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Jump Input if totalPages >= 4 */}
              {totalPages >= 4 && (
                <form
                  onSubmit={handleJumpToPage}
                  className="flex items-center gap-1 ml-1.5 pl-2 border-l border-slate-200"
                >
                  <span className="text-[11px] text-slate-400 hidden lg:inline">Page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    placeholder={String(activePage)}
                    className="w-11 h-8 px-1 text-center text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="px-2 h-8 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold transition text-[11px]"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* ADD / EDIT LEAD MODAL */}
      {(isAddModalOpen || editingLead) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingLead(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingLead ? handleSaveEdit : handleSaveAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Miller"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name *
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Real-Time Live Duplicate Lead Warning in Form */}
              {(() => {
                const activeDup = checkDuplicateLead(email, phone, editingLead?.id);
                if (!activeDup) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            Duplicate Warning ({activeDup.type === 'both' ? 'Email & Phone Match' : activeDup.type === 'email' ? 'Email Match' : 'Phone Match'})
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(activeDup.matchedLead.status)}`}>
                            {activeDup.matchedLead.status}
                          </span>
                        </div>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          {activeDup.details}. Belongs to <strong className="text-amber-950 font-bold">{activeDup.matchedLead.name}</strong> ({activeDup.matchedLead.company}).
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setViewingLead(activeDup.matchedLead)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-300 flex items-center gap-1 transition shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-amber-700" />
                            <span>View Existing Lead</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    required
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Call Back">Call Back</option>
                    <option value="Interested">Interested</option>
                    <option value="Send Proposal">Send Proposal</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interested Service *
                </label>
                <select
                  value={interestedService}
                  onChange={(e) => setInterestedService(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Custom Web & Cloud Platform">Custom Web & Cloud Platform</option>
                  <option value="Enterprise Architecture & DevOps">Enterprise Architecture & DevOps</option>
                  <option value="Mobile Application (iOS/Android)">Mobile Application (iOS/Android)</option>
                  <option value="Payment Gateway Integration">Payment Gateway Integration</option>
                  <option value="AI Integration & Telemetry">AI Integration & Telemetry</option>
                  <option value="UI/UX Engineering & Design System">UI/UX Engineering & Design System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional project scope, meeting notes, requirements..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingLead(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEAD DETAILS MODAL */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Lead Profile
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                    viewingLead.status
                  )}`}
                >
                  {viewingLead.status}
                </span>
              </div>
              <button
                onClick={() => setViewingLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Full Name</span>
                <span className="text-sm font-bold text-slate-900">{viewingLead.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Company</span>
                  <span className="font-semibold text-slate-800">{viewingLead.company}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Phone</span>
                    <span className="font-mono text-slate-800">{viewingLead.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Email</span>
                    <span className="font-mono text-slate-800 truncate block">{viewingLead.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Country</span>
                  <span className="font-medium text-slate-800">{viewingLead.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Interested Service</span>
                  <span className="font-medium text-blue-600">{viewingLead.interestedService}</span>
                </div>
              </div>

              {viewingLead.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Notes:</span>
                  <p className="text-slate-700 leading-relaxed">{viewingLead.notes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Added: {viewingLead.dateAdded}</span>
              <div className="flex items-center gap-2">
                {viewingLead.status !== 'Converted' ? (
                  <button
                    onClick={() => {
                      const target = viewingLead;
                      openConvertModal(target);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Convert to Client</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const target = viewingLead;
                      openConvertModal(target);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit Client Details</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const target = viewingLead;
                    setViewingLead(null);
                    openEditModal(target);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Lead</span>
                </button>
                <button
                  onClick={() => {
                    const target = viewingLead;
                    setViewingLead(null);
                    setLeadToDelete(target);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Lead Separately</span>
                </button>
                <button
                  onClick={() => setViewingLead(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEPARATE DELETE CONFIRMATION MODAL */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Lead Separately
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently remove this individual lead record? This deletes <strong className="text-slate-800">{leadToDelete.name}</strong> from <strong className="text-slate-800">{leadToDelete.company}</strong> separately without affecting any other pipeline leads.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Name:</span>
                <span className="font-bold text-slate-900">{leadToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-semibold text-slate-800">{leadToDelete.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-700">{leadToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-700">{leadToDelete.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interested Service:</span>
                <span className="font-medium text-blue-600">{leadToDelete.interestedService}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Separate Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT LEAD TO CLIENT MODAL WITH DETAILED INTAKE */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 via-white to-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Convert Lead to Client
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify client profile details, contract value, and generate opening records.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertingLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Intermediate Pipeline Fast-Track Options */}
            <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">
                  Not ready to convert into a won client yet?
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    updateLead(convertingLead.id, { status: 'Call Back' });
                    showToast(`"${convertingLead.name}" moved to Call Back stage.`);
                    setConvertingLead(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <PhoneForwarded className="w-3 h-3" />
                  <span>Call Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateLead(convertingLead.id, { status: 'Send Proposal' });
                    showToast(`"${convertingLead.name}" moved to Send Proposal stage.`);
                    setConvertingLead(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white border border-violet-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Proposal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateLead(convertingLead.id, { status: 'Interested' });
                    showToast(`"${convertingLead.name}" moved to Interested stage.`);
                    setConvertingLead(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Interested</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Conversion Form */}
            <form onSubmit={handleConfirmConversion} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client / Contact Person *
                  </label>
                  <input
                    required
                    type="text"
                    value={convClientName}
                    onChange={(e) => setConvClientName(e.target.value)}
                    placeholder="e.g. Sarah Miller"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    required
                    type="text"
                    value={convCompanyName}
                    onChange={(e) => setConvCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Tech"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={convEmail}
                    onChange={(e) => setConvEmail(e.target.value)}
                    placeholder="sarah@apex.com"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    required
                    type="text"
                    value={convPhone}
                    onChange={(e) => setConvPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country / Region
                  </label>
                  <input
                    type="text"
                    value={convCountry}
                    onChange={(e) => setConvCountry(e.target.value)}
                    placeholder="e.g. Pakistan, United States"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contracted Service / Project Scope *
                  </label>
                  <select
                    value={convService}
                    onChange={(e) => setConvService(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Custom Web & Cloud Platform">Custom Web & Cloud Platform</option>
                    <option value="Enterprise Architecture & DevOps">Enterprise Architecture & DevOps</option>
                    <option value="Mobile Application (iOS/Android)">Mobile Application (iOS/Android)</option>
                    <option value="Payment Gateway Integration">Payment Gateway Integration</option>
                    <option value="AI Integration & Telemetry">AI Integration & Telemetry</option>
                    <option value="UI/UX Engineering & Design System">UI/UX Engineering & Design System</option>
                    <option value="Maintenance & Retainer Contract">Maintenance & Retainer Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Client Account Status
                  </label>
                  <select
                    value={convClientStatus}
                    onChange={(e) => setConvClientStatus(e.target.value as any)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Active">Active (Ready for billing & projects)</option>
                    <option value="Onboarding">Onboarding (Kickoff in progress)</option>
                    <option value="Completed">Completed (One-time delivery)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Contract Value (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      PKR
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={convInitialValue}
                      onChange={(e) => setConvInitialValue(e.target.value)}
                      placeholder="150000"
                      className="w-full h-9 pl-12 pr-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sets initial billed amount and milestone baseline in Client profile.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Onboarding Notes / Terms
                  </label>
                  <textarea
                    rows={2}
                    value={convNotes}
                    onChange={(e) => setConvNotes(e.target.value)}
                    placeholder="Specific milestones, special SLA agreements, contact preferences..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>
              </div>

              {/* Automatic Record Creation Checkboxes */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Records & Billing Actions</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={convCreateInvoice}
                      onChange={(e) => setConvCreateInvoice(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>
                      Auto-generate opening <strong>Invoice (INV)</strong> for this client ({convInitialValue ? `${Number(convInitialValue).toLocaleString()} PKR` : '85,000 PKR'})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={convCreateQuotation}
                      onChange={(e) => setConvCreateQuotation(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>
                      Auto-generate accepted <strong>Quotation / Proposal (QUO)</strong> for project archives
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Convert & Create Client Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DUPLICATE LEAD WARNING CONFIRMATION MODAL */}
      {duplicateWarningModal && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Duplicate Lead Warning
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A lead with this {duplicateWarningModal.match.type === 'both' ? 'email and phone number' : duplicateWarningModal.match.type === 'email' ? 'email address' : 'phone number'} already exists in your pipeline.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 text-slate-700">
              <div className="font-semibold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center justify-between">
                <span>Existing Matching Lead:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(duplicateWarningModal.match.matchedLead.status)}`}>
                  {duplicateWarningModal.match.matchedLead.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-slate-900">{duplicateWarningModal.match.matchedLead.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-semibold text-slate-800">{duplicateWarningModal.match.matchedLead.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-800">{duplicateWarningModal.match.matchedLead.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-800">{duplicateWarningModal.match.matchedLead.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDuplicateWarningModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel & Review
              </button>
              <button
                type="button"
                onClick={duplicateWarningModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <span>Save Duplicate Anyway</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
