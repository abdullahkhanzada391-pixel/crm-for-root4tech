import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Quotation, QuotationItem, QuotationStatus } from '@/types/crm';
import {
  FileText,
  Plus,
  Search,
  Eye,
  CheckCircle,
  CheckCircle2,
  Trash2,
  Printer,
  X,
  Building,
  DollarSign,
  Edit2,
  AlertCircle,
  Clock,
  Send,
  Calendar,
  Sparkles,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@/components/common/Tooltip';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';

export const QuotationsPage: React.FC = () => {
  const {
    quotations,
    clients,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    deleteMultipleQuotations
  } = useCRM();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals & States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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


  // Single Quotation Form State
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('130000');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('Sent');
  const [notes, setNotes] = useState('');

  // Multi-Service Items for Single Quotation
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      service: 'Custom Web Application Development',
      description: 'System architecture, responsive UI, database design, and admin panel',
      amount: 85000
    },
    {
      id: 'item-2',
      service: 'Digital Marketing & Social Media Growth',
      description: 'Paid ad campaigns on Meta & Google Ads, SEO optimization, and weekly performance reports',
      amount: 45000
    }
  ]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const calculateTotalFromItems = (items: QuotationItem[]) => {
    return items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  };

  const handleAddQuoteItem = (serviceTitle?: string, defaultAmount?: number) => {
    const nextNum = quoteItems.length + 1;
    const newItem: QuotationItem = {
      id: `item-${Date.now()}-${nextNum}`,
      service: serviceTitle || (nextNum === 2 ? 'Digital Marketing & Social Media Growth' : `Service Scope #${nextNum}`),
      description: 'Scope deliverables, architecture, testing, and deployment',
      amount: defaultAmount || 45000
    };
    const updated = [...quoteItems, newItem];
    setQuoteItems(updated);
    setAmount(calculateTotalFromItems(updated).toString());
    setService(updated.map(i => i.service).join(' + '));
    showToast(`Added service "${newItem.service}" to quotation!`);
  };

  const handleRemoveQuoteItem = (id: string) => {
    if (quoteItems.length <= 1) {
      showToast('A quotation must have at least one service item.');
      return;
    }
    const updated = quoteItems.filter(i => i.id !== id);
    setQuoteItems(updated);
    setAmount(calculateTotalFromItems(updated).toString());
    setService(updated.map(i => i.service).join(' + '));
  };

  const handleQuoteItemChange = (id: string, field: 'service' | 'description' | 'amount', value: any) => {
    const updated = quoteItems.map(item => (item.id === id ? { ...item, [field]: value } : item));
    setQuoteItems(updated);
    setAmount(calculateTotalFromItems(updated).toString());
    setService(updated.map(i => i.service).join(' + '));
  };

  const openAddModal = () => {
    setEditingQuote(null);
    if (clients.length > 0) {
      setClientType('existing');
      setClientCompany(clients[0].company);
      setClientName(clients[0].name);
      setClientEmail(clients[0].email);
    } else {
      setClientType('new');
      setClientCompany('');
      setClientName('');
      setClientEmail('');
    }
    const initialItems: QuotationItem[] = [
      {
        id: `item-${Date.now()}-1`,
        service: 'Custom Web Application Development',
        description: 'Responsive frontend UI, RESTful API backend, PostgreSQL database, and admin management portal',
        amount: 85000
      },
      {
        id: `item-${Date.now()}-2`,
        service: 'Digital Marketing & Social Media Growth',
        description: 'Meta & Google Ads campaigns, conversion optimization, SEO audits, and monthly lead reports',
        amount: 45000
      }
    ];
    setQuoteItems(initialItems);
    const sum = calculateTotalFromItems(initialItems);
    setAmount(sum.toString());
    setService(initialItems.map(i => i.service).join(' + '));
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setValidUntil(futureDate);
    setStatus('Sent');
    setNotes('Includes architecture setup, QA testing, deployment, and 30-day post-launch support.');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Quotation) => {
    setEditingQuote(q);
    setClientCompany(q.companyName);
    setClientName(q.clientName);
    setClientEmail(q.clientEmail || '');
    setService(q.service);
    setAmount(q.amount.toString());
    setValidUntil(q.validUntil);
    setStatus(q.status);
    setNotes(q.notes || '');
    setClientType('new'); // allows direct text editing of company/name

    if (q.items && q.items.length > 0) {
      setQuoteItems(q.items.map(it => ({ ...it })));
      setAmount(calculateTotalFromItems(q.items).toString());
    } else {
      const fallback: QuotationItem[] = [
        {
          id: `item-${Date.now()}`,
          service: q.service,
          description: 'Core project deliverables and scope',
          amount: q.amount
        }
      ];
      setQuoteItems(fallback);
      setAmount(q.amount.toString());
    }
    setIsModalOpen(true);
  };

  const handleClientSelectChange = (company: string) => {
    setClientCompany(company);
    const matched = clients.find(c => c.company === company);
    if (matched) {
      setClientName(matched.name);
      setClientEmail(matched.email);
    }
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = quoteItems.length > 0
      ? calculateTotalFromItems(quoteItems)
      : (parseFloat(amount) || 0);

    const consolidatedService = quoteItems.length > 0
      ? quoteItems.map(i => i.service.trim()).filter(Boolean).join(' + ')
      : service;

    if (editingQuote) {
      updateQuotation(editingQuote.id, {
        clientName,
        companyName: clientCompany,
        clientEmail,
        service: consolidatedService,
        items: quoteItems,
        amount: numericAmount,
        validUntil,
        status,
        notes
      });
      showToast(`Quotation "${editingQuote.quoteNumber}" updated successfully!`);
    } else {
      const created = addQuotation({
        clientName,
        companyName: clientCompany,
        clientEmail,
        service: consolidatedService,
        items: quoteItems,
        amount: numericAmount,
        validUntil,
        status,
        notes
      });
      showToast(`Quotation "${created.quoteNumber}" created successfully for ${clientCompany}!`);
    }

    setIsModalOpen(false);
    setEditingQuote(null);
  };

  const confirmDeleteQuote = () => {
    if (!quoteToDelete) return;
    deleteQuotation(quoteToDelete.id);
    showToast(`Quotation "${quoteToDelete.quoteNumber}" removed.`);
    setQuoteToDelete(null);
    if (viewingQuote?.id === quoteToDelete.id) {
      setViewingQuote(null);
    }
  };

  const handleAcceptQuote = (quote: Quotation) => {
    updateQuotation(quote.id, { status: 'Accepted' });
    showToast(`Quotation "${quote.quoteNumber}" marked as Accepted!`);
  };



  const handleSelectAll = () => {
    if (selectedQuoteIds.length === filteredQuotes.length) {
      setSelectedQuoteIds([]);
    } else {
      setSelectedQuoteIds(filteredQuotes.map(q => q.id));
    }
  };

  const handleToggleSelectQuote = (id: string) => {
    setSelectedQuoteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedQuoteIds.length === 0) return;
    deleteMultipleQuotations(selectedQuoteIds);
    showToast(`Deleted ${selectedQuoteIds.length} quotations successfully.`);
    setSelectedQuoteIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const filteredQuotes = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(query) ||
      q.companyName.toLowerCase().includes(query) ||
      q.clientName.toLowerCase().includes(query) ||
      q.service.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (st: QuotationStatus) => {
    switch (st) {
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const serviceSuggestions = [
    'Enterprise Web Application Engineering',
    'Custom CRM & Dashboard Development',
    'Mobile Application Development (Flutter / React Native)',
    'Cloud Migration & DevOps Automation',
    'API Integration & Microservices Architecture',
    'Full Stack Software Maintenance & Support'
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial Quotations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create proposals, send scope estimates in PKR, and track commercial deliverables
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Quotation</span>
        </button>
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedQuoteIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <span>{selectedQuoteIds.length} quotation{selectedQuoteIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedQuoteIds([])}
              className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-medium text-slate-700 hover:bg-purple-50 transition"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedQuoteIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Draft', 'Sent', 'Accepted', 'Declined'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? `All Quotations (${quotations.length})` : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote #, company, service..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="overflow-x-auto min-h-[300px] pb-12">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredQuotes.length > 0 && selectedQuoteIds.length === filteredQuotes.length}
                    onChange={handleSelectAll}
                    aria-label="Select all quotations"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-semibold">Quote #</th>
                <th className="py-3.5 px-4 font-semibold">Client / Organization</th>
                <th className="py-3.5 px-4 font-semibold">Scope of Service</th>
                <th className="py-3.5 px-4 font-semibold">Date Issued</th>
                <th className="py-3.5 px-4 font-semibold">Valid Until</th>
                <th className="py-3.5 px-4 font-semibold">Amount (PKR)</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q, index) => (
                <tr key={q.id} className={`hover:bg-slate-50/60 transition-colors ${openActionDropdownId === q.id ? 'relative z-30' : ''} ${selectedQuoteIds.includes(q.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="py-3.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedQuoteIds.includes(q.id)}
                      onChange={() => handleToggleSelectQuote(q.id)}
                      aria-label={`Select quotation ${q.quoteNumber}`}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-blue-600 font-mono whitespace-nowrap">
                    {q.quoteNumber}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{q.companyName}</div>
                    <div className="text-[11px] text-slate-500">{q.clientName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs" title={q.service}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate max-w-[200px] inline-block font-medium text-slate-800">{q.service}</span>
                      {q.items && q.items.length > 1 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          {q.items.length} Services
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {q.dateIssued}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {q.validUntil}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono whitespace-nowrap">
                    PKR {q.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        q.status
                      )}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="relative inline-block text-left action-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionDropdownId(openActionDropdownId === q.id ? null : q.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition shadow-2xs active:scale-95 ${
                          openActionDropdownId === q.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>Actions</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            openActionDropdownId === q.id ? 'rotate-180 text-white' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      {openActionDropdownId === q.id && (
                        <div
                          className={`absolute right-0 ${
                            index >= filteredQuotes.length - 2 && filteredQuotes.length > 2
                              ? 'bottom-full mb-1.5'
                              : 'top-full mt-1.5'
                          } w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {q.status !== 'Accepted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleAcceptQuote(q);
                                  setOpenActionDropdownId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2.5 font-medium transition"
                              >
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                <span>Mark as Accepted</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setViewingQuote(q);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 hover:text-blue-700 flex items-center gap-2.5 font-medium transition"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              <span>View / Print Quotation</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                openEditModal(q);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium text-slate-800 transition"
                            >
                              <Edit2 className="w-4 h-4 text-indigo-600" />
                              <span>Edit Quotation Details</span>
                            </button>
                          </div>
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteToDelete(q);
                                setOpenActionDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 font-medium transition"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                              <span>Delete Quotation</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No quotations found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Create client proposals with multiple service deliverables and print-ready quotations in PKR.
                      </p>
                      <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Quotation</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT QUOTATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingQuote ? `Edit Quotation — ${editingQuote.quoteNumber}` : 'Create Commercial Quotation'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingQuote
                    ? 'Update deliverables, quotation terms, amount in PKR, or validity date'
                    : 'Issue a formal scope proposal and price estimate for Root 4 Tech clients'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingQuote(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-4">
              {/* Client Selection Toggle (only for new quotation) */}
              {!editingQuote && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Client / Prospective Company</div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="clientType"
                        checked={clientType === 'existing'}
                        onChange={() => setClientType('existing')}
                        className="text-blue-600"
                      />
                      <span>Select Existing Client ({clients.length})</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="clientType"
                        checked={clientType === 'new'}
                        onChange={() => {
                          setClientType('new');
                          setClientCompany('');
                          setClientName('');
                          setClientEmail('');
                        }}
                        className="text-blue-600"
                      />
                      <span>New Prospective Client</span>
                    </label>
                  </div>
                </div>
              )}

              {clientType === 'existing' && !editingQuote && clients.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Client *
                  </label>
                  <select
                    value={clientCompany}
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
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Apex Global Tech"
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
                      placeholder="e.g. Bilal Khan"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Multi-Service Quotation Items (Multiple Quotes for this Single Client) */}
              <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Multiple Services / Quote Items ({quoteItems.length} Added)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Add multiple quotes for this client (e.g. Web Development + Digital Marketing)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddQuoteItem()}
                    className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs self-start sm:self-auto transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Service</span>
                  </button>
                </div>

                {/* Quick Add Suggestions Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Quick Add:</span>
                  {[
                    { label: 'Web Development', amount: 85000 },
                    { label: 'Digital Marketing', amount: 45000 },
                    { label: 'Mobile App (Flutter/RN)', amount: 110000 },
                    { label: 'SEO & Content Campaign', amount: 35000 },
                    { label: 'Cloud & DevOps Migration', amount: 65000 },
                    { label: 'UI/UX Product Design', amount: 40000 }
                  ].map(sug => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => handleAddQuoteItem(sug.label, sug.amount)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 font-medium transition shadow-2xs"
                    >
                      + {sug.label}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="space-y-2.5 mt-2">
                  {quoteItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            required
                            type="text"
                            placeholder="Service Title (e.g. Custom Web Application Development)"
                            value={item.service}
                            onChange={(e) => handleQuoteItemChange(item.id, 'service', e.target.value)}
                            className="flex-1 h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="w-32 sm:w-36 shrink-0">
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400 font-mono">PKR</span>
                            <input
                              required
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleQuoteItemChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Amount"
                              className="w-full h-8 pl-9 pr-2 rounded-md border border-slate-200 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 text-right"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={quoteItems.length <= 1}
                          onClick={() => handleRemoveQuoteItem(item.id)}
                          title="Remove service item"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 disabled:pointer-events-none transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Scope description (e.g. Frontend architecture, backend REST APIs, PostgreSQL database)"
                        value={item.description || ''}
                        onChange={(e) => handleQuoteItemChange(item.id, 'description', e.target.value)}
                        className="w-full h-7 px-2.5 rounded-md border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                      />
                    </div>
                  ))}
                </div>

                {/* Total Combined Banner */}
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-900">
                    Total Estimated Quotation ({quoteItems.length} Services):
                  </span>
                  <span className="text-sm font-bold font-mono text-blue-700">
                    PKR {calculateTotalFromItems(quoteItems).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Validity Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valid Until Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quotation Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commercial Terms & Scope Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Milestone schedule, hourly rate breakdown, validity conditions..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingQuote(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  {editingQuote ? 'Save Changes' : 'Save & Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ============================================================ */}
      {/* BULK DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Multiple Quotations
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-slate-800">{selectedQuoteIds.length}</strong> selected quotations? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete {selectedQuoteIds.length} Quotations</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE QUOTATION CONFIRMATION MODAL */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Quotation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete quotation <strong className="text-slate-800">{quoteToDelete.quoteNumber}</strong> for <strong className="text-slate-800">{quoteToDelete.companyName}</strong> (PKR {quoteToDelete.amount.toLocaleString()})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuote}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW & PRINT QUOTATION MODAL */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document Preview (PKR)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quotation</span>
                </button>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div id="printableDocument" className="p-4 sm:p-6 bg-white space-y-6 text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <Root4TechLogo size="lg" showText={true} subtitle="Software Development & Technology Operations" variant="print" />
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    NTN: 8492041-9 · contact@root4tech.com · www.root4tech.com
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold font-mono text-blue-600">
                    QUOTATION
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                    {viewingQuote.quoteNumber}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      viewingQuote.status
                    )}`}
                  >
                    {viewingQuote.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                    Prepared For:
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {viewingQuote.companyName}
                  </div>
                  <div className="text-slate-600">{viewingQuote.clientName}</div>
                  {viewingQuote.clientEmail && (
                    <div className="text-slate-400 font-mono">{viewingQuote.clientEmail}</div>
                  )}
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div>
                    <span className="text-slate-400">Date Issued: </span>
                    <span className="font-semibold text-slate-800">{viewingQuote.dateIssued}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Valid Until: </span>
                    <span className="font-semibold text-slate-800">{viewingQuote.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* Scope Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Service Description</th>
                      <th className="py-2.5 px-4 text-right">Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingQuote.items && viewingQuote.items.length > 0 ? (
                      viewingQuote.items.map((it, idx) => (
                        <tr key={it.id || idx} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{it.service}</div>
                            {it.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5">{it.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                            PKR {it.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 px-4 font-medium text-slate-900">
                          {viewingQuote.service}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                          PKR {viewingQuote.amount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {viewingQuote.notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-1">Commercial Terms:</span>
                  {viewingQuote.notes}
                </div>
              )}

              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <div className="text-[11px] text-slate-400">
                  Authorized Signatory: Root 4 Tech Administration
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Estimate:</span>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    PKR {viewingQuote.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
