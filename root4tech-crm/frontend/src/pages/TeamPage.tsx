import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole, UserAccount } from '@/types/crm';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Shield,
  ShieldCheck,
  Lock,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  BadgePercent,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const {
    users,
    addUser,
    updateUserProfile,
    updateUserPassword,
    deleteUser,
    user: currentUser
  } = useAuth();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'sales' | 'marketing' | 'admin' | 'custom'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRoleCategory, setAddRoleCategory] = useState<'sales' | 'marketing' | 'admin' | 'custom'>('sales');
  const [addRoleTitle, setAddRoleTitle] = useState('Sales Representative');
  const [addDepartment, setAddDepartment] = useState('Business Development & Sales');
  const [addShift, setAddShift] = useState('10:00 AM – 06:00 PM');
  const [addPortalRoute, setAddPortalRoute] = useState<string>('/salesperson');
  const [addSalary, setAddSalary] = useState<string>('85000');
  const [addPassword, setAddPassword] = useState('team123');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleCategory, setEditRoleCategory] = useState<string>('sales');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editPortalRoute, setEditPortalRoute] = useState('/dashboard');
  const [editSalary, setEditSalary] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Onboarding' | 'On Leave' | 'Inactive'>('Active');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preset role helper
  const handleRoleCategoryChange = (category: 'sales' | 'marketing' | 'admin' | 'custom') => {
    setAddRoleCategory(category);
    if (category === 'sales') {
      setAddRoleTitle('Sales Representative');
      setAddDepartment('Business Development & Sales');
      setAddShift('10:00 AM – 06:00 PM');
      setAddPortalRoute('/salesperson');
      setAddSalary('85000');
    } else if (category === 'marketing') {
      setAddRoleTitle('Marketing Manager');
      setAddDepartment('Digital Growth & Client Marketing');
      setAddShift('10:00 AM – 06:00 PM');
      setAddPortalRoute('/marketing');
      setAddSalary('95000');
    } else if (category === 'admin') {
      setAddRoleTitle('Administrator & Director');
      setAddDepartment('Executive Management');
      setAddShift('Full Time / Flexible');
      setAddPortalRoute('/dashboard');
      setAddSalary('150000');
    } else {
      // Custom / Anything else
      setAddRoleTitle('');
      setAddDepartment('General Operations');
      setAddShift('Full Time / Flexible');
      setAddPortalRoute('/dashboard');
      setAddSalary('75000');
    }
  };

  // Open Edit Modal with user data
  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditRoleCategory(u.role);
    setEditRoleTitle(u.roleTitle);
    setEditDepartment(u.department);
    setEditShift(u.shift || 'Full Time');
    setEditPortalRoute(u.defaultRoute || '/dashboard');
    setEditSalary(u.salary ? String(u.salary) : '');
    setEditStatus(u.status || 'Active');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editEmail.trim()) {
      alert('Name and Email are required.');
      return;
    }

    const initials = editName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TM';

    updateUserProfile(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      role: editRoleCategory as UserRole,
      roleTitle: editRoleTitle.trim() || (editRoleCategory === 'sales' ? 'Sales Representative' : editRoleCategory === 'marketing' ? 'Marketing Manager' : 'Team Member'),
      department: editDepartment.trim(),
      shift: editShift.trim(),
      defaultRoute: editPortalRoute,
      salary: editSalary ? Number(editSalary) : undefined,
      status: editStatus,
      avatarInitials: initials
    });

    setEditingUser(null);
    showToast(`Teammate "${editName}" updated successfully.`);
  };

  // Create New Teammate
  const handleCreateTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      alert('Please fill out Name, Email, and Password.');
      return;
    }

    const initials = addName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TM';

    const finalRole: UserRole = addRoleCategory;
    const finalTitle = addRoleTitle.trim() || (addRoleCategory === 'sales' ? 'Sales Representative' : addRoleCategory === 'marketing' ? 'Marketing Manager' : addRoleCategory === 'admin' ? 'Administrator' : 'Team Member');

    addUser({
      name: addName.trim(),
      email: addEmail.trim(),
      phone: addPhone.trim(),
      role: finalRole,
      roleTitle: finalTitle,
      department: addDepartment.trim() || 'General Operations',
      shift: addShift.trim() || '10:00 AM – 06:00 PM',
      password: addPassword.trim(),
      defaultRoute: addPortalRoute || '/dashboard',
      salary: addSalary ? Number(addSalary) : undefined,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      avatarInitials: initials
    });

    setIsAddModalOpen(false);
    showToast(`🎉 New teammate "${addName}" added successfully as ${finalTitle}!`);

    // Reset fields
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddRoleCategory('sales');
    setAddRoleTitle('Sales Representative');
    setAddDepartment('Business Development & Sales');
    setAddShift('10:00 AM – 06:00 PM');
    setAddSalary('85000');
    setAddPassword('team123');
  };

  // Change Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!passwordModalUser) return;

    if (!newPassword || newPassword.trim().length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    const ok = updateUserPassword(passwordModalUser.id, newPassword);
    if (ok) {
      showToast(`Password for ${passwordModalUser.name} updated.`);
      setPasswordModalUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError('Could not update password.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    // Role filter
    if (selectedRoleFilter === 'sales' && u.role !== 'sales') return false;
    if (selectedRoleFilter === 'marketing' && u.role !== 'marketing') return false;
    if (selectedRoleFilter === 'admin' && u.role !== 'admin') return false;
    if (selectedRoleFilter === 'custom' && (u.role === 'sales' || u.role === 'marketing' || u.role === 'admin')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchTitle = u.roleTitle.toLowerCase().includes(q);
      const matchDept = u.department.toLowerCase().includes(q);
      const matchPhone = u.phone ? u.phone.toLowerCase().includes(q) : false;
      return matchName || matchEmail || matchTitle || matchDept || matchPhone;
    }

    return true;
  });

  // Department counts
  const salesCount = users.filter(u => u.role === 'sales').length;
  const marketingCount = users.filter(u => u.role === 'marketing').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const customCount = users.filter(u => u.role !== 'sales' && u.role !== 'marketing' && u.role !== 'admin').length;

  // Role visual helper
  const getRoleVisual = (role: string) => {
    switch (role) {
      case 'sales':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          badge: 'bg-blue-600 text-white',
          accent: 'from-blue-600 to-indigo-600',
          label: 'Sales'
        };
      case 'marketing':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          badge: 'bg-purple-600 text-white',
          accent: 'from-purple-600 to-pink-600',
          label: 'Marketing'
        };
      case 'admin':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          accent: 'from-emerald-600 to-teal-600',
          label: 'Admin'
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'bg-amber-600 text-white',
          accent: 'from-amber-500 to-orange-600',
          label: 'Custom'
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner with Add Button */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Team Members & Roles</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold border border-blue-200">
                  {users.length} Total Teammates
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Add and manage your team: Sales Persons, Marketing Managers, Support, Developers, or custom roles
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Team Member</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Roster */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Roster
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {users.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              100% Operational
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        {/* Sales Persons */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Sales Persons
            </span>
            <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">
              {salesCount}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Sales Portal Workspace
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            🎯
          </div>
        </div>

        {/* Marketing Managers */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
              Marketing Managers
            </span>
            <div className="text-2xl font-black text-purple-600 font-mono mt-0.5">
              {marketingCount}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Marketing Hub Workspace
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
            🚀
          </div>
        </div>

        {/* Custom / Other Roles */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Custom / Other Roles
            </span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">
              {customCount + adminCount}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Support, Devs, Admins
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
            ✨
          </div>
        </div>
      </div>

      {/* 3. Search and Role Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teammate by name, email, role, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRoleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('sales')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRoleFilter === 'sales'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Sales ({salesCount})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('marketing')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRoleFilter === 'marketing'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              Marketing ({marketingCount})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRoleFilter === 'admin'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('custom')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedRoleFilter === 'custom'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Custom ({customCount})
            </button>
          </div>

          {/* Grid vs Table toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Teammate Cards or Table */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No teammates found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or role filter, or click the button below to add a teammate.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            + Add Team Member
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(u => {
            const visual = getRoleVisual(u.role);
            const isRevealed = revealedPasswords[u.id];

            return (
              <div
                key={u.id}
                className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Accent Top Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${visual.accent}`} />

                <div className="p-5 space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs ${visual.badge}`}
                        >
                          {u.avatarInitials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {currentUser?.id === u.id && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 mt-0.5 line-clamp-1">
                          {u.roleTitle}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${visual.bg} uppercase tracking-wider shrink-0`}
                    >
                      {visual.label}
                    </span>
                  </div>

                  {/* Teammate Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.department}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${u.email}`}
                        className="truncate hover:text-blue-600 font-mono text-[11px]"
                      >
                        {u.email}
                      </a>
                    </div>

                    {u.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${u.phone}`}
                          className="hover:text-blue-600 font-mono text-[11px]"
                        >
                          {u.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 text-[11px]">
                        {u.shift || 'Full Time / Flexible'}
                      </span>
                    </div>

                    {u.salary && (
                      <div className="flex items-center gap-2 pt-1 font-mono text-emerald-700 font-semibold text-[11px]">
                        <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                          PKR {u.salary.toLocaleString()} / mo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Portal Workspace Access */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Workspace Portal:</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                      {u.defaultRoute || '/dashboard'}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span className="font-mono text-xs">
                      {isRevealed ? u.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedPasswords(prev => ({
                          ...prev,
                          [u.id]: !prev[u.id]
                        }))
                      }
                      className="p-1 hover:text-slate-800"
                      title={isRevealed ? 'Hide Password' : 'Show Password'}
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Teammate"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setPasswordModalUser(u);
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition"
                      title="Change Password"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>

                    {users.length > 1 && u.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete teammate ${u.name}?`)) {
                            deleteUser(u.id);
                            showToast(`Teammate "${u.name}" deleted.`);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Teammate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Teammate & Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Contact (Email / Phone)</th>
                  <th className="py-3 px-4">Shift Schedule</th>
                  <th className="py-3 px-4">Assigned Portal</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredUsers.map(u => {
                  const visual = getRoleVisual(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${visual.badge}`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {currentUser?.id === u.id && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {u.roleTitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {u.department}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{u.email}</div>
                        {u.phone && <div className="text-slate-500">{u.phone}</div>}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {u.shift || 'Full Time'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-100 font-semibold">
                          {u.defaultRoute || '/dashboard'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                        {u.salary ? `PKR ${u.salary.toLocaleString()}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Teammate"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Change Password"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                          {users.length > 1 && u.id !== currentUser?.id && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete teammate ${u.name}?`)) {
                                  deleteUser(u.id);
                                  showToast(`Teammate "${u.name}" deleted.`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Teammate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD TEAM MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add New Team Member</h3>
                  <p className="text-[11px] text-blue-100">
                    Add Sales Person, Marketing Manager, Support, Developer, or any custom role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTeammate} className="p-6 space-y-4">
              {/* Role Category Selector with rich presets */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Choose Role Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleCategoryChange('sales')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      addRoleCategory === 'sales'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">🎯</div>
                    <div className="font-bold text-xs text-blue-900">Sales Person</div>
                    <div className="text-[10px] text-slate-500">Sales Portal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleCategoryChange('marketing')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      addRoleCategory === 'marketing'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">🚀</div>
                    <div className="font-bold text-xs text-purple-900">Marketing</div>
                    <div className="text-[10px] text-slate-500">Marketing Hub</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleCategoryChange('admin')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      addRoleCategory === 'admin'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">🛡️</div>
                    <div className="font-bold text-xs text-emerald-900">Admin</div>
                    <div className="text-[10px] text-slate-500">Executive CRM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleCategoryChange('custom')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      addRoleCategory === 'custom'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base mb-0.5">✨</div>
                    <div className="font-bold text-xs text-amber-900">Custom Role</div>
                    <div className="text-[10px] text-slate-500">Anything Else</div>
                  </button>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Malik"
                    value={addName}
                    onChange={e => setAddName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Executive, Marketing Lead, QA Engineer..."
                    value={addRoleTitle}
                    onChange={e => setAddRoleTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. usman@root4tech.com"
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +92 300 1234567"
                    value={addPhone}
                    onChange={e => setAddPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Department & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={addDepartment}
                    onChange={e => setAddDepartment(e.target.value)}
                    placeholder="e.g. Sales, Marketing, IT, Support"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Working Hours
                  </label>
                  <input
                    type="text"
                    value={addShift}
                    onChange={e => setAddShift(e.target.value)}
                    placeholder="e.g. 10:00 AM – 06:00 PM"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Portal Workspace Access & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Workspace Portal
                  </label>
                  <select
                    value={addPortalRoute}
                    onChange={e => setAddPortalRoute(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="/salesperson">Salesperson Portal (/salesperson)</option>
                    <option value="/marketing">Marketing Manager Hub (/marketing)</option>
                    <option value="/dashboard">Executive CRM Dashboard (/dashboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Base Salary (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={addSalary}
                    onChange={e => setAddSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Login Password *
                </label>
                <input
                  type="text"
                  required
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  placeholder="e.g. team123"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  The teammate will use this email and password to log in. They can change it anytime.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
                >
                  Confirm & Add Teammate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT TEAM MEMBER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Edit Teammate Profile</h3>
                  <p className="text-[11px] text-slate-400">
                    Update role, department, shift, or contact information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={editRoleTitle}
                    onChange={e => setEditRoleTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Hours</label>
                  <input
                    type="text"
                    value={editShift}
                    onChange={e => setEditShift(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Workspace Portal
                  </label>
                  <select
                    value={editPortalRoute}
                    onChange={e => setEditPortalRoute(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="/salesperson">Salesperson Portal (/salesperson)</option>
                    <option value="/marketing">Marketing Manager Hub (/marketing)</option>
                    <option value="/dashboard">Executive CRM Dashboard (/dashboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Salary (PKR)
                  </label>
                  <input
                    type="number"
                    value={editSalary}
                    onChange={e => setEditSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CHANGE PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold">
                  Reset Password: {passwordModalUser.name}
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-3.5">
              {passwordError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
