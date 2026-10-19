import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Calendar } from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationCenter } from '@/components/NotificationCenter';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return { title: 'Dashboard', subtitle: 'Overview of leads, clients, and revenue' };
      case '/leads':
        return { title: 'Leads Management', subtitle: 'Track and qualify incoming prospective clients' };
      case '/clients':
        return { title: 'Clients Management', subtitle: 'Active customer accounts and contracts' };
      case '/quotations':
        return { title: 'Quotations', subtitle: 'Manage commercial price estimates and proposals' };
      case '/invoices':
        return { title: 'Invoices', subtitle: 'Billing statements and customer receivable tracking' };
      case '/sales':
        return { title: 'Sales Records', subtitle: 'Historical completed transactions and paid invoices' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Company profile and system preferences' };
      default:
        return { title: 'Dashboard', subtitle: 'Administrative workspace' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden shrink-0"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page Title & Subtitle */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Top Right Utilities: Search, Calendar, and Notification Center */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search bar */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-400 cursor-pointer transition w-36 sm:w-56 md:w-64 shadow-2xs group"
            title="Search... (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
            <span className="text-slate-500 font-normal">Search...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">Ctrl K</kbd>
          </div>

          {/* Calendar Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{formattedDate}</span>
          </div>

          {/* Bell Icon Notification Center */}
          <NotificationCenter />
        </div>
      </header>

      {/* Omnisearch Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};

