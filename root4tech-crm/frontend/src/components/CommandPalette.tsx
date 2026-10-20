import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import {
  Search,
  Filter,
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  PlusCircle,
  AlertTriangle,
  Download,
  ArrowRight,
  Sparkles,
  X,
  CreditCard
} from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Navigation' | 'Leads' | 'Clients' | 'Quotations';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { leads, clients, quotations } = useCRM();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct items
  const items: CommandItem[] = React.useMemo(() => {
    const list: CommandItem[] = [];

    // Quick Actions
    list.push({
      id: 'act-new-lead',
      category: 'Actions',
      title: 'Create New Lead',
      subtitle: 'Add prospective customer with phone & email duplicate check',
      icon: <PlusCircle className="w-4 h-4 text-blue-600" />,
      badge: 'Action',
      badgeColor: 'bg-blue-100 text-blue-800',
      action: () => {
        navigate('/leads?action=new');
        onClose();
      }
    });

    list.push({
      id: 'act-new-quote',
      category: 'Actions',
      title: 'Create Quotation Proposal',
      subtitle: 'Draft commercial proposal & price estimate',
      icon: <FileText className="w-4 h-4 text-purple-600" />,
      badge: 'Action',
      badgeColor: 'bg-purple-100 text-purple-800',
      action: () => {
        navigate('/quotations?action=new');
        onClose();
      }
    });

    list.push({
      id: 'act-view-duplicates',
      category: 'Actions',
      title: 'Audit Duplicate Leads',
      subtitle: 'Find all conflicting pipeline leads by phone or email',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      badge: 'Audit',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        navigate('/leads?filter=duplicates');
        onClose();
      }
    });

    list.push({
      id: 'act-export-leads',
      category: 'Actions',
      title: 'Export All Leads (CSV)',
      subtitle: 'Download complete pipeline to Excel/Spreadsheet',
      icon: <Download className="w-4 h-4 text-slate-600" />,
      badge: 'Export',
      badgeColor: 'bg-slate-100 text-slate-800',
      action: () => {
        const rows = leads.map(l => ({
          ID: l.id,
          Name: l.name,
          Company: l.company,
          Email: l.email,
          Phone: l.phone,
          Country: l.country,
          Service: l.interestedService,
          Status: l.status,
          Notes: l.notes || ''
        }));
        exportToCsv('Root4Tech_Leads_Full.csv', rows);
        onClose();
      }
    });

    // Navigation Pages
    const pages = [
      { path: '/dashboard', label: 'Executive Dashboard', desc: 'KPIs, pipeline values, and revenue', icon: <LayoutDashboard className="w-4 h-4 text-blue-600" /> },
      { path: '/leads', label: 'Leads Pipeline & Kanban', desc: 'Track incoming inquiries and stages', icon: <Filter className="w-4 h-4 text-indigo-600" /> },
      { path: '/quotations', label: 'Quotations & Proposals', desc: 'Commercial price proposals', icon: <FileText className="w-4 h-4 text-purple-600" /> },
      { path: '/clients', label: 'Clients Directory', desc: 'Active customer accounts', icon: <Users className="w-4 h-4 text-cyan-600" /> },
      { path: '/sales', label: 'Sales Records Ledger', desc: 'Paid transactions and revenue history', icon: <CreditCard className="w-4 h-4 text-teal-600" /> },
      { path: '/settings', label: 'Settings & Preferences', desc: 'System configuration and preferences', icon: <Settings className="w-4 h-4 text-slate-600" /> }
    ];

    pages.forEach(p => {
      list.push({
        id: `nav-${p.path}`,
        category: 'Navigation',
        title: p.label,
        subtitle: p.desc,
        icon: p.icon,
        action: () => {
          navigate(p.path);
          onClose();
        }
      });
    });

    // CRM Data Matching
    if (query.trim()) {
      const q = query.toLowerCase();

      // Matching Leads
      leads
        .filter(
          l =>
            l.name.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            l.interestedService.toLowerCase().includes(q)
        )
        .slice(0, 6)
        .forEach(l => {
          list.push({
            id: `lead-${l.id}`,
            category: 'Leads',
            title: `${l.name} · ${l.company}`,
            subtitle: `${l.interestedService} · ${l.phone} · ${l.email}`,
            icon: <Filter className="w-4 h-4 text-blue-500" />,
            badge: l.status,
            badgeColor:
              l.status === 'Converted'
                ? 'bg-emerald-100 text-emerald-800'
                : l.status === 'Send Proposal'
                ? 'bg-violet-100 text-violet-800'
                : l.status === 'Call Back'
                ? 'bg-indigo-100 text-indigo-800'
                : l.status === 'Interested'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800',
            action: () => {
              navigate(`/leads?search=${encodeURIComponent(l.name)}`);
              onClose();
            }
          });
        });


      // Matching Quotations
      quotations
        .filter(
          qt =>
            qt.quoteNumber.toLowerCase().includes(q) ||
            qt.clientName.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .forEach(qt => {
          list.push({
            id: `quote-${qt.id}`,
            category: 'Quotations',
            title: `${qt.quoteNumber} — ${qt.clientName}`,
            subtitle: `Amount: PKR ${qt.amount.toLocaleString()} · Status: ${qt.status}`,
            icon: <FileText className="w-4 h-4 text-purple-500" />,
            badge: qt.status,
            badgeColor: 'bg-purple-100 text-purple-800',
            action: () => {
              navigate(`/quotations?search=${encodeURIComponent(qt.quoteNumber)}`);
              onClose();
            }
          });
        });

      // Matching Clients
      clients
        .filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .forEach(c => {
          list.push({
            id: `client-${c.id}`,
            category: 'Clients',
            title: `${c.name} (${c.company})`,
            subtitle: `${c.service} · ${c.email} · Billed: PKR ${(c.totalBilled || 0).toLocaleString()}`,
            icon: <Users className="w-4 h-4 text-cyan-500" />,
            badge: c.status,
            badgeColor:
              c.status === 'Active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-cyan-100 text-cyan-800',
            action: () => {
              navigate(`/clients?search=${encodeURIComponent(c.name)}`);
              onClose();
            }
          });
        });
    }

    // Filter items based on query
    if (!query.trim()) {
      return list;
    }

    const q = query.toLowerCase();
    return list.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [leads, clients, quotations, query, navigate, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < items.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all animate-in zoom-in-95">
        {/* Header Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, lead name, phone, quote #, or client..."
            className="w-full bg-transparent border-0 px-3 py-1 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-400 ml-2">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2"
        >
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching results found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by lead name, phone digits, quotation number, or client
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-blue-700/80 text-white border-blue-500'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-semibold hidden md:inline-block px-1.5 py-0.5 rounded ${
                        isSelected ? 'text-blue-100 bg-blue-700/60' : 'text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="hidden sm:inline">Root 4 Tech Omnisearch</span>
        </div>
      </div>
    </div>
  );
};
