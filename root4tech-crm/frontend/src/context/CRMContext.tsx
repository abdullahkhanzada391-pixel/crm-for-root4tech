import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  Client,
  Quotation,
  Invoice,
  SalesRecord,
  Activity,
  LeadStatus,
  QuotationStatus,
  InvoiceStatus,
  PaidInvoicePdfAttachment,
  AttendanceRecord,
  SalesPersonTask,
  SalesPersonSale,
  SalesPersonProfile,
  MarketingManagerProfile,
  MarketingAttendanceRecord,
  OnboardedClient,
  MarketingTask
} from '@/types/crm';
import {
  INITIAL_LEADS,
  INITIAL_CLIENTS,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_SALES_RECORDS,
  INITIAL_ACTIVITIES,
  INITIAL_SALESPERSON,
  INITIAL_ATTENDANCE,
  INITIAL_SALES_TASKS,
  INITIAL_PERSONAL_SALES,
  INITIAL_MARKETING_MANAGER,
  INITIAL_MARKETING_ATTENDANCE,
  INITIAL_ONBOARDED_CLIENTS,
  INITIAL_MARKETING_TASKS
} from '@/data/mockData';

interface CRMContextType {
  leads: Lead[];
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  salesRecords: SalesRecord[];
  activities: Activity[];
  addLead: (lead: Omit<Lead, 'id' | 'dateAdded'>) => void;
  addMultipleLeads: (leads: Omit<Lead, 'id' | 'dateAdded'>[]) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  deleteMultipleLeads: (ids: string[]) => void;
  clearAllLeads: () => void;
  convertLeadToClient: (leadId: string, customDetails?: Partial<Client>) => Client | void;
  addClient: (client: Omit<Client, 'id' | 'dateAdded'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addQuotation: (quote: Omit<Quotation, 'id' | 'quoteNumber' | 'dateIssued'>) => Quotation;
  addMultipleQuotations: (quotes: Omit<Quotation, 'id' | 'quoteNumber' | 'dateIssued'>[]) => Quotation[];
  updateQuotation: (id: string, quote: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  deleteMultipleQuotations: (ids: string[]) => void;
  convertQuotationToInvoice: (quoteId: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  markInvoiceAsPaid: (invoiceId: string, paymentMethod?: string) => void;
  unmarkInvoiceAsPaid: (invoiceId: string, revertStatus?: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;
  restoreInvoice: (invoice: Invoice) => void;
  attachPaidPdfToInvoice: (invoiceId: string, attachment: PaidInvoicePdfAttachment) => void;
  removePaidPdfFromInvoice: (invoiceId: string) => void;
  resetToDefaults: () => void;

  // Salesperson portal state & methods
  salesPerson: SalesPersonProfile;
  attendanceRecords: AttendanceRecord[];
  isClockedIn: boolean;
  currentClockInTime: string | null;
  clockIn: () => void;
  clockOut: () => void;
  salesTasks: SalesPersonTask[];
  addTask: (title: string, dueTime: string, priority: 'High' | 'Medium' | 'Low') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  personalSales: SalesPersonSale[];
  addPersonalSale: (sale: Omit<SalesPersonSale, 'id' | 'commissionAmount'>) => void;
  deletePersonalSale: (id: string) => void;

  // Marketing Manager portal state & methods
  marketingManager: MarketingManagerProfile;
  marketingAttendance: MarketingAttendanceRecord[];
  isMarketingClockedIn: boolean;
  marketingClockInTime: string | null;
  marketingClockIn: () => void;
  marketingClockOut: () => void;
  onboardedClients: OnboardedClient[];
  addOnboardedClient: (client: Omit<OnboardedClient, 'id' | 'onboardingDate'>) => void;
  updateOnboardedClientRemarks: (id: string, remarks: string) => void;
  updateOnboardedClientStatus: (id: string, status: OnboardedClient['status']) => void;
  deleteOnboardedClient: (id: string) => void;
  marketingTasks: MarketingTask[];
  addMarketingTask: (task: Omit<MarketingTask, 'id' | 'completed'>) => void;
  toggleMarketingTask: (id: string) => void;
  updateMarketingTaskRemarks: (id: string, remarks: string) => void;
  deleteMarketingTask: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_PREFIX = 'root4tech_crm_';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}leads`);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}quotations`);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}invoices`);
    if (saved) {
      try {
        const parsed: Invoice[] = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some((i) => i.id === 'inv-12345' || i.invoiceNumber === '12345')) {
          return [INITIAL_INVOICES[0], ...parsed];
        }
        return parsed;
      } catch {
        return INITIAL_INVOICES;
      }
    }
    return INITIAL_INVOICES;
  });

  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sales`);
    return saved ? JSON.parse(saved) : INITIAL_SALES_RECORDS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sales`, JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  // Salesperson portal state
  const [salesPerson] = useState<SalesPersonProfile>(INITIAL_SALESPERSON);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [isClockedIn, setIsClockedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}isClockedIn`);
    return saved ? JSON.parse(saved) : false;
  });

  const [currentClockInTime, setCurrentClockInTime] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}currentClockInTime`) || null;
  });

  const [salesTasks, setSalesTasks] = useState<SalesPersonTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sales_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_SALES_TASKS;
  });

  const [personalSales, setPersonalSales] = useState<SalesPersonSale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}personal_sales`);
    return saved ? JSON.parse(saved) : INITIAL_PERSONAL_SALES;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}isClockedIn`, JSON.stringify(isClockedIn));
  }, [isClockedIn]);

  useEffect(() => {
    if (currentClockInTime) {
      localStorage.setItem(`${STORAGE_PREFIX}currentClockInTime`, currentClockInTime);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}currentClockInTime`);
    }
  }, [currentClockInTime]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sales_tasks`, JSON.stringify(salesTasks));
  }, [salesTasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}personal_sales`, JSON.stringify(personalSales));
  }, [personalSales]);

  // Marketing Manager state
  const [marketingManager] = useState<MarketingManagerProfile>(INITIAL_MARKETING_MANAGER);

  const [marketingAttendance, setMarketingAttendance] = useState<MarketingAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}marketing_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_ATTENDANCE;
  });

  const [isMarketingClockedIn, setIsMarketingClockedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}isMarketingClockedIn`);
    return saved ? JSON.parse(saved) : false;
  });

  const [marketingClockInTime, setMarketingClockInTime] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}marketingClockInTime`) || null;
  });

  const [onboardedClients, setOnboardedClients] = useState<OnboardedClient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}onboarded_clients`);
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDED_CLIENTS;
  });

  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}marketing_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_TASKS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}marketing_attendance`, JSON.stringify(marketingAttendance));
  }, [marketingAttendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}isMarketingClockedIn`, JSON.stringify(isMarketingClockedIn));
  }, [isMarketingClockedIn]);

  useEffect(() => {
    if (marketingClockInTime) {
      localStorage.setItem(`${STORAGE_PREFIX}marketingClockInTime`, marketingClockInTime);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}marketingClockInTime`);
    }
  }, [marketingClockInTime]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}onboarded_clients`, JSON.stringify(onboardedClients));
  }, [onboardedClients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}marketing_tasks`, JSON.stringify(marketingTasks));
  }, [marketingTasks]);

  const addActivity = (type: Activity['type'], title: string, description: string) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      type,
      title,
      description,
      timestamp: 'Just now'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 19)]);
  };

  // 1. Leads Handlers
  const addLead = (data: Omit<Lead, 'id' | 'dateAdded'>) => {
    const newLead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    addActivity('lead_added', 'New Lead Added', `${newLead.name} (${newLead.company}) added to CRM`);
  };

  const addMultipleLeads = (items: Omit<Lead, 'id' | 'dateAdded'>[]) => {
    const now = Date.now();
    const newLeads: Lead[] = items.map((data, idx) => ({
      ...data,
      id: `lead-${now}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      dateAdded: new Date(Date.now() - idx * 86400000).toISOString().split('T')[0]
    }));
    setLeads(prev => [...newLeads, ...prev]);
    addActivity('lead_added', 'Bulk Leads Added', `Added ${newLeads.length} leads to CRM pipeline`);
  };

  const updateLead = (id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLead = (id: string) => {
    const targetLead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (targetLead) {
      addActivity('lead_added', 'Lead Deleted Separately', `Lead "${targetLead.name}" (${targetLead.company}) was deleted individually from pipeline`);
    }
  };

  const deleteMultipleLeads = (ids: string[]) => {
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    addActivity('lead_added', 'Leads Removed', `Removed ${ids.length} selected lead(s)`);
  };

  const clearAllLeads = () => {
    setLeads([]);
    addActivity('lead_added', 'All Leads Cleared', 'All previous leads were removed from the CRM');
  };

  const convertLeadToClient = (leadId: string, customDetails?: Partial<Client>): Client | void => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Mark lead as converted
    updateLead(leadId, { status: 'Converted' });

    // Check if client already exists
    const existing = clients.find(c => c.company.toLowerCase() === (customDetails?.company || lead.company).toLowerCase());
    if (existing) {
      if (customDetails) {
        updateClient(existing.id, customDetails);
      }
      addActivity('client_created', 'Client Updated', `${lead.name} from ${lead.company} converted from Lead (Existing account updated)`);
      return existing;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: customDetails?.name || lead.name,
      company: customDetails?.company || lead.company,
      phone: customDetails?.phone || lead.phone,
      email: customDetails?.email || lead.email,
      country: customDetails?.country || lead.country,
      service: customDetails?.service || lead.interestedService,
      status: customDetails?.status || 'Active',
      totalBilled: customDetails?.totalBilled || customDetails?.initialContractValue || 0,
      initialContractValue: customDetails?.initialContractValue,
      notes: customDetails?.notes || lead.notes || '',
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    addActivity('client_created', 'Client Created', `${newClient.name} (${newClient.company}) converted from Lead to Client`);
    return newClient;
  };

  // 2. Clients Handlers
  const addClient = (data: Omit<Client, 'id' | 'dateAdded'>) => {
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    addActivity('client_created', 'Client Created', `${newClient.name} (${newClient.company}) added to directory`);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // 3. Quotations Handlers
  const addQuotation = (data: Omit<Quotation, 'id' | 'quoteNumber' | 'dateIssued'>): Quotation => {
    const nextNum = `QT-2025-${String(quotations.length + 1).padStart(3, '0')}`;
    const newQuote: Quotation = {
      ...data,
      id: `quote-${Date.now()}`,
      quoteNumber: nextNum,
      dateIssued: new Date().toISOString().split('T')[0]
    };
    setQuotations(prev => [newQuote, ...prev]);
    addActivity('quotation_generated', 'Quotation Generated', `Proposal ${newQuote.quoteNumber} issued for ${newQuote.companyName} (PKR ${newQuote.amount.toLocaleString()})`);
    return newQuote;
  };

  const addMultipleQuotations = (dataList: Omit<Quotation, 'id' | 'quoteNumber' | 'dateIssued'>[]): Quotation[] => {
    const today = new Date().toISOString().split('T')[0];
    const createdList: Quotation[] = dataList.map((data, index) => {
      const nextNum = `QT-2025-${String(quotations.length + index + 1).padStart(3, '0')}`;
      return {
        ...data,
        id: `quote-${Date.now()}-${index}`,
        quoteNumber: nextNum,
        dateIssued: today
      };
    });

    setQuotations(prev => [...createdList, ...prev]);
    const totalBatchAmount = createdList.reduce((s, q) => s + q.amount, 0);
    addActivity(
      'quotation_generated',
      'Batch Quotations Created',
      `Batch of ${createdList.length} quotations generated (Total PKR ${totalBatchAmount.toLocaleString()})`
    );
    return createdList;
  };

  const updateQuotation = (id: string, data: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => (q.id === id ? { ...q, ...data } : q)));
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const deleteMultipleQuotations = (ids: string[]) => {
    setQuotations(prev => prev.filter(q => !ids.includes(q.id)));
    addActivity('quotation_generated', 'Quotations Batch Removed', `Batch of ${ids.length} quotations removed from directory`);
  };

  const convertQuotationToInvoice = (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    updateQuotation(quoteId, { status: 'Accepted' });

    const nextInvNum = `INV-2025-${String(100 + invoices.length + 1)}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNum,
      clientName: quote.clientName,
      companyName: quote.companyName,
      clientEmail: quote.clientEmail,
      service: quote.service,
      amount: quote.amount,
      issueDate: today,
      dueDate,
      status: 'Accepted',
      notes: `Generated from accepted quotation ${quote.quoteNumber}`,
      sections: quote.items && quote.items.length > 0
        ? quote.items.map((it, idx) => ({
            id: `sec-${Date.now()}-${idx}`,
            title: it.service,
            description: it.description,
            amount: it.amount
          }))
        : undefined
    };

    setInvoices(prev => [newInvoice, ...prev]);
    addActivity('invoice_created', 'Invoice Created', `Invoice ${newInvoice.invoiceNumber} created from quotation for ${newInvoice.companyName} (PKR ${newInvoice.amount.toLocaleString()})`);
  };

  // 4. Invoices Handlers
  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate'>): Invoice => {
    const nextInvNum = `INV-2025-${String(100 + invoices.length + 1)}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNum,
      issueDate: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addActivity('invoice_created', 'Invoice Created', `Invoice ${newInvoice.invoiceNumber} issued for ${newInvoice.companyName} (PKR ${newInvoice.amount.toLocaleString()})`);
    return newInvoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
    const target = invoices.find(i => i.id === id);
    if (target) {
      addActivity('invoice_created', 'Invoice Updated', `Invoice ${target.invoiceNumber} (${data.companyName || target.companyName}) details were updated`);
    }
  };

  const markInvoiceAsPaid = (invoiceId: string, paymentMethod = 'Bank Wire Transfer') => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status === 'Paid') return;

    updateInvoice(invoiceId, { status: 'Paid' });

    const newSaleRecord: SalesRecord = {
      id: `sale-${Date.now()}`,
      recordNumber: `REC-2025-${String(salesRecords.length + 1).padStart(2, '0')}`,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      companyName: inv.companyName,
      service: inv.service,
      amount: inv.amount,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod
    };

    setSalesRecords(prev => [newSaleRecord, ...prev]);

    // Also update client totalBilled
    setClients(prev =>
      prev.map(c =>
        c.company.toLowerCase() === inv.companyName.toLowerCase()
          ? { ...c, totalBilled: (c.totalBilled || 0) + inv.amount }
          : c
      )
    );

    addActivity('invoice_paid', 'Payment Received', `Payment of PKR ${inv.amount.toLocaleString()} received for ${inv.invoiceNumber} (${inv.companyName})`);
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    if (target) {
      addActivity('invoice_created', 'Invoice Removed', `Invoice ${target.invoiceNumber} (${target.companyName}) was deleted`);
    }
  };

  const restoreInvoice = (invoice: Invoice) => {
    setInvoices(prev => {
      if (prev.some(i => i.id === invoice.id)) return prev;
      return [invoice, ...prev];
    });
    addActivity('invoice_created', 'Invoice Restored', `Invoice ${invoice.invoiceNumber} (${invoice.companyName}) was restored from Undo`);
  };

  const unmarkInvoiceAsPaid = (invoiceId: string, revertStatus: InvoiceStatus = 'Unpaid') => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status !== 'Paid') return;

    updateInvoice(invoiceId, { status: revertStatus });

    // Remove matching sales record
    setSalesRecords(prev => prev.filter(s => s.invoiceNumber !== inv.invoiceNumber));

    // Deduct from client totalBilled
    setClients(prev =>
      prev.map(c =>
        c.company.toLowerCase() === inv.companyName.toLowerCase()
          ? { ...c, totalBilled: Math.max(0, (c.totalBilled || 0) - inv.amount) }
          : c
      )
    );

    addActivity('invoice_created', 'Payment Reverted', `Payment for invoice ${inv.invoiceNumber} (${inv.companyName}) was reverted to ${revertStatus}`);
  };

  const attachPaidPdfToInvoice = (invoiceId: string, attachment: PaidInvoicePdfAttachment) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const updates: Partial<Invoice> = {
      paidPdfAttachment: attachment
    };
    if (inv.status !== 'Paid') {
      updates.status = 'Paid';
      updates.paidDate = new Date().toISOString().split('T')[0];
    }
    updateInvoice(invoiceId, updates);
    addActivity('invoice_paid', 'Paid Invoice PDF Attached', `PDF receipt attached to ${inv.invoiceNumber} (${inv.companyName})`);
  };

  const removePaidPdfFromInvoice = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    updateInvoice(invoiceId, { paidPdfAttachment: undefined });
    addActivity('invoice_created', 'PDF Receipt Removed', `Attached PDF removed from ${inv.invoiceNumber}`);
  };

  // Salesperson Handlers
  const clockIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    setIsClockedIn(true);
    setCurrentClockInTime(timeStr);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: dateStr,
      shift: '10:00 AM - 06:00 PM',
      clockIn: timeStr,
      clockOut: null,
      totalHours: 'In Progress',
      status: 'Active'
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    addActivity('invoice_paid', 'Shift Started', `${salesPerson.name} clocked in at ${timeStr} for standard 10 AM - 6 PM shift`);
  };

  const clockOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsClockedIn(false);
    setCurrentClockInTime(null);

    setAttendanceRecords(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const activeIdx = updated.findIndex(r => r.status === 'Active' || r.clockOut === null);
      if (activeIdx !== -1) {
        updated[activeIdx] = {
          ...updated[activeIdx],
          clockOut: timeStr,
          status: 'Completed',
          totalHours: '8h 00m'
        };
      }
      return updated;
    });

    addActivity('invoice_paid', 'Shift Ended', `${salesPerson.name} clocked out at ${timeStr}`);
  };

  const addTask = (title: string, dueTime: string, priority: 'High' | 'Medium' | 'Low') => {
    const newTask: SalesPersonTask = {
      id: `task-${Date.now()}`,
      title,
      dueTime: dueTime || '05:00 PM',
      priority,
      completed: false
    };
    setSalesTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setSalesTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setSalesTasks(prev => prev.filter(t => t.id !== id));
  };

  const addPersonalSale = (saleData: Omit<SalesPersonSale, 'id' | 'commissionAmount'>) => {
    const commission = Math.round(saleData.amount * (saleData.commissionRate / 100));
    const newSale: SalesPersonSale = {
      ...saleData,
      id: `ps-${Date.now()}`,
      commissionAmount: commission
    };
    setPersonalSales(prev => [newSale, ...prev]);

    // Also reflect in company sales records so Admin has synced ledger
    const newSalesRecord: SalesRecord = {
      id: `rec-${Date.now()}`,
      recordNumber: `REC-${new Date().getFullYear()}-0${Math.floor(10 + Math.random() * 90)}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: saleData.clientName,
      companyName: saleData.companyName,
      service: saleData.service,
      amount: saleData.amount,
      paidDate: saleData.dateClosed,
      paymentMethod: saleData.paymentMethod
    };
    setSalesRecords(prev => [newSalesRecord, ...prev]);

    addActivity('invoice_paid', 'Personal Sale Recorded', `${salesPerson.name} closed sale of PKR ${saleData.amount.toLocaleString()} (${saleData.companyName})`);
  };

  const deletePersonalSale = (id: string) => {
    setPersonalSales(prev => prev.filter(s => s.id !== id));
  };

  // Marketing Manager Handlers
  const marketingClockIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    setIsMarketingClockedIn(true);
    setMarketingClockInTime(timeStr);

    const newRecord: MarketingAttendanceRecord = {
      id: `m-att-${Date.now()}`,
      date: dateStr,
      shift: '10:00 AM - 06:00 PM',
      clockIn: timeStr,
      clockOut: null,
      totalHours: 'In Progress',
      status: 'Active'
    };

    setMarketingAttendance(prev => [newRecord, ...prev]);
    addActivity('lead_added', 'Shift Started', `${marketingManager.name} (Marketing) clocked in at ${timeStr}`);
  };

  const marketingClockOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsMarketingClockedIn(false);
    setMarketingClockInTime(null);

    setMarketingAttendance(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const activeIdx = updated.findIndex(r => r.status === 'Active' || r.clockOut === null);
      if (activeIdx !== -1) {
        updated[activeIdx] = {
          ...updated[activeIdx],
          clockOut: timeStr,
          status: 'Completed',
          totalHours: '8h 00m'
        };
      }
      return updated;
    });

    addActivity('lead_added', 'Shift Ended', `${marketingManager.name} (Marketing) clocked out at ${timeStr}`);
  };

  const addOnboardedClient = (clientData: Omit<OnboardedClient, 'id' | 'onboardingDate'>) => {
    const newClient: OnboardedClient = {
      ...clientData,
      id: `ob-${Date.now()}`,
      onboardingDate: new Date().toISOString().split('T')[0]
    };
    setOnboardedClients(prev => [newClient, ...prev]);
    addActivity('client_created', 'Client Onboarded', `${clientData.companyName} (${clientData.campaignService}) onboarded by ${marketingManager.name}`);
  };

  const updateOnboardedClientRemarks = (id: string, remarks: string) => {
    setOnboardedClients(prev =>
      prev.map(c => (c.id === id ? { ...c, managerRemarks: remarks } : c))
    );
  };

  const updateOnboardedClientStatus = (id: string, status: OnboardedClient['status']) => {
    setOnboardedClients(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteOnboardedClient = (id: string) => {
    setOnboardedClients(prev => prev.filter(c => c.id !== id));
  };

  const addMarketingTask = (taskData: Omit<MarketingTask, 'id' | 'completed'>) => {
    const newTask: MarketingTask = {
      ...taskData,
      id: `mt-${Date.now()}`,
      completed: false
    };
    setMarketingTasks(prev => [newTask, ...prev]);
  };

  const toggleMarketingTask = (id: string) => {
    setMarketingTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? 'Completed' : 'In Progress'
            }
          : t
      )
    );
  };

  const updateMarketingTaskRemarks = (id: string, remarks: string) => {
    setMarketingTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, managerRemarks: remarks } : t))
    );
  };

  const deleteMarketingTask = (id: string) => {
    setMarketingTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetToDefaults = () => {
    setLeads(INITIAL_LEADS);
    setClients(INITIAL_CLIENTS);
    setQuotations(INITIAL_QUOTATIONS);
    setInvoices(INITIAL_INVOICES);
    setSalesRecords(INITIAL_SALES_RECORDS);
    setActivities(INITIAL_ACTIVITIES);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setSalesTasks(INITIAL_SALES_TASKS);
    setPersonalSales(INITIAL_PERSONAL_SALES);
    setIsClockedIn(false);
    setCurrentClockInTime(null);
    setMarketingAttendance(INITIAL_MARKETING_ATTENDANCE);
    setIsMarketingClockedIn(false);
    setMarketingClockInTime(null);
    setOnboardedClients(INITIAL_ONBOARDED_CLIENTS);
    setMarketingTasks(INITIAL_MARKETING_TASKS);
    localStorage.clear();
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        clients,
        quotations,
        invoices,
        salesRecords,
        activities,
        addLead,
        addMultipleLeads,
        updateLead,
        deleteLead,
        deleteMultipleLeads,
        clearAllLeads,
        convertLeadToClient,
        addClient,
        updateClient,
        deleteClient,
        addQuotation,
        addMultipleQuotations,
        updateQuotation,
        deleteQuotation,
        deleteMultipleQuotations,
        convertQuotationToInvoice,
        addInvoice,
        updateInvoice,
        markInvoiceAsPaid,
        unmarkInvoiceAsPaid,
        deleteInvoice,
        restoreInvoice,
        attachPaidPdfToInvoice,
        removePaidPdfFromInvoice,
        resetToDefaults,

        // Salesperson Portal
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
        deletePersonalSale,

        // Marketing Manager Portal
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
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
