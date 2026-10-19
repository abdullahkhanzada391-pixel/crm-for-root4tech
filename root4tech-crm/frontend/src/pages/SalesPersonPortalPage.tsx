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
  Award,
  Calendar,
  Briefcase,
  CheckSquare,
  Square,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Printer,
  X,
  CreditCard,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

export const SalesPersonPortalPage: React.FC = () => {
  const {
    salesPerson,
    attendanceRecords,
    isClockedIn,
    currentClockInTime,
    clockIn,
    clockOut,
    salesTasks,
    addTask,
    toggleTask,
    deleteTask,
    personalSales,
    addPersonalSale,
    deletePersonalSale
  } = useCRM();

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Active Tab: 'overview' | 'sales' | 'tasks' | 'salary' | 'attendance'
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'tasks' | 'salary' | 'attendance'>('overview');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal State: Add Sale
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [service, setService] = useState('Custom Web & Cloud Platform');
  const [amount, setAmount] = useState('150000');
  const [commissionRate, setCommissionRate] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [notes, setNotes] = useState('');

  // Modal State: Add Task
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('03:00 PM');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Calculations
  const totalSalesRevenue = personalSales.reduce((acc, s) => acc + s.amount, 0);
  const totalCommissionEarned = personalSales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const totalSalaryPayout = salesPerson.baseSalary + totalCommissionEarned + salesPerson.monthlyBonus;

  const completedTasksCount = salesTasks.filter(t => t.completed).length;
  const taskProgressPercent = salesTasks.length > 0 ? Math.round((completedTasksCount / salesTasks.length) * 100) : 0;

  const handleClockIn = () => {
    clockIn();
    showToast(`Clocked in successfully at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}! Have a great shift.`);
  };

  const handleClockOut = () => {
    if (window.confirm('Are you sure you want to clock out for today?')) {
      clockOut();
      showToast('Clocked out successfully. Shift attendance logged.');
    }
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const numRate = parseFloat(commissionRate) || 5;

    addPersonalSale({
      clientName,
      companyName,
      service,
      amount: numAmount,
      commissionRate: numRate,
      dateClosed: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes
    });

    setIsAddSaleOpen(false);
    setClientName('');
    setCompanyName('');
    setNotes('');
    showToast(`New sale of PKR ${numAmount.toLocaleString()} recorded! Commission: PKR ${Math.round(numAmount * (numRate / 100)).toLocaleString()}`);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle, taskDueTime, taskPriority);
    setIsAddTaskOpen(false);
    setTaskTitle('');
    showToast('New daily task added to your schedule.');
  };

  const handlePrintSalarySlip = () => {
    const printWin = window.open('', '_blank', 'width=800,height=850');
    if (!printWin) {
      window.print();
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Statement - ${salesPerson.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: 800; }
            .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 24px; }
            th { background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-val { font-size: 24px; font-weight: 800; color: #2563eb; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Root 4 Tech</div>
              <div class="meta">Employee Monthly Compensation Slip · October 2025</div>
              <div class="meta" style="font-family:monospace;">NTN: 8492041-9 · accounts@root4tech.com</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; font-size: 16px;">${salesPerson.name}</div>
              <div style="font-size: 12px; color: #64748b;">${salesPerson.role}</div>
              <div style="font-size: 11px; color: #94a3b8;">Shift: ${salesPerson.shift}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Earnings Component</th>
                <th style="text-align: right;">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Base Salary</strong> (Standard Full-Time 10 AM - 6 PM)</td>
                <td style="text-align: right; font-family: monospace;">PKR ${salesPerson.baseSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Sales Commission Earned</strong> (5% on closed revenue)</td>
                <td style="text-align: right; font-family: monospace;">PKR ${totalCommissionEarned.toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Monthly Performance Bonus</strong></td>
                <td style="text-align: right; font-family: monospace;">PKR ${salesPerson.monthlyBonus.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <div>
              <div style="font-size: 12px; font-weight: 700;">Net Payable Salary (PKR)</div>
              <div style="font-size: 11px; color: #64748b;">Scheduled for direct bank transfer on the 1st of next month</div>
            </div>
            <div class="total-val">PKR ${totalSalaryPayout.toLocaleString()}</div>
          </div>
          <script>window.onload = function() { window.print(); };<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar for Sales Portal */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              R4
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 leading-tight">Root 4 Tech</div>
              <div className="text-[11px] text-blue-600 font-semibold">Sales Representative Portal</div>
            </div>
          </div>
        </div>

        {/* Center/Right Shift Indicator & Admin Switcher */}
        <div className="flex items-center gap-3">
          {/* Shift Time Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Shift: <strong>10:00 AM – 06:00 PM</strong></span>
          </div>

          {/* Current Live Clock */}
          <div className="hidden sm:block text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            {currentTime}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
              AK
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900">{salesPerson.name}</div>
              <div className="text-[10px] text-slate-500">{salesPerson.role}</div>
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-COLUMN MAIN LAYOUT: LEFT SIDEBAR WITH BLUE BORDER + RIGHT WORKSPACE */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* LEFT-SIDE COLUMN WITH DISTINCT BLUE BORDER */}
          <aside className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border-2 border-blue-600 shadow-lg shadow-blue-500/5 p-5 space-y-5 lg:sticky lg:top-20">
            {/* 1. Profile Header & Shift Hours */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  AK
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{salesPerson.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{salesPerson.role}</p>
                </div>
              </div>
              <div className="mt-3.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>10:00 AM – 06:00 PM</span>
                </span>
                <span className="font-mono font-bold text-blue-700">{currentTime}</span>
              </div>
            </div>

            {/* 2. Shift Clock In / Clock Out Action */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Attendance Punch</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isClockedIn
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                    : 'bg-slate-200/70 text-slate-600 border-slate-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {isClockedIn ? 'Clocked In' : 'Off Duty'}
                </span>
              </div>

              {isClockedIn && (
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Clocked in at: <strong>{currentClockInTime}</strong></span>
                </div>
              )}

              {!isClockedIn ? (
                <button
                  onClick={handleClockIn}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Clock In (10:00 AM Shift)</span>
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Clock Out (End Shift)</span>
                </button>
              )}
            </div>

            {/* 3. Navigation Column (Vertical Menu) */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                Portal Navigation
              </div>
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: Briefcase },
                { id: 'sales', label: 'My Sales Records', badge: `${personalSales.length}`, icon: TrendingUp },
                { id: 'tasks', label: "Today's Tasks", badge: `${completedTasksCount}/${salesTasks.length}`, icon: CheckSquare },
                { id: 'salary', label: 'Salary Voucher & Slip', icon: CreditCard },
                { id: 'attendance', label: 'Attendance Punch Log', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 4. Quick Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setIsAddSaleOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Sale</span>
              </button>
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <CheckSquare className="w-4 h-4 text-slate-500" />
                <span>+ Add Today's Task</span>
              </button>
            </div>

            {/* 5. Performance Metrics in Left Column */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Sales & Performance
              </div>

              {/* Column Item 1: Total Sales Revenue & Commission */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Total Sales</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    {personalSales.length} Deals
                  </span>
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                  PKR {totalSalesRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-500" />
                  <span>Commission (5%): <strong>PKR {totalCommissionEarned.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Column Item 2: Today's Tasks Progress */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Today's Tasks</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    {taskProgressPercent}% Done
                  </span>
                </div>
                <div className="mt-1 text-base font-bold font-mono text-slate-900">
                  {completedTasksCount} / {salesTasks.length} Completed
                </div>
                <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${taskProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Column Item 3: Estimated Monthly Salary */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Estimated Net Salary</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    October
                  </span>
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900">
                  PKR {totalSalaryPayout.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Base: PKR {salesPerson.baseSalary.toLocaleString()} + Comm.
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT-SIDE MAIN WORKSPACE */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* ========================================================= */}
            {/* TAB 1: OVERVIEW & COMBINED DASHBOARD */}
            {/* ========================================================= */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left 2 Cols: Sales & Quick Action */}
                <div className="xl:col-span-2 space-y-6">
              {/* Recent Sales Header & Add Sale CTA */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">My Recent Closed Sales</h3>
                    <p className="text-xs text-slate-500">Recorded deals and 5% commission earnings</p>
                  </div>
                  <button
                    onClick={() => setIsAddSaleOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Sale</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Client / Company</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4 font-mono">Deal Value (PKR)</th>
                        <th className="py-3 px-4 font-mono">Commission (5%)</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {personalSales.slice(0, 4).map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{sale.companyName}</div>
                            <div className="text-[11px] text-slate-500">{sale.clientName}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{sale.service}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">PKR {sale.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600">+PKR {sale.commissionAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-500 text-right">{sale.dateClosed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Quick Snapshot */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900">Weekly Shift Log (10 AM - 6 PM)</h3>
                  </div>
                  <button onClick={() => setActiveTab('attendance')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View Full Log &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {attendanceRecords.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{rec.date}</div>
                      <div className="text-slate-600">In: <strong className="text-slate-900">{rec.clockIn}</strong></div>
                      <div className="text-slate-600">Out: <strong className="text-slate-900">{rec.clockOut || 'Active'}</strong></div>
                      <div className="text-emerald-700 font-semibold">{rec.totalHours}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Today's Tasks Widget */}
            <div className="space-y-6">
              <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Today's Tasks</h3>
                    <p className="text-xs text-slate-500">{completedTasksCount} of {salesTasks.length} tasks finished</p>
                  </div>
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Add task for today"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${taskProgressPercent}%` }}
                  ></div>
                </div>

                {/* Task Checklist Items */}
                <div className="space-y-2.5">
                  {salesTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                        t.completed
                          ? 'bg-slate-50/60 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <button className="mt-0.5 text-blue-600 shrink-0">
                        {t.completed ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold leading-snug ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="font-mono">{t.dueTime}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                            t.priority === 'High' ? 'bg-rose-50 text-rose-700' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Summary Box */}
              <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-blue-950">Compensation Summary</div>
                  <button onClick={handlePrintSalarySlip} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span className="font-mono font-bold text-slate-900">PKR {salesPerson.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission (5%):</span>
                    <span className="font-mono font-bold text-emerald-600">+PKR {totalCommissionEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Bonus:</span>
                    <span className="font-mono font-bold text-blue-600">+PKR {salesPerson.monthlyBonus.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Net:</span>
                    <span className="font-mono text-blue-700">PKR {totalSalaryPayout.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY SALES & RECORDING */}
        {/* ========================================================= */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Sales Records</h2>
                <p className="text-xs text-slate-500 mt-0.5">Log closed client contracts and automatically calculate 5% sales commission</p>
              </div>
              <button
                onClick={() => setIsAddSaleOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Sale</span>
              </button>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-4 font-semibold">Client / Organization</th>
                      <th className="py-3.5 px-4 font-semibold">Service Sold</th>
                      <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                      <th className="py-3.5 px-4 font-semibold">Date Closed</th>
                      <th className="py-3.5 px-4 font-semibold">Sale Value (PKR)</th>
                      <th className="py-3.5 px-4 font-semibold">Commission (5%)</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personalSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{sale.companyName}</div>
                          <div className="text-[11px] text-slate-500">{sale.clientName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{sale.service}</td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{sale.paymentMethod}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">{sale.dateClosed}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          PKR {sale.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 whitespace-nowrap">
                          +PKR {sale.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this sale record?')) {
                                deletePersonalSale(sale.id);
                                showToast('Sale removed.');
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                            title="Delete sale"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {personalSales.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                          No sales recorded yet. Click "+ Add New Sale" to log your first closed deal!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TODAY'S TASKS */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Today's Action Items & Tasks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track daily lead outreach, demo walkthroughs, and client follow-ups</p>
              </div>
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Today's Task</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Today's Progress</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {completedTasksCount} of {salesTasks.length} Completed ({taskProgressPercent}%)
                </div>
              </div>
              <div className="w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${taskProgressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {salesTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <button className="mt-0.5 text-blue-600 shrink-0">
                      {task.completed ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                    </button>
                    <div>
                      <div className={`text-xs sm:text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-mono">Target: {task.dueTime}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      showToast('Task removed.');
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SALARY & COMPENSATION */}
        {/* ========================================================= */}
        {activeTab === 'salary' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Salary & Commission Structure</h2>
                <p className="text-xs text-slate-500 mt-0.5">Transparent breakdown of base salary, earned 5% commission, and performance payout</p>
              </div>
              <button
                onClick={handlePrintSalarySlip}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>

            {/* Compensation Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Base Salary (Guaranteed)</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  PKR {salesPerson.baseSalary.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Full-time 10 AM - 6 PM shift</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Earned Sales Commission</span>
                <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                  +PKR {totalCommissionEarned.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">5% on PKR {totalSalesRevenue.toLocaleString()} volume</div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Performance Bonus</span>
                <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                  +PKR {salesPerson.monthlyBonus.toLocaleString()}
                </div>
                <div className="text-[11px] text-blue-600 mt-1">Target qualification unlocked</div>
              </div>
            </div>

            {/* Total Net Payout Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Total Net Estimated Payout</span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white mt-1">
                  PKR {totalSalaryPayout.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 mt-1">Pay Period: October 2025 · Disbursed on the 1st of each month</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Approved for Payroll
                </span>
              </div>
            </div>

            {/* Commission Breakdown Table */}
            <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Commission Ledger (Deals Closed this Month)</h3>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Client Company</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 font-mono">Sale Value (PKR)</th>
                    <th className="py-3 px-4 font-mono">Rate</th>
                    <th className="py-3 px-4 font-mono text-right">Commission (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personalSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{sale.companyName}</td>
                      <td className="py-3 px-4 text-slate-600">{sale.service}</td>
                      <td className="py-3 px-4 font-mono text-slate-900">PKR {sale.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{sale.commissionRate}%</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">+PKR {sale.commissionAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SHIFT ATTENDANCE LOG (10 AM - 6 PM) */}
        {/* ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shift Attendance & Time Log</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daily timekeeping records for 10:00 AM to 06:00 PM shift schedule</p>
              </div>
              <div className="flex items-center gap-2">
                {!isClockedIn ? (
                  <button onClick={handleClockIn} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Clock In Now</span>
                  </button>
                ) : (
                  <button onClick={handleClockOut} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Clock Out</span>
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Scheduled Shift</th>
                    <th className="py-3.5 px-4 font-semibold">Clock In</th>
                    <th className="py-3.5 px-4 font-semibold">Clock Out</th>
                    <th className="py-3.5 px-4 font-semibold">Total Duration</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{att.date}</td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{att.shift}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">{att.clockIn}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">{att.clockOut || 'Currently Active'}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 whitespace-nowrap">{att.totalHours}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          att.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD SALE */}
      {isAddSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Closed Sale</h3>
                <p className="text-xs text-slate-500">Log customer deal and unlock your 5% sales commission</p>
              </div>
              <button onClick={() => setIsAddSaleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  required
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Delivered *</label>
                <input
                  required
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Custom Web & Cloud Platform Sprint 1"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deal Value (PKR) *</label>
                  <input
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Bank Wire Transfer">Bank Wire Transfer (PKR)</option>
                  <option value="Direct Deposit">Direct Deposit</option>
                  <option value="Online Payment">Online Payment Gateway</option>
                  <option value="Company Cheque">Company Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contract terms, scope deliverable, signed quotation ref..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center text-emerald-800">
                <span>Calculated Commission (5%):</span>
                <span className="font-bold font-mono text-sm">
                  +PKR {Math.round((parseFloat(amount) || 0) * ((parseFloat(commissionRate) || 5) / 100)).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSaleOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Sale & Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TASK */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Task for Today</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description *</label>
                <input
                  required
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call client for contract review"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Time</label>
                  <input
                    type="text"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    placeholder="e.g. 02:30 PM"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
