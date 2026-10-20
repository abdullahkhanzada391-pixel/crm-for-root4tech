import {
  Lead,
  LeadStatus,
  Client,
  Quotation,
  Invoice,
  SalesRecord,
  Activity,
  AttendanceRecord,
  SalesPersonTask,
  SalesPersonSale,
  SalesPersonProfile,
  MarketingManagerProfile,
  MarketingAttendanceRecord,
  OnboardedClient,
  MarketingTask,
  AuthUser,
  UserRole,
  UserAccount
} from '@/types/crm';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Miller',
    company: 'Apex Logistics Ltd',
    phone: '+1 (555) 234-8901',
    email: 'sarah.miller@apexlogistics.com',
    country: 'United States',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Interested',
    notes: 'Needs warehouse dispatch dashboard with real-time driver tracking.',
    dateAdded: '2025-10-14'
  },
  {
    id: 'lead-2',
    name: 'Marcus Thorne',
    company: 'Vanguard Capital Partners',
    phone: '+44 20 7946 0912',
    email: 'm.thorne@vanguardcap.co.uk',
    country: 'United Kingdom',
    interestedService: 'FinTech Portal Development',
    status: 'Contacted',
    notes: 'Requested estimate for high-security investor portal.',
    dateAdded: '2025-10-13'
  },
  {
    id: 'lead-3',
    name: 'Elena Rostova',
    company: 'Kinetics AI Robotics',
    phone: '+49 30 1234567',
    email: 'elena@kineticsai.de',
    country: 'Germany',
    interestedService: 'AI Integration & Telemetry',
    status: 'New',
    notes: 'Inquiry via website contact form for ROS2 web visualization.',
    dateAdded: '2025-10-14'
  },
  {
    id: 'lead-4',
    name: 'Liam O’Connor',
    company: 'Beacon Health Systems',
    phone: '+1 (555) 890-1234',
    email: 'loconnor@beaconhealth.org',
    country: 'Canada',
    interestedService: 'Mobile Application (iOS/Android)',
    status: 'Contacted',
    notes: 'Patient appointment and prescription management mobile app.',
    dateAdded: '2025-10-11'
  },
  {
    id: 'lead-5',
    name: 'Tariq Mansour',
    company: 'Aura Payment Solutions',
    phone: '+971 50 123 4567',
    email: 'tariq@aurapayments.ae',
    country: 'United Arab Emirates',
    interestedService: 'Payment Gateway Integration',
    status: 'Converted',
    notes: 'Converted to client after successful architecture review.',
    dateAdded: '2025-10-08'
  },
  {
    id: 'lead-6',
    name: 'Chloe Bennett',
    company: 'Strata Engineering Group',
    phone: '+61 2 9876 5432',
    email: 'c.bennett@strataengineering.com.au',
    country: 'Australia',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'Converted',
    notes: 'Signed contract for full cloud migration.',
    dateAdded: '2025-10-05'
  },
  {
    id: 'lead-7',
    name: 'Kenji Takahashi',
    company: 'Nexura Robotics Tokyo',
    phone: '+81 3 5555 0192',
    email: 'k.takahashi@nexurarobotics.jp',
    country: 'Japan',
    interestedService: 'AI Integration & Telemetry',
    status: 'Interested',
    notes: 'Autonomous robot fleet coordination cloud backend.',
    dateAdded: '2025-10-04'
  },
  {
    id: 'lead-8',
    name: 'Astrid Lindqvist',
    company: 'Nordic Clean Energy AB',
    phone: '+46 8 123 4567',
    email: 'astrid.l@nordicenergy.se',
    country: 'Sweden',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'New',
    notes: 'Real-time smart grid power monitoring portal.',
    dateAdded: '2025-10-03'
  },
  {
    id: 'lead-9',
    name: 'David Van Houten',
    company: 'Rotterdam Freight Exchange',
    phone: '+31 10 987 6543',
    email: 'd.vanhouten@rotterdamfreight.nl',
    country: 'Netherlands',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Contacted',
    notes: 'Looking for a multi-tenant cargo billing and tracking platform.',
    dateAdded: '2025-10-02'
  },
  {
    id: 'lead-10',
    name: 'Camille Dupont',
    company: 'Lumiere BioPharma',
    phone: '+33 1 42 68 55 00',
    email: 'c.dupont@lumierebio.fr',
    country: 'France',
    interestedService: 'UI/UX Engineering & Design System',
    status: 'Interested',
    notes: 'Clinical trial analytics portal design overhaul.',
    dateAdded: '2025-10-01'
  },
  {
    id: 'lead-11',
    name: 'Wei Zhang',
    company: 'SingaPay Financial Technologies',
    phone: '+65 6789 0123',
    email: 'wei.zhang@singapay.sg',
    country: 'Singapore',
    interestedService: 'Payment Gateway Integration',
    status: 'New',
    notes: 'Cross-border SEPA and FAST payments aggregator.',
    dateAdded: '2025-09-29'
  },
  {
    id: 'lead-12',
    name: 'Hannah Abbott',
    company: 'Crestline Aerospace Group',
    phone: '+1 (555) 301-4499',
    email: 'habbott@crestlineaero.com',
    country: 'United States',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'Contacted',
    notes: 'DoD compliant multi-region Kubernetes cluster deployment.',
    dateAdded: '2025-09-28'
  },
  {
    id: 'lead-13',
    name: 'Matteo Rossi',
    company: 'Milano Smart Logistics',
    phone: '+39 02 8765 4321',
    email: 'matteo.rossi@milanologistics.it',
    country: 'Italy',
    interestedService: 'Mobile Application (iOS/Android)',
    status: 'New',
    notes: 'Courier route optimization delivery app with QR barcode scan.',
    dateAdded: '2025-09-27'
  },
  {
    id: 'lead-14',
    name: 'Sofia Hernandez',
    company: 'InnovaTech Monterrey',
    phone: '+52 81 2345 6789',
    email: 'sofia.h@innovatech.mx',
    country: 'Mexico',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Interested',
    notes: 'B2B marketplace portal for industrial spare parts.',
    dateAdded: '2025-09-25'
  },
  {
    id: 'lead-15',
    name: 'Oliver Scott',
    company: 'Highland Maritime Systems',
    phone: '+44 141 555 0188',
    email: 'o.scott@highlandmaritime.co.uk',
    country: 'United Kingdom',
    interestedService: 'AI Integration & Telemetry',
    status: 'Contacted',
    notes: 'Vessel satellite telemetry and fuel consumption optimization.',
    dateAdded: '2025-09-24'
  },
  {
    id: 'lead-16',
    name: 'Lucas Silva',
    company: 'Sao Paulo FinTech Hub',
    phone: '+55 11 98765 4321',
    email: 'lucas.silva@spfintech.com.br',
    country: 'Brazil',
    interestedService: 'Payment Gateway Integration',
    status: 'New',
    notes: 'PIX instant payment API integration into mobile POS.',
    dateAdded: '2025-09-23'
  },
  {
    id: 'lead-17',
    name: 'Fatima Al-Khatib',
    company: 'Doha Smart City Solutions',
    phone: '+974 4455 6677',
    email: 'fatima@dohasmartcity.qa',
    country: 'Qatar',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'Interested',
    notes: 'Municipal IoT edge gateway and centralized monitoring dashboard.',
    dateAdded: '2025-09-21'
  },
  {
    id: 'lead-18',
    name: 'Benjamin Meyer',
    company: 'Zurich Wealth Tech',
    phone: '+41 44 234 5678',
    email: 'b.meyer@zurichwealth.ch',
    country: 'Switzerland',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Converted',
    notes: 'Contract signed for high-net-worth portfolio portal.',
    dateAdded: '2025-09-19'
  },
  {
    id: 'lead-19',
    name: 'Amara Okafor',
    company: 'Lagos PaySecure Technologies',
    phone: '+234 1 234 5678',
    email: 'amara@paysecure.ng',
    country: 'Nigeria',
    interestedService: 'Payment Gateway Integration',
    status: 'Contacted',
    notes: 'Payment reconciliation and merchant risk scoring API.',
    dateAdded: '2025-09-17'
  },
  {
    id: 'lead-20',
    name: 'Klaus Fischer',
    company: 'Bavaria Industrial Automation',
    phone: '+49 89 7654 3210',
    email: 'klaus.f@bavaria-auto.de',
    country: 'Germany',
    interestedService: 'AI Integration & Telemetry',
    status: 'New',
    notes: 'Predictive maintenance ML pipeline for CNC milling machines.',
    dateAdded: '2025-09-15'
  },
  {
    id: 'lead-21',
    name: 'Zoe Katsaros',
    company: 'Aegean Cyber Defense',
    phone: '+30 21 0987 6543',
    email: 'zkatsaros@aegeancyber.gr',
    country: 'Greece',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'Interested',
    notes: 'Zero-trust network architecture and threat response portal.',
    dateAdded: '2025-09-13'
  },
  {
    id: 'lead-22',
    name: 'Min-Jun Park',
    company: 'Seoul HyperCloud Innovations',
    phone: '+82 2 1234 5678',
    email: 'minjun.park@seoulhypercloud.kr',
    country: 'South Korea',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Contacted',
    notes: 'High throughput streaming analytics platform for gaming backend.',
    dateAdded: '2025-09-11'
  },
  {
    id: 'lead-23',
    name: 'Ingrid Berg',
    company: 'Oslo Telematics Nordic',
    phone: '+47 22 34 56 78',
    email: 'ingrid.berg@oslotelematics.no',
    country: 'Norway',
    interestedService: 'Mobile Application (iOS/Android)',
    status: 'New',
    notes: 'Electric vehicle charging and battery health mobile app.',
    dateAdded: '2025-09-09'
  },
  {
    id: 'lead-24',
    name: 'Devin Vance',
    company: 'Chesapeake Health Analytics',
    phone: '+1 (555) 762-1088',
    email: 'dvance@chesapeakehealth.org',
    country: 'United States',
    interestedService: 'UI/UX Engineering & Design System',
    status: 'Interested',
    notes: 'HIPAA-compliant doctor dashboard design system and components.',
    dateAdded: '2025-09-07'
  },
  {
    id: 'lead-25',
    name: 'Rohan Mehta',
    company: 'Bangalore CloudMatrix Solutions',
    phone: '+91 80 4321 8765',
    email: 'rohan.mehta@cloudmatrix.in',
    country: 'India',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'Converted',
    notes: 'Microservices architecture migration for retail ERP.',
    dateAdded: '2025-09-04'
  },
  {
    id: 'lead-26',
    name: 'Ananya Sharma',
    company: 'Zenith Health Dynamics',
    phone: '+91 22 9876 1234',
    email: 'ananya@zenithhealth.in',
    country: 'India',
    interestedService: 'Mobile Application (iOS/Android)',
    status: 'Contacted',
    notes: 'Telemedicine consultations and lab report tracking app.',
    dateAdded: '2025-09-02'
  },
  {
    id: 'lead-27',
    name: 'Nathalie Mercier',
    company: 'Geneva BioTech Capital',
    phone: '+41 22 789 0123',
    email: 'n.mercier@genevabiotech.ch',
    country: 'Switzerland',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'New',
    notes: 'Grant funding and research milestone review dashboard.',
    dateAdded: '2025-08-30'
  },
  {
    id: 'lead-28',
    name: 'Gabriel Morales',
    company: 'Andes Mineral Telemetry',
    phone: '+56 2 2345 6789',
    email: 'g.morales@andesmineral.cl',
    country: 'Chile',
    interestedService: 'AI Integration & Telemetry',
    status: 'Interested',
    notes: 'Mining site environmental sensors and air quality visualization.',
    dateAdded: '2025-08-28'
  },
  {
    id: 'lead-29',
    name: 'Lars Christiansen',
    company: 'Copenhagen Wind Analytics',
    phone: '+45 33 12 34 56',
    email: 'lars@copenhagenwind.dk',
    country: 'Denmark',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Contacted',
    notes: 'Offshore turbine diagnostics and predictive maintenance portal.',
    dateAdded: '2025-08-25'
  },
  {
    id: 'lead-30',
    name: 'Emily Watson',
    company: 'Auckland Horizon Technologies',
    phone: '+64 9 555 7890',
    email: 'e.watson@horizontech.co.nz',
    country: 'New Zealand',
    interestedService: 'Enterprise Architecture & DevOps',
    status: 'New',
    notes: 'Disaster recovery and automated failover multi-cloud setup.',
    dateAdded: '2025-08-22'
  },
  {
    id: 'lead-31',
    name: 'Carlos Mendez',
    company: 'Iberia FinPay Madrid',
    phone: '+34 91 234 5678',
    email: 'carlos.m@iberiapay.es',
    country: 'Spain',
    interestedService: 'Payment Gateway Integration',
    status: 'Interested',
    notes: 'Virtual POS and merchant payment terminal integration.',
    dateAdded: '2025-08-20'
  },
  {
    id: 'lead-32',
    name: 'Priya Patel',
    company: 'Veridian Supply Chain',
    phone: '+1 (555) 902-3341',
    email: 'ppatel@veridiansupply.com',
    country: 'United States',
    interestedService: 'Custom Web & Cloud Platform',
    status: 'Converted',
    notes: 'End-to-end cold-chain pharma shipment tracking system.',
    dateAdded: '2025-08-18'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Chloe Bennett',
    company: 'Strata Engineering Group',
    phone: '+61 2 9876 5432',
    email: 'c.bennett@strataengineering.com.au',
    country: 'Australia',
    service: 'Enterprise Architecture & DevOps',
    status: 'Active',
    totalBilled: 84000,
    dateAdded: '2025-10-05'
  },
  {
    id: 'client-2',
    name: 'Tariq Mansour',
    company: 'Aura Payment Solutions',
    phone: '+971 50 123 4567',
    email: 'tariq@aurapayments.ae',
    country: 'United Arab Emirates',
    service: 'Payment Gateway Integration',
    status: 'Active',
    totalBilled: 95000,
    dateAdded: '2025-10-08'
  },
  {
    id: 'client-3',
    name: 'Julian Gomez',
    company: 'Solaris Clean Energy',
    phone: '+1 (555) 789-0123',
    email: 'julian@solarisclean.com',
    country: 'United States',
    service: 'IoT Solar Telemetry Portal',
    status: 'Active',
    totalBilled: 52000,
    dateAdded: '2025-09-18'
  },
  {
    id: 'client-4',
    name: 'Dr. Rachel Kim',
    company: 'Northstar Genomics',
    phone: '+1 (555) 345-8910',
    email: 'r.kim@northstargenomics.com',
    country: 'United States',
    service: 'Bioinformatics Data Hub',
    status: 'Active',
    totalBilled: 42000,
    dateAdded: '2025-09-10'
  },
  {
    id: 'client-5',
    name: 'Martin Vance',
    company: 'Cascade Digital Ventures',
    phone: '+1 (555) 456-7890',
    email: 'mvance@cascadedigital.io',
    country: 'United States',
    service: 'Venture Portfolio Analytics UI',
    status: 'Active',
    totalBilled: 38000,
    dateAdded: '2025-08-25'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote-1',
    quoteNumber: 'QT-2025-001',
    clientName: 'Sarah Miller',
    companyName: 'Apex Logistics Ltd',
    clientEmail: 'sarah.miller@apexlogistics.com',
    service: 'Custom Warehouse Dispatch & Fleet Telematics',
    amount: 34500,
    dateIssued: '2025-10-12',
    validUntil: '2025-11-12',
    status: 'Sent',
    notes: 'Includes frontend web portal, driver mobile interface, and API integrations.'
  },
  {
    id: 'quote-2',
    quoteNumber: 'QT-2025-002',
    clientName: 'Marcus Thorne',
    companyName: 'Vanguard Capital Partners',
    clientEmail: 'm.thorne@vanguardcap.co.uk',
    service: 'FinTech Secure Investor Trading Portal',
    amount: 48000,
    dateIssued: '2025-10-10',
    validUntil: '2025-11-10',
    status: 'Accepted',
    notes: 'Multi-factor authentication, high-throughput financial data streaming.'
  },
  {
    id: 'quote-3',
    quoteNumber: 'QT-2025-003',
    clientName: 'Elena Rostova',
    companyName: 'Kinetics AI Robotics',
    clientEmail: 'elena@kineticsai.de',
    service: 'Computer Vision Telemetry Dashboard',
    amount: 22000,
    dateIssued: '2025-10-14',
    validUntil: '2025-11-14',
    status: 'Draft',
    notes: 'Draft estimate pending internal sprint estimation.'
  },
  {
    id: 'quote-4',
    quoteNumber: 'QT-2025-004',
    clientName: 'Julian Gomez',
    companyName: 'Solaris Clean Energy',
    clientEmail: 'julian@solarisclean.com',
    service: 'Solar Farm Remote Monitoring Phase 2',
    amount: 19500,
    dateIssued: '2025-09-28',
    validUntil: '2025-10-28',
    status: 'Accepted',
    notes: 'Additional IoT gateways and reporting engine.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-101',
    clientName: 'Chloe Bennett',
    companyName: 'Strata Engineering Group',
    clientEmail: 'c.bennett@strataengineering.com.au',
    clientPhone: '+61 2 9876 5432',
    clientAddress: 'Level 14, 201 Kent St, Sydney NSW 2000',
    service: 'Cloud Infrastructure & Kubernetes Setup - Milestone 1',
    amount: 28000,
    subtotal: 28000,
    issueDate: '2025-10-01',
    dueDate: '2025-10-21',
    status: 'Paid',
    bankName: 'Meezan Bank Ltd',
    accountNumber: '0102-0105829101',
    notes: 'Paid in full via international bank wire.',
    sections: [
      { id: 's-101-1', title: 'Cloud Infrastructure & VPC Setup', amount: 15000 },
      { id: 's-101-2', title: 'Kubernetes Cluster & Ingress Routing', amount: 13000 }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-102',
    clientName: 'Tariq Mansour',
    companyName: 'Aura Payment Solutions',
    clientEmail: 'tariq@aurapayments.ae',
    service: 'Payment Processing Gateway Architecture',
    subtotal: 40000,
    discountType: 'fixed',
    discountValue: 5000,
    discountAmount: 5000,
    amount: 35000,
    issueDate: '2025-10-05',
    dueDate: '2025-10-25',
    status: 'Paid',
    notes: 'Direct wire transfer received (PKR 5,000 corporate discount applied).'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2025-103',
    clientName: 'Julian Gomez',
    companyName: 'Solaris Clean Energy',
    clientEmail: 'julian@solarisclean.com',
    service: 'IoT Solar Telemetry Portal Sprint 2',
    subtotal: 16000,
    discountType: 'percentage',
    discountValue: 10,
    discountAmount: 1600,
    amount: 14400,
    issueDate: '2025-10-09',
    dueDate: '2025-10-30',
    status: 'Unpaid',
    notes: 'Sent to accounts payable, awaiting net-21 payment (10% partner discount applied).'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2025-104',
    clientName: 'Dr. Rachel Kim',
    companyName: 'Northstar Genomics',
    clientEmail: 'r.kim@northstargenomics.com',
    service: 'Bioinformatics Workflow Engine UI',
    amount: 18000,
    issueDate: '2025-09-15',
    dueDate: '2025-10-05',
    status: 'Overdue',
    notes: 'Follow-up email sent regarding pending balance.'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2025-105',
    clientName: 'Martin Vance',
    companyName: 'Cascade Digital Ventures',
    clientEmail: 'mvance@cascadedigital.io',
    service: 'Venture Analytics Dashboard Deliverable',
    amount: 22500,
    issueDate: '2025-10-12',
    dueDate: '2025-11-02',
    status: 'Unpaid',
    notes: 'Scheduled for bi-weekly billing cycle.'
  }
];

