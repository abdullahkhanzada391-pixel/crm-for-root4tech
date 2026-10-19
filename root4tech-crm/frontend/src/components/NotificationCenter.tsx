import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import {
  Bell,
  AlertTriangle,
  Receipt,
  FileText,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'overdue_invoice' | 'duplicate_leads' | 'new_lead' | 'pending_quote';
  title: string;
  description: string;
  time: string;
  actionUrl: string;
  badge: string;
  badgeClass: string;
}

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, leads, quotations } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('root4tech_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Compute dynamic notifications from live CRM data
  const notifications: NotificationItem[] = React.useMemo(() => {
    const items: NotificationItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Overdue invoices
    const overdueInvoices = invoices.filter(
      inv => inv.status !== 'Paid' && inv.dueDate && inv.dueDate < today
    );
    overdueInvoices.forEach(inv => {
      items.push({
        id: `notif-overdue-${inv.id}`,
        type: 'overdue_invoice',
        title: `Overdue Invoice ${inv.invoiceNumber}`,
        description: `${inv.clientName} owes PKR ${inv.amount.toLocaleString()} (Due: ${inv.dueDate})`,
        time: 'Payment Overdue',
        actionUrl: `/invoices?search=${encodeURIComponent(inv.invoiceNumber)}`,
        badge: 'Overdue',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200'
      });
    });

    // 2. Duplicate leads in pipeline
    const emailSet = new Map<string, string>();
    const phoneSet = new Map<string, string>();
    let duplicateCount = 0;
    leads.forEach(l => {
      const email = l.email.trim().toLowerCase();
      const phone = l.phone.replace(/[^0-9]/g, '');
      if ((email && emailSet.has(email)) || (phone && phone.length >= 7 && phoneSet.has(phone))) {
        duplicateCount++;
      } else {
        if (email) emailSet.set(email, l.id);
        if (phone && phone.length >= 7) phoneSet.set(phone, l.id);
      }
    });

    if (duplicateCount > 0) {
      items.push({
        id: 'notif-duplicates',
        type: 'duplicate_leads',
        title: `${duplicateCount} Duplicate Lead${duplicateCount > 1 ? 's' : ''} Detected`,
        description: 'Pipeline contains identical phone numbers or email addresses needing review.',
        time: 'Audit Required',
        actionUrl: '/leads?filter=duplicates',
        badge: 'Warning',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200'
      });
    }

    // 3. New unconverted leads requiring follow-up
    const newLeads = leads.filter(l => l.status === 'New');
    if (newLeads.length > 0) {
      items.push({
        id: 'notif-new-leads',
        type: 'new_lead',
        title: `${newLeads.length} New Uncontacted Lead${newLeads.length > 1 ? 's' : ''}`,
        description: `Latest from ${newLeads[0].name} (${newLeads[0].company}) seeking ${newLeads[0].interestedService}.`,
        time: 'Incoming',
        actionUrl: '/leads?filter=New',
        badge: 'Action Needed',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200'
      });
    }

    // 4. Pending Quotations
    const pendingQuotes = quotations.filter(q => q.status === 'Sent');
    if (pendingQuotes.length > 0) {
      items.push({
        id: 'notif-pending-quotes',
        type: 'pending_quote',
        title: `${pendingQuotes.length} Sent Quotation${pendingQuotes.length > 1 ? 's' : ''} Pending`,
        description: `Follow up with clients to convert proposals into invoices.`,
        time: 'Commercial',
        actionUrl: '/quotations',
        badge: 'In Review',
        badgeClass: 'bg-purple-100 text-purple-700 border-purple-200'
      });
    }

    return items;
  }, [invoices, leads, quotations]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('root4tech_read_notifications', JSON.stringify(allIds));
  };

  const markOneAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('root4tech_read_notifications', JSON.stringify(updated));
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue_invoice':
        return <Receipt className="w-4 h-4 text-rose-600" />;
      case 'duplicate_leads':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'new_lead':
        return <Filter className="w-4 h-4 text-blue-600" />;
      case 'pending_quote':
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95"
        title="Notifications & Alerts"
        aria-label="View notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No overdue invoices, duplicate leads, or pending alerts.
                </p>
              </div>
            ) : (
              notifications.map(item => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      markOneAsRead(item.id);
                      setIsOpen(false);
                      navigate(item.actionUrl);
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                      !isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${item.badgeClass}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>{item.time}</span>
                        <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                          Review <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
              Live automated alerts from ROOT 4 TECH CRM
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
