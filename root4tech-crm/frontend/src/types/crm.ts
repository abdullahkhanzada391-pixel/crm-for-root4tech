export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Call Back'
  | 'Interested'
  | 'Send Proposal'
  | 'Converted';

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  country: string;
  interestedService: string;
  status: LeadStatus;
  notes?: string;
  dateAdded: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  country: string;
  service: string;
  status: 'Active' | 'Onboarding' | 'Completed' | 'Inactive';
  totalBilled?: number;
  initialContractValue?: number;
  notes?: string;
  dateAdded: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined';

export interface QuotationItem {
  id: string;
  service: string;
  description?: string;
  amount: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientName: string;
  companyName: string;
  clientEmail?: string;
  service: string;
  items?: QuotationItem[];
  amount: number;
  dateIssued: string;
  validUntil: string;
  status: QuotationStatus;
  notes?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Unpaid' | 'Paid' | 'Overdue';

export interface InvoiceSection {
  id: string;
  title: string;
  description?: string;
  amount: number;
}

export interface PaidInvoicePdfAttachment {
  name: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  companyName: string;
  clientEmail?: string;
  service: string;
  amount: number; // Final payable amount after discount
  subtotal?: number; // Base subtotal before discount
  discountType?: 'percentage' | 'fixed';
  discountValue?: number; // e.g. 10 (%) or 5000 (PKR)
  discountAmount?: number; // Deducted amount in currency
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  notes?: string;
  sections?: InvoiceSection[];
  paidPdfAttachment?: PaidInvoicePdfAttachment;
  paidDate?: string;
}

export interface SalesRecord {
  id: string;
  recordNumber: string;
  invoiceNumber: string;
  clientName: string;
  companyName: string;
  service: string;
  amount: number;
  paidDate: string;
  paymentMethod: string;
}

export interface Activity {
  id: string;
  type: 'lead_added' | 'client_created' | 'quotation_generated' | 'invoice_created' | 'invoice_paid';
  title: string;
  description: string;
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  shift: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: string;
  status: 'Active' | 'Completed' | 'Late';
}

export interface SalesPersonTask {
  id: string;
  title: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface SalesPersonSale {
  id: string;
  clientName: string;
  companyName: string;
  service: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  dateClosed: string;
  paymentMethod: string;
  notes?: string;
}

export interface SalesPersonProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  shift: string;
  baseSalary: number;
  monthlyBonus: number;
}

export interface MarketingManagerProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  shift: string;
  baseSalary: number;
  campaignBonus: number;
  fuelAllowance: number;
  taxDeduction: number;
}

export interface MarketingAttendanceRecord {
  id: string;
  date: string;
  shift: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: string;
  status: 'Active' | 'Completed' | 'Late';
}

export interface OnboardedClient {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  campaignService: string;
  monthlyBudget: number;
  onboardingDate: string;
  status: 'Active' | 'Onboarding' | 'Review' | 'Paused';
  managerRemarks: string;
}

export interface MarketingTask {
  id: string;
  clientId?: string;
  clientName: string;
  title: string;
  deadline: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  managerRemarks: string;
  completed: boolean;
}

export type UserRole = 'admin' | 'sales' | 'marketing' | 'custom' | string;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  phone?: string;
  shift?: string;
  department: string;
  avatarInitials: string;
  defaultRoute?: string;
  salary?: number;
  status?: 'Active' | 'Onboarding' | 'On Leave' | 'Inactive';
  joinDate?: string;
}

export interface UserAccount extends AuthUser {
  password: string;
  defaultRoute: string;
}