export const INITIAL_SALES_RECORDS: SalesRecord[] = [
  {
    id: 'sale-1',
    recordNumber: 'REC-2025-01',
    invoiceNumber: 'INV-2025-101',
    clientName: 'Chloe Bennett',
    companyName: 'Strata Engineering Group',
    service: 'Cloud Infrastructure & Kubernetes Setup',
    amount: 28000,
    paidDate: '2025-10-06',
    paymentMethod: 'Bank Wire Transfer'
  },
  {
    id: 'sale-2',
    recordNumber: 'REC-2025-02',
    invoiceNumber: 'INV-2025-102',
    clientName: 'Tariq Mansour',
    companyName: 'Aura Payment Solutions',
    service: 'Payment Processing Gateway Architecture',
    amount: 35000,
    paidDate: '2025-10-09',
    paymentMethod: 'Bank Wire Transfer'
  },
  {
    id: 'sale-3',
    recordNumber: 'REC-2025-03',
    invoiceNumber: 'INV-2025-095',
    clientName: 'Julian Gomez',
    companyName: 'Solaris Clean Energy',
    service: 'Solar Farm Telemetry Sprint 1',
    amount: 24000,
    paidDate: '2025-09-24',
    paymentMethod: 'ACH Direct Deposit'
  },
  {
    id: 'sale-4',
    recordNumber: 'REC-2025-04',
    invoiceNumber: 'INV-2025-089',
    clientName: 'Martin Vance',
    companyName: 'Cascade Digital Ventures',
    service: 'Initial Prototype & Tech Scoping',
    amount: 15500,
    paidDate: '2025-09-02',
    paymentMethod: 'Credit Card / Stripe'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: 'lead_added',
    title: 'New Lead Added',
    description: 'Elena Rostova from Kinetics AI Robotics was added to pipeline',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-2',
    type: 'invoice_created',
    title: 'Invoice Generated',
    description: 'Invoice #INV-2025-105 issued for Cascade Digital Ventures ($22,500)',
    timestamp: '5 hours ago'
  },
  {
    id: 'act-3',
    type: 'quotation_generated',
    title: 'Quotation Generated',
    description: 'Proposal QT-2025-001 ($34,500) created for Apex Logistics Ltd',
    timestamp: '1 day ago'
  },
  {
    id: 'act-4',
    type: 'invoice_paid',
    title: 'Payment Received',
    description: 'Aura Payment Solutions completed payment of $35,000 for INV-2025-102',
    timestamp: '2 days ago'
  },
  {
    id: 'act-5',
    type: 'client_created',
    title: 'Client Created',
    description: 'Tariq Mansour (Aura Payment Solutions) successfully converted to Client',
    timestamp: '3 days ago'
  }
];

