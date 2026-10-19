import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Filter,
  Users,
  UserCheck,
  FileText,
  Receipt,
  BadgeDollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
  Activity,
  LogIn,
  LogOut
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const { leads, clients, quotations, invoices } = useCRM();
  const { user, users, logout } = useAuth();

  // React effect state: tracks hovered item for tooltips & micro-interactions
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Live Counts for Navigation Items
  const unpaidInvoicesCount = invoices.filter(i => i.status !== 'Paid').length;

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { 
      label: 'Leads', 
      path: '/leads', 
      icon: Filter, 
      count: leads.length, 
      badgeColor: 'bg-blue-100 text-blue-950 border-blue-200 shadow-xs font-extrabold' 
    },
    { 
      label: 'Clients', 
      path: '/clients', 
      icon: Users, 
      count: clients.length, 
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-200 shadow-xs font-extrabold' 
    },
    { 
      label: 'Team Members', 
      path: '/team', 
      icon: UserCheck, 
      count: users.length, 
      badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-200 shadow-xs font-extrabold' 
    },
    { 
      label: 'Quotations', 
      path: '/quotations', 
      icon: FileText, 
      count: quotations.length, 
      badgeColor: 'bg-purple-100 text-purple-950 border-purple-200 shadow-xs font-extrabold' 
    },
    { 
      label: 'Invoices', 
      path: '/invoices', 
      icon: Receipt, 
      count: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined, 
      badgeColor: 'bg-amber-300 text-amber-950 border-amber-400 shadow-xs font-extrabold' 
    },
    { label: 'Sales Records', path: '/sales', icon: BadgeDollarSign },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Fixed Left Sidebar - Modern Solid Charcoal / Slate Theme */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-black/50 text-slate-100 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo / Brand Header */}
          <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-3 overflow-hidden group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Root4TechLogo size="md" showText={!isCollapsed} subtitle="CRM Platform" variant="dark" />
            </div>

            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu (7 Items) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {!isCollapsed && (
              <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Management</span>
                <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/80 shadow-xs">PKR</span>
              </div>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isHovered = hoveredPath === item.path;

                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Left Glowing Cyan Active Marker */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-300 rounded-r-full shadow-xs shadow-cyan-300" />
                          )}

                          <Icon
                            className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                              isActive ? 'text-white scale-105' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                            }`}
                          />

                          {!isCollapsed && (
                            <span className="truncate flex-1 tracking-tight">
                              {item.label}
                            </span>
                          )}

                          {/* Live Count Badges */}
                          {!isCollapsed && item.count !== undefined && item.count > 0 && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all shrink-0 ${
                                isActive
                                  ? 'bg-white text-blue-700 border-white shadow-sm'
                                  : item.badgeColor || 'bg-white text-slate-900 border-white shadow-xs'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* React Effect: Floating Tooltip when Collapsed */}
                    {isCollapsed && isHovered && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
                        <span>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-white text-slate-950 border border-white text-[10px] font-extrabold shadow-xs">
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Desktop Collapse Toggle */}
          <div
            className={`hidden lg:flex items-center px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-slate-400">
                Collapse Menu
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Dynamic User Profile & Login / Logout Action at Bottom */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:bg-slate-900 transition ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.avatarInitials || 'AD'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                    <span>{user?.name || 'Administrator'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate capitalize">
                    {user?.role || 'Admin'} · {user?.email || 'admin@root4tech.com'}
                  </div>
                </div>
              )}
            </div>

            {/* Session Action Button */}
            <div>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-all duration-200 border border-slate-800 group ${
                    isCollapsed ? 'justify-center px-2' : 'justify-center'
                  }`}
                  title="Log Out from Session"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  {!isCollapsed && <span className="text-xs font-semibold">Log Out</span>}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-black/40 border border-blue-500/30 group ${
                    isCollapsed ? 'justify-center px-2' : 'justify-center'
                  }`}
                  title="Sign In to Portal"
                >
                  <LogIn className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  {!isCollapsed && <span>Login</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
