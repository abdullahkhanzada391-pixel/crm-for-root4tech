import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole, UserAccount } from '@/types/crm';
import {
  Settings as SettingsIcon,
  Building,
  User,
  RotateCcw,
  Shield,
  Save,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Clock,
  Briefcase,
  Target,
  ShieldCheck,
  X,
  Lock,
  Mail,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetToDefaults } = useCRM();
  const {
    users,
    updateUserPassword,
    addUser,
    deleteUser,
    resetUsersToDefaults,
    user: currentUser
  } = useAuth();

  // Company Settings
  const [companyName, setCompanyName] = useState('Root 4 Tech');
  const [tagline, setTagline] = useState('Enterprise Software & Technology Solutions');
  const [taxId, setTaxId] = useState('NTN-8492041-9');
  const [supportEmail, setSupportEmail] = useState('contact@root4tech.com');
  const [currency, setCurrency] = useState('PKR (₨)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password Management States
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Add User States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('sales');
  const [newUserDepartment, setNewUserDepartment] = useState('Business Development & Sales');
  const [newUserShift, setNewUserShift] = useState('10:00 AM – 06:00 PM');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    showToast('Company details updated.');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reload the initial demo data? Any custom leads, clients, or invoices added will be reset to default demo records.'
      )
    ) {
      resetToDefaults();
      resetUsersToDefaults();
      showToast('All system data and user passwords reset to defaults.');
    }
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Open Change Password Modal
  const openChangePasswordModal = (u: UserAccount) => {
    setSelectedUserForPassword(u);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordError(null);
  };

  // Save Changed Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!selectedUserForPassword) return;

    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    const success = updateUserPassword(selectedUserForPassword.id, newPasswordInput);
    if (success) {
      showToast(`Password for ${selectedUserForPassword.name} (${selectedUserForPassword.role}) updated successfully.`);
      setSelectedUserForPassword(null);
    } else {
      setPasswordError('Failed to update password.');
    }
  };

  // Save New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const initials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    const defaultRoute = newUserRole === 'admin' ? '/dashboard' : newUserRole === 'sales' ? '/salesperson' : '/marketing';

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      role: newUserRole,
      roleTitle: newUserRole === 'admin' ? 'Administrator' : newUserRole === 'sales' ? 'Sales Representative' : 'Marketing Manager',
      department: newUserDepartment,
      shift: newUserShift,
      avatarInitials: initials,
      defaultRoute
    });

    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    showToast(`User ${newUserName} added successfully.`);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            System & User Security Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company profile, manage users, set passwords, and shift schedules
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User Account</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Company profile updated successfully!</span>
        </div>
      )}

      {/* SECTION 1: USER ACCOUNTS & PASSWORD MANAGEMENT */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                User Accounts & Password Management
              </h3>
              <p className="text-xs text-slate-500">
                Set credentials and passwords for Administrator, Sales Persons, and Marketing Managers
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {users.length} Active Accounts
          </span>
        </div>

        {/* User Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Current Password</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {users.map(u => {
                const isPasswordRevealed = showPasswordMap[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'admin'
                              ? 'bg-blue-600 text-white'
                              : u.role === 'sales'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {currentUser?.id === u.id && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span
                              className={`font-semibold capitalize ${
                                u.role === 'admin'
                                  ? 'text-blue-600'
                                  : u.role === 'sales'
                                  ? 'text-emerald-600'
                                  : 'text-indigo-600'
                              }`}
                            >
                              {u.roleTitle}
                            </span>
                            <span>• {u.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email Login */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {u.email}
                    </td>

                    {/* Shift Schedule */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.shift ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {u.shift}
                        </span>
                      ) : (
                        <span className="text-slate-400">Full Time / Flexible</span>
                      )}
                    </td>

                    {/* Current Password Field */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 border border-slate-200">
                          {isPasswordRevealed ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(u.id)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title={isPasswordRevealed ? 'Hide password' : 'Show password'}
                        >
                          {isPasswordRevealed ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openChangePasswordModal(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors flex items-center gap-1"
                          title="Change password"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Change Password</span>
                        </button>

                        {users.length > 1 && u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user account for ${u.name}?`)) {
                                deleteUser(u.id);
                                showToast(`User account ${u.name} removed.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete user"
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

      {/* SECTION 2: COMPANY DETAILS */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Building className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Company Details & Invoicing Settings
            </h3>
            <p className="text-xs text-slate-500">
              Appears on quotations, invoices, salary slips, and receipts
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax / Commercial Registration (NTN)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Billing Currency
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Description / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: SYSTEM DATA RESET */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <RotateCcw className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Reset Demo Records & Passwords
            </h3>
            <p className="text-xs text-slate-500">
              Restore initial accounts, default passwords (`admin123`, `sales123`, `marketing123`), and sample CRM data
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Clicking the button below will restore default demo leads, clients, invoices, and revert any modified user passwords to their standard defaults.
        </p>

        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset All to Default State</span>
        </button>
      </div>

      {/* MODAL 1: CHANGE / SETUP PASSWORD */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Setup New Password</h3>
              </div>
              <button
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {selectedUserForPassword.avatarInitials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedUserForPassword.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserForPassword.email}</p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter new secure password (min 4 chars)"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Re-enter password to confirm"
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add New Company User Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bilal Ahmed"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. bilal@root4tech.com"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User Role *</label>
                  <select
                    value={newUserRole}
                    onChange={e => {
                      const role = e.target.value as UserRole;
                      setNewUserRole(role);
                      if (role === 'sales') {
                        setNewUserDepartment('Business Development & Sales');
                        setNewUserShift('10:00 AM – 06:00 PM');
                      } else if (role === 'marketing') {
                        setNewUserDepartment('Digital Growth & Client Marketing');
                        setNewUserShift('10:00 AM – 06:00 PM');
                      } else {
                        setNewUserDepartment('Executive Management');
                        setNewUserShift('Full Time');
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sales">Sales Representative (Sales Portal Access)</option>
                    <option value="marketing">Marketing Manager (Marketing Hub Access)</option>
                    <option value="admin">Administrator (Full Admin Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Schedule</label>
                  <input
                    type="text"
                    value={newUserShift}
                    onChange={e => setNewUserShift(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. user123"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