export const INITIAL_SALESPERSON: SalesPersonProfile = {
  id: 'sp-1',
  name: 'Hamza Tariq',
  role: 'Senior Sales Executive',
  email: 'hamza@root4tech.com',
  phone: '+92 300 1234567',
  shift: '10:00 AM - 06:00 PM',
  baseSalary: 75000,
  monthlyBonus: 15000
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2025-10-14',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '09:58 AM',
    clockOut: '06:02 PM',
    totalHours: '8h 04m',
    status: 'Completed'
  },
  {
    id: 'att-2',
    date: '2025-10-13',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '10:02 AM',
    clockOut: '06:00 PM',
    totalHours: '7h 58m',
    status: 'Completed'
  },
  {
    id: 'att-3',
    date: '2025-10-12',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '09:55 AM',
    clockOut: '06:05 PM',
    totalHours: '8h 10m',
    status: 'Completed'
  }
];

export const INITIAL_SALES_TASKS: SalesPersonTask[] = [
  {
    id: 'task-1',
    title: 'Call back Sarah Miller (Apex Logistics) regarding cloud pricing',
    dueTime: '11:30 AM',
    priority: 'High',
    completed: true
  },
  {
    id: 'task-2',
    title: 'Prepare demo walkthrough for Solaris Clean Energy telemetry',
    dueTime: '02:00 PM',
    priority: 'High',
    completed: false
  },
  {
    id: 'task-3',
    title: 'Follow up on pending quotation QT-2025-002 with Marcus Thorne',
    dueTime: '03:45 PM',
    priority: 'Medium',
    completed: false
  },
  {
    id: 'task-4',
    title: 'Log newly contacted leads from Karachi Tech Expo into CRM',
    dueTime: '05:15 PM',
    priority: 'Low',
    completed: false
  }
];

