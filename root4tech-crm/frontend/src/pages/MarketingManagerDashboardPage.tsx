import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Briefcase,
  CheckSquare,
  Square,
  Circle,
  Trash2,
  Printer,
  X,
  User,
  Users,
  Search,
  MessageSquare,
  Edit3,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  ChevronRight,
  Target,
  Sparkles,
  ArrowRight,
  Filter,
  LogOut
} from 'lucide-react';
import { Root4TechLogo } from '@/components/common/Root4TechLogo';

export const MarketingManagerDashboardPage: React.FC = () => {
  const {
    marketingManager,
    marketingAttendance,
    isMarketingClockedIn,
    marketingClockInTime,
    marketingClockIn,
    marketingClockOut,
    onboardedClients,
    addOnboardedClient,
    updateOnboardedClientRemarks,
    updateOnboardedClientStatus,
    deleteOnboardedClient,
    marketingTasks,
    addMarketingTask,
    toggleMarketingTask,
    updateMarketingTaskRemarks,
    deleteMarketingTask
  } = useCRM();

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Active Tab: 'overview' | 'clients' | 'tasks' | 'salary' | 'attendance'
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'tasks' | 'salary' | 'attendance'>('overview');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Modal State: Onboard Client
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campaignService, setCampaignService] = useState('Performance Meta & Google Ads');
  const [monthlyBudget, setMonthlyBudget] = useState('250000');
  const [clientStatus, setClientStatus] = useState<'Active' | 'Onboarding' | 'Review' | 'Paused'>('Active');
  const [managerRemarks, setManagerRemarks] = useState('');

  // Modal State: Add Marketing Task
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskClientId, setTaskClientId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('Today, 04:00 PM');
  const [taskPriority, setTaskPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [taskStatus, setTaskStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [taskRemarks, setTaskRemarks] = useState('');

  // Modal State: Edit Remarks
  const [isEditRemarksModalOpen, setIsEditRemarksModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'client' | 'task'>('client');
  const [editingId, setEditingId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingRemarksText, setEditingRemarksText] = useState('');

  // Search & Filter States
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('All');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  // Calculations
  const totalAdBudget = onboardedClients.reduce((acc, c) => acc + c.monthlyBudget, 0);
  const activeClientsCount = onboardedClients.filter(c => c.status === 'Active').length;
  const completedTasksCount = marketingTasks.filter(t => t.completed).length;
  const taskProgressPercent = marketingTasks.length > 0 ? Math.round((completedTasksCount / marketingTasks.length) * 100) : 0;
  const netSalary = marketingManager.baseSalary + marketingManager.campaignBonus + marketingManager.fuelAllowance - marketingManager.taxDeduction;

  // Handlers
  const handleClockIn = () => {
    marketingClockIn();
    showToast(`Clocked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Marketing shift active!`);
  };

  const handleClockOut = () => {
    if (window.confirm('Are you sure you want to clock out for today?')) {
      marketingClockOut();
      showToast('Clocked out successfully. Attendance logged.');
    }
  };

  const handleSaveOnboardedClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !companyName) {
      alert('Please enter client name and company name.');
      return;
    }

    addOnboardedClient({
      clientName,
      companyName,
      email: email || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone || '+92 300 0000000',
      campaignService,
      monthlyBudget: parseFloat(monthlyBudget) || 100000,
      status: clientStatus,
      managerRemarks: managerRemarks || 'Initial marketing strategy and ad account onboarding started.'
    });

    setIsOnboardModalOpen(false);
    setClientName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setManagerRemarks('');
    showToast(`Successfully onboarded ${companyName} to client roster!`);
  };

  const handleSaveMarketingTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) {
      alert('Please enter a task description.');
      return;
    }

    const selectedClient = onboardedClients.find(c => c.id === taskClientId);

    addMarketingTask({
      clientId: taskClientId || undefined,
      clientName: selectedClient ? selectedClient.companyName : 'Internal Marketing Strategy',
      title: taskTitle,
      deadline: taskDeadline,
      priority: taskPriority,
      status: taskStatus,
      managerRemarks: taskRemarks || 'Task logged by Marketing Manager.'
    });

    setIsAddTaskModalOpen(false);
    setTaskTitle('');
    setTaskRemarks('');
    showToast('New client campaign task added successfully!');
  };

  const openRemarksEditor = (type: 'client' | 'task', id: string, title: string, currentRemarks: string) => {
    setEditingType(type);
    setEditingId(id);
    setEditingTitle(title);
    setEditingRemarksText(currentRemarks || '');
    setIsEditRemarksModalOpen(true);
  };

  const handleSaveRemarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType === 'client') {
      updateOnboardedClientRemarks(editingId, editingRemarksText);
      showToast('Client remarks updated successfully.');
    } else {
      updateMarketingTaskRemarks(editingId, editingRemarksText);
      showToast('Task remarks updated successfully.');
    }
    setIsEditRemarksModalOpen(false);
  };

  const handlePrintSalarySlip = () => {
    window.print();
  };

  // Filtered in-board clients
  const filteredClients = onboardedClients.filter(c => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.campaignService.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientStatusFilter === 'All' || c.status === clientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered tasks
  const filteredTasks = marketingTasks.filter(t => {
    if (taskFilter === 'Pending') return !t.completed;
    if (taskFilter === 'Completed') return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Root 4 Tech</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  Marketing Hub
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Marketing Manager Portal • Onboarding, Strategy & Client Tasks
              </p>
            </div>
          </div>

          {/* Profile & Log Out */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 pl-1 bg-slate-50 py-1 pr-3 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                AK
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{marketingManager.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{marketingManager.role}</p>
              </div>
            </div>

            {/* Log Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition"
              title="Log out from session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full space-y-6">

        {/* 1. CLOCK IN / CLOCK OUT BANNER */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-slate-900/10 border border-slate-800 print:hidden relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Shift info and Live Clock */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Shift: {marketingManager.shift}
                </span>

                {isMarketingClockedIn ? (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Shift Active: Clocked In at {marketingClockInTime}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Not Clocked In (Awaiting Punch)
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                  {currentTime}
                </h2>
                <span className="text-xs text-indigo-200/80 font-medium">PKT (Pakistan Standard Time)</span>
              </div>

              <p className="text-xs text-slate-300 max-w-xl">
                Marketing Manager daily session. Log in for client strategy alignment, ad performance reviews, and campaign task remarks.
              </p>
            </div>

            {/* Action Buttons: Clock In / Clock Out */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isMarketingClockedIn ? (
                <button
                  onClick={handleClockIn}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock In (10:00 AM Shift)</span>
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out (End Shift)</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('attendance')}
                className="px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Shift History</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. TOP KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {/* In-Board Clients */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In-Board Clients</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900">{onboardedClients.length}</div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeClientsCount} Active
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Clients currently managed in roster</p>
          </div>

          {/* Monthly Ad Budget under Management */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Ad Budget</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900">
                PKR {(totalAdBudget / 1000).toFixed(0)}k
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Total PKR {totalAdBudget.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Managed campaigns across platforms</p>
          </div>

          {/* Today's Client Tasks */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client Tasks</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900">
                {completedTasksCount} / {marketingTasks.length}
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {taskProgressPercent}% Done
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${taskProgressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Net Salary Slip */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Salary (PKR)</span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900">
                PKR {netSalary.toLocaleString()}
              </div>
              <button
                onClick={() => setActiveTab('salary')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 underline underline-offset-2 flex items-center gap-0.5"
              >
                <span>Pay Slip</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Base + Campaign Bonus + Allowance</p>
          </div>
        </section>

        {/* 3. NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-1 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>In-Board Clients ({onboardedClients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Client Tasks & Remarks ({marketingTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('salary')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'salary'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Salary Slip (PKR)</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'attendance'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Shift Attendance</span>
            </button>
          </div>

          {/* Quick Action in Tab bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard Client</span>
            </button>

            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* 4. TAB CONTENTS */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* In-Board Clients Preview */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">In-Board Client Roster</h3>
                    <p className="text-xs text-slate-500">Active marketing campaigns and manager remarks</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View All ({onboardedClients.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {onboardedClients.slice(0, 3).map(client => (
                    <div
                      key={client.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{client.companyName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                client.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : client.status === 'Onboarding'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {client.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Contact: <span className="font-medium text-slate-800">{client.clientName}</span> • Service: {client.campaignService}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500">Monthly Ad Budget</span>
                          <p className="font-bold text-sm text-slate-900">
                            PKR {client.monthlyBudget.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Manager's Remarks box */}
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                              Manager Remarks:
                            </span>
                            <p className="text-xs text-amber-950 mt-0.5 leading-relaxed">
                              {client.managerRemarks || 'No remarks recorded yet.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openRemarksEditor('client', client.id, client.companyName, client.managerRemarks)}
                          className="text-xs text-amber-800 hover:text-amber-950 p-1 hover:bg-amber-200/50 rounded transition-colors shrink-0"
                          title="Edit remarks"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Client Tasks with Manager Remarks */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Today's Client Tasks</h3>
                    <p className="text-xs text-slate-500">Action items and personal notes</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {marketingTasks.slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all ${
                        task.completed
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleMarketingTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate">
                              {task.clientName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                task.priority === 'Urgent'
                                  ? 'bg-rose-50 text-rose-700'
                                  : task.priority === 'High'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-medium text-slate-900 mt-1 ${
                              task.completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </p>

                          {/* Task Remarks snippet */}
                          {task.managerRemarks && (
                            <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-start gap-1">
                              <span className="font-semibold text-slate-700 shrink-0">Note:</span>
                              <span className="truncate">{task.managerRemarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Task for Client</span>
                </button>
              </div>

            </div>

            {/* Quick Compensation Glance Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Monthly Salary & Compensation Package</h4>
                  <p className="text-xs text-indigo-200">
                    Gross: PKR {(marketingManager.baseSalary + marketingManager.campaignBonus + marketingManager.fuelAllowance).toLocaleString()} • Net Payout: <strong className="text-white">PKR {netSalary.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('salary')}
                className="px-4 py-2 rounded-lg bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-colors whitespace-nowrap"
              >
                View Full Salary Slip
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IN-BOARD CLIENTS */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search onboarded clients or campaigns..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={clientStatusFilter}
                  onChange={e => setClientStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Review">Review</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard New Client</span>
                </button>
              </div>
            </div>

            {/* In-Board Clients Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">{client.companyName}</h3>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              client.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : client.status === 'Onboarding'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : client.status === 'Review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {client.status}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 font-semibold mt-1">
                          {client.campaignService}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold block">Monthly Ad Budget</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          PKR {client.monthlyBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Meta */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Onboarded: {client.onboardingDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    </div>

                    {/* MANAGER'S REMARKS BOX (Prominent feature requested by user) */}
                    <div className="mt-4 bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                          <span>Manager Remarks:</span>
                        </div>
                        <button
                          onClick={() => openRemarksEditor('client', client.id, client.companyName, client.managerRemarks)}
                          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Remarks</span>
                        </button>
                      </div>
                      <p className="text-xs text-amber-950 leading-relaxed font-normal">
                        "{client.managerRemarks || 'No remarks recorded yet. Click Edit Remarks to add notes on campaign ROAS, creative updates or client meetings.'}"
                      </p>
                    </div>
                  </div>

                  {/* Footer status toggle & quick actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <select
                        value={client.status}
                        onChange={e => updateOnboardedClientStatus(client.id, e.target.value as any)}
                        className="text-xs py-1 px-2 border border-slate-200 rounded bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Review">Review</option>
                        <option value="Paused">Paused</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTaskClientId(client.id);
                          setIsAddTaskModalOpen(true);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${client.companyName} from onboarded clients?`)) {
                            deleteOnboardedClient(client.id);
                            showToast(`Removed ${client.companyName}.`);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 p-1"
                        title="Delete client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && (
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Onboarded Clients Found</h4>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or onboard a new client.</p>
                  <button
                    onClick={() => setIsOnboardModalOpen(true)}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Onboard First Client
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT TASKS & REMARKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Header bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTaskFilter('All')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    taskFilter === 'All'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Tasks ({marketingTasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('Pending')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    taskFilter === 'Pending'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Pending ({marketingTasks.filter(t => !t.completed).length})
                </button>
                <button
                  onClick={() => setTaskFilter('Completed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    taskFilter === 'Completed'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Completed ({marketingTasks.filter(t => t.completed).length})
                </button>
              </div>

              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Marketing Task</span>
              </button>
            </div>

            {/* Task list with Manager Remarks */}
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border p-4.5 transition-all shadow-sm ${
                    task.completed
                      ? 'border-slate-200 bg-slate-50/60'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    {/* Checkbox and Task Title */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleMarketingTask(task.id)}
                        className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Client: {task.clientName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.deadline}
                          </span>
                        </div>

                        <h4
                          className={`text-sm font-bold text-slate-900 ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Manager's Remarks on Task */}
                        <div className="mt-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                                Manager Remarks:
                              </span>
                              <p className="text-xs text-amber-950 mt-0.5 leading-relaxed">
                                {task.managerRemarks || 'No remarks added yet.'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => openRemarksEditor('task', task.id, task.title, task.managerRemarks)}
                            className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 p-1 hover:bg-amber-200/50 rounded shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this task?')) {
                            deleteMarketingTask(task.id);
                            showToast('Task deleted.');
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Tasks Match Filter</h4>
                  <p className="text-xs text-slate-500 mt-1">All clear or try switching filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SALARY SLIP (PKR) */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Monthly Salary Slip</h3>
                <p className="text-xs text-slate-500">Pay voucher in Pakistani Rupee (PKR)</p>
              </div>
              <button
                onClick={handlePrintSalarySlip}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-md flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Salary Slip</span>
              </button>
            </div>

            {/* Printable Official Salary Voucher */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 max-w-4xl mx-auto printable-salary-slip">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Root4TechLogo size="lg" showText={true} subtitle="Software Development & Enterprise Marketing Solutions" variant="print" />
                  <p className="text-xs text-slate-500 mt-1">
                    Shahrah-e-Faisal, PECHS, Karachi, Pakistan • hr@root4tech.com
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                    CONFIDENTIAL PAYSLIP
                  </span>
                  <p className="text-xs font-semibold text-slate-900 mt-2">
                    Month: <span className="font-bold">October 2025</span>
                  </p>
                  <p className="text-xs text-slate-500">Voucher Ref: R4T-PAY-MKT-1025</p>
                </div>
              </div>

              {/* Employee Information */}
              <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Employee Name</span>
                  <p className="font-bold text-slate-900 mt-0.5">{marketingManager.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Designation</span>
                  <p className="font-bold text-slate-900 mt-0.5">{marketingManager.role}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Department</span>
                  <p className="font-bold text-slate-900 mt-0.5">Marketing & Growth</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Shift Timings</span>
                  <p className="font-bold text-slate-900 mt-0.5">{marketingManager.shift}</p>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Earnings / Allowances</th>
                      <th className="py-3 px-4 text-right">Amount (PKR)</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="py-3 px-4 font-medium">Basic Salary</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        PKR {marketingManager.baseSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">Income Tax (FBR Withholding)</td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-600">
                        PKR {marketingManager.taxDeduction.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Campaign Performance Bonus</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        PKR {marketingManager.campaignBonus.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">EOBI / Social Security</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-400">
                        PKR 0
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Digital Ad Spend Mgmt Allowance</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        PKR {marketingManager.fuelAllowance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">Leave / Late Deductions</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-400">
                        PKR 0
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td className="py-3 px-4">Gross Earnings:</td>
                      <td className="py-3 px-4 text-right text-indigo-700 font-extrabold">
                        PKR {(marketingManager.baseSalary + marketingManager.campaignBonus + marketingManager.fuelAllowance).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">Total Deductions:</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-extrabold">
                        PKR {marketingManager.taxDeduction.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Net Payable Highlight */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Net Payout Amount</span>
                  <p className="text-xs text-indigo-200/80 mt-0.5">Disbursed directly via Bank Transfer</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                    PKR {netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-700">Ayesha Khan</span>
                  <p className="text-[10px]">Employee Signature</p>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-700">Managing Director / HR</span>
                  <p className="text-[10px]">Authorized Root 4 Tech Stamp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT ATTENDANCE LOG */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Marketing Shift Attendance Log</h3>
                  <p className="text-xs text-slate-500">Recorded punches for 10:00 AM – 06:00 PM shift schedule</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                  Standard Shift: 8 Hours
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Shift Scheduled</th>
                      <th className="py-3 px-4">Clock In</th>
                      <th className="py-3 px-4">Clock Out</th>
                      <th className="py-3 px-4">Total Time</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {marketingAttendance.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{record.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">{record.shift}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-700">
                          {record.clockIn}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {record.clockOut || (
                            <span className="text-amber-600 font-semibold animate-pulse">In Progress...</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{record.totalHours}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              record.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ONBOARD NEW CLIENT */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Onboard New Client</h3>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOnboardedClient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Global"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Point of Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marketing / Campaign Scope</label>
                  <select
                    value={campaignService}
                    onChange={e => setCampaignService(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Performance Meta & Google Ads">Performance Meta & Google Ads</option>
                    <option value="B2B Tech Lead Generation & Funnels">B2B Tech Lead Generation & Funnels</option>
                    <option value="SEO & Technical Content Marketing">SEO & Technical Content Marketing</option>
                    <option value="TikTok & Social Brand Launch">TikTok & Social Brand Launch</option>
                    <option value="Full Omnichannel Growth Package">Full Omnichannel Growth Package</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Ad Budget (PKR)</label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={monthlyBudget}
                    onChange={e => setMonthlyBudget(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={clientStatus}
                  onChange={e => setClientStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active (Live Campaigns)</option>
                  <option value="Onboarding">Onboarding (Ad account setup & strategy)</option>
                  <option value="Review">Review (Strategy Audit)</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              {/* MANAGER'S INITIAL REMARKS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Remarks & Campaign Strategy Notes *
                </label>
                <textarea
                  rows={3}
                  placeholder="Record initial client brief, target ROAS, ad account credentials or strategy points..."
                  value={managerRemarks}
                  onChange={e => setManagerRemarks(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Save & Onboard Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MARKETING TASK */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Client Campaign Task</h3>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarketingTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client</label>
                <select
                  value={taskClientId}
                  onChange={e => setTaskClientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General / Internal Strategy</option>
                  {onboardedClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Google Tag Manager conversions & test pixel"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline / Time</label>
                  <input
                    type="text"
                    placeholder="Today, 04:00 PM"
                    value={taskDeadline}
                    onChange={e => setTaskDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Remarks & Action Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes for yourself or execution team..."
                  value={taskRemarks}
                  onChange={e => setTaskRemarks(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT REMARKS (Direct requested capability) */}
      {isEditRemarksModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-900">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-base">Edit Manager Remarks</h3>
              </div>
              <button
                onClick={() => setIsEditRemarksModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRemarks} className="p-6 space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500">Subject:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{editingTitle}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Remarks & Insights
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Update your notes, campaign feedback, ROAS results, client requests..."
                  value={editingRemarksText}
                  onChange={e => setEditingRemarksText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditRemarksModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Update Remarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