export const INITIAL_PERSONAL_SALES: SalesPersonSale[] = [
  {
    id: 'ps-1',
    clientName: 'Julian Gomez',
    companyName: 'Solaris Clean Energy',
    service: 'Solar Farm Remote Monitoring Phase 2',
    amount: 195000,
    commissionRate: 5,
    commissionAmount: 9750,
    dateClosed: '2025-10-10',
    paymentMethod: 'Bank Wire Transfer',
    notes: 'Customer signed quarterly maintenance add-on.'
  },
  {
    id: 'ps-2',
    clientName: 'Chloe Bennett',
    companyName: 'Strata Engineering Group',
    service: 'Cloud Infrastructure & Kubernetes Setup',
    amount: 280000,
    commissionRate: 5,
    commissionAmount: 14000,
    dateClosed: '2025-10-06',
    paymentMethod: 'Bank Wire Transfer',
    notes: 'Milestone 1 invoice accepted and cleared.'
  },
  {
    id: 'ps-3',
    clientName: 'Martin Vance',
    companyName: 'Cascade Digital Ventures',
    service: 'Venture Portfolio Analytics UI',
    amount: 95000,
    commissionRate: 5,
    commissionAmount: 4750,
    dateClosed: '2025-10-02',
    paymentMethod: 'Direct Deposit',
    notes: 'Initial sprint deposit received.'
  }
];

export const INITIAL_MARKETING_MANAGER: MarketingManagerProfile = {
  id: 'mm-1',
  name: 'Ayesha Khan',
  role: 'Marketing Manager',
  email: 'ayesha.khan@root4tech.com',
  phone: '+92 300 8472910',
  shift: '10:00 AM - 06:00 PM',
  baseSalary: 120000,
  campaignBonus: 30000,
  fuelAllowance: 15000,
  taxDeduction: 5000
};

export const INITIAL_MARKETING_ATTENDANCE: MarketingAttendanceRecord[] = [
  {
    id: 'm-att-1',
    date: '2025-10-14',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '09:58 AM',
    clockOut: null,
    totalHours: 'In Progress',
    status: 'Active'
  },
  {
    id: 'm-att-2',
    date: '2025-10-13',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '10:01 AM',
    clockOut: '06:05 PM',
    totalHours: '8h 04m',
    status: 'Completed'
  },
  {
    id: 'm-att-3',
    date: '2025-10-12',
    shift: '10:00 AM - 06:00 PM',
    clockIn: '09:50 AM',
    clockOut: '06:00 PM',
    totalHours: '8h 10m',
    status: 'Completed'
  }
];

export const INITIAL_ONBOARDED_CLIENTS: OnboardedClient[] = [
  {
    id: 'ob-1',
    clientName: 'Sarah Miller',
    companyName: 'Apex Logistics Ltd',
    email: 'sarah.miller@apexlogistics.com',
    phone: '+92 321 4455667',
    campaignService: 'Performance Meta Ads & Fleet Lead Gen',
    monthlyBudget: 250000,
    onboardingDate: '2025-10-02',
    status: 'Active',
    managerRemarks: 'Campaign delivering 4.2x ROAS. Sarah approved scaling weekly ad spend by 15% next Monday.'
  },
  {
    id: 'ob-2',
    clientName: 'Marcus Thorne',
    companyName: 'Vanguard Capital Partners',
    email: 'm.thorne@vanguardcap.co.uk',
    phone: '+44 20 7946 0912',
    campaignService: 'FinTech Investor Acquisition Funnel & SEO',
    monthlyBudget: 420000,
    onboardingDate: '2025-09-25',
    status: 'Active',
    managerRemarks: 'Targeting UK & UAE institutional investors. GTM conversion tracking verified and live.'
  },
  {
    id: 'ob-3',
    clientName: 'Julian Gomez',
    companyName: 'Solaris Clean Energy',
    email: 'julian@solarisclean.com',
    phone: '+1 415 555 0198',
    campaignService: 'Google Search & LinkedIn B2B Energy Outreach',
    monthlyBudget: 180000,
    onboardingDate: '2025-10-08',
    status: 'Onboarding',
    managerRemarks: 'Waiting for client access to Google Ads manager account. Kick-off strategy deck scheduled for Friday.'
  },
  {
    id: 'ob-4',
    clientName: 'Elena Rostova',
    companyName: 'Kinetics AI Robotics',
    email: 'elena@kineticsai.de',
    phone: '+49 89 2018 3921',
    campaignService: 'Global SaaS Brand Launch & Content Strategy',
    monthlyBudget: 310000,
    onboardingDate: '2025-10-11',
    status: 'Review',
    managerRemarks: 'Video creative copy drafted by team. Elena requested minor revision for European AI compliance disclosures.'
  }
];

export const INITIAL_MARKETING_TASKS: MarketingTask[] = [
  {
    id: 'mt-1',
    clientId: 'ob-1',
    clientName: 'Apex Logistics Ltd',
    title: 'Audit Meta CBO ad sets & refresh holiday peak season creatives',
    deadline: 'Today, 02:00 PM',
    priority: 'Urgent',
    status: 'In Progress',
    managerRemarks: 'CTR increased to 3.8% on carousel creatives; need 2 new video variations from design team.',
    completed: false
  },
  {
    id: 'mt-2',
    clientId: 'ob-2',
    clientName: 'Vanguard Capital Partners',
    title: 'Review weekly investor acquisition cost (CAC) and lead sheet',
    deadline: 'Today, 04:30 PM',
    priority: 'High',
    status: 'Pending',
    managerRemarks: 'Generated 42 qualified HNW leads this week at PKR 4,800/lead (20% below target cost).',
    completed: false
  },
  {
    id: 'mt-3',
    clientId: 'ob-3',
    clientName: 'Solaris Clean Energy',
    title: 'Set up GA4 event tags and offline conversion sync pipeline',
    deadline: 'Tomorrow, 11:00 AM',
    priority: 'High',
    status: 'Pending',
    managerRemarks: 'API keys received; pending webhook configuration on client staging server.',
    completed: false
  },
  {
    id: 'mt-4',
    clientId: 'ob-4',
    clientName: 'Kinetics AI Robotics',
    title: 'Finalize October editorial calendar and LinkedIn thought leadership posts',
    deadline: 'Today, 12:00 PM',
    priority: 'Medium',
    status: 'Completed',
    managerRemarks: 'Approved 8 technical articles covering autonomous robotics in logistics.',
    completed: true
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    name: 'Adnan Siddiqui',
    email: 'admin@root4tech.com',
    role: 'admin',
    roleTitle: 'Managing Director & Administrator',
    department: 'Executive Administration',
    phone: '+92 300 8291043',
    shift: 'Full Time',
    avatarInitials: 'AS',
    password: 'admin123',
    defaultRoute: '/dashboard',
    status: 'Active',
    joinDate: '2024-01-15'
  },
  {
    id: 'usr-sales',
    name: 'Hamza Tariq',
    email: 'sales@root4tech.com',
    role: 'sales',
    roleTitle: 'Senior Sales Executive',
    shift: '10:00 AM – 06:00 PM',
    department: 'Business Development & Sales',
    phone: '+92 321 4458920',
    avatarInitials: 'HT',
    password: 'sales123',
    defaultRoute: '/salesperson',
    salary: 85000,
    status: 'Active',
    joinDate: '2024-03-01'
  },
  {
    id: 'usr-marketing',
    name: 'Ayesha Khan',
    email: 'marketing@root4tech.com',
    role: 'marketing',
    roleTitle: 'Senior Marketing Manager',
    shift: '10:00 AM – 06:00 PM',
    department: 'Digital Growth & Client Marketing',
    phone: '+92 333 9102488',
    avatarInitials: 'AK',
    password: 'marketing123',
    defaultRoute: '/marketing',
    salary: 95000,
    status: 'Active',
    joinDate: '2024-02-15'
  }
];

export const DEMO_USERS = INITIAL_USERS;

export const generateDemoLeads = (count: number = 25): Omit<Lead, 'id' | 'dateAdded'>[] => {
  const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'William', 'Ava', 'James', 'Isabella', 'Oliver', 'Sophia', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Alexander', 'Harper', 'Sebastian', 'Evelyn'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const prefixes = ['Apex', 'Vanguard', 'Omni', 'Synapse', 'Nexus', 'Vertex', 'Starlight', 'Hyperion', 'Aero', 'Quantum', 'Cyber', 'Terra', 'Pulse', 'Stratosphere', 'Horizon'];
  const suffixes = ['Technologies', 'Solutions', 'Logistics', 'Capital', 'Labs', 'Dynamics', 'Digital', 'Systems', 'Global', 'Ventures', 'Interactive', 'Cloud', 'Data', 'Networks'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'United Arab Emirates', 'Singapore', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Japan', 'Ireland', 'Brazil', 'Saudi Arabia'];
  const services = [
    'Custom Web & Cloud Platform',
    'Enterprise Architecture & DevOps',
    'Mobile Application (iOS/Android)',
    'Payment Gateway Integration',
    'AI Integration & Telemetry',
    'UI/UX Engineering & Design System'
  ];
  const statuses: LeadStatus[] = ['New', 'Contacted', 'Call Back', 'Interested', 'Send Proposal', 'Converted'];

  const generated: Omit<Lead, 'id' | 'dateAdded'>[] = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const comp = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    const domain = comp.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const phone = `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const country = countries[Math.floor(Math.random() * countries.length)];
    const interestedService = services[Math.floor(Math.random() * services.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const notes = `Enterprise inquiry regarding ${interestedService.toLowerCase()} for ${comp}.`;

    generated.push({
      name: `${fn} ${ln}`,
      company: comp,
      phone,
      email,
      country,
      interestedService,
      status,
      notes
    });
  }
  return generated;
};

