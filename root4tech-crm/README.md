# Project: ROOT 4 TECH – CRM FRONTEND

A modern, clean, and professional CRM frontend built for **Root 4 Tech**.

The purpose of this CRM is to help one administrator manage company leads, clients, quotations, invoices, and sales records with an intuitive, responsive SaaS interface.

---

## 1. Technology Stack

- **Framework**: React 18, TypeScript, Vite 5
- **Styling**: Tailwind CSS (Modern Light Theme)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React Icons
- **Data Persistence**: Local demo data with `localStorage` state management
- **Zero Charts / Graphs**: Clean, minimal, high-efficiency data presentation as requested.
- **Frontend Only**: No backend, no database, no Django APIs or server dependencies required.

---

## 2. Design and Theme

- **Color Palette**:
  - Main Canvas: Light grey (`#F8FAFC`)
  - Cards & Panels: Crisp white (`#FFFFFF`)
  - Primary & Accent Colors: Navy blue (`#0F172A`) and vibrant blue (`#2563EB`)
  - Subtle borders: Slate-200 (`#E2E8F0`)
  - Status Indicators: Emerald (Converted/Paid/Active), Amber (Contacted/Unpaid), Purple (Interested/Quotations), Blue (New/Leads)
- **Typography**: Inter font family, clean modern hierarchy
- **Form Controls & Buttons**: Rounded corners (`rounded-xl`, `rounded-lg`), subtle focus rings and shadows
- **Responsive Layout**: Fluid experience across desktop, tablet, and mobile devices

---

## 3. Sidebar Navigation (7 Fixed Menu Items)

1. **Dashboard** (`/dashboard`): 4 KPI summary cards (Total Leads, Clients, Quotations, Invoices), Recent Leads, Recent Activities stream.
2. **Leads** (`/leads`): Complete leads table with all 9 columns, search, status filter (New, Contacted, Interested, Converted), Add Lead modal, Edit Lead, Delete Lead, View Details, and Convert to Client.
3. **Clients** (`/clients`): Active client directory with columns (Client Name, Company Name, Phone, Email, Country, Service, Status, Actions), search, status filters, and Add/Edit modals.
4. **Quotations** (`/quotations`): Quote generator, line item scopes, valid until dates, status tracking, 1-click Convert to Invoice, and printable document preview.
5. **Invoices** (`/invoices`): Billing records, due dates, status (Unpaid, Paid, Overdue), 1-click Mark as Paid action, and printable document preview.
6. **Sales Records** (`/sales`): Settled transactions, payment methods (Bank Wire, ACH, Stripe), total realized revenue, and printable report.
7. **Settings** (`/settings`): Company profile (Root 4 Tech, tax registration, official email), administrator profile, and reload demo records tool.

---

## 4. Quick Start

### Start Local Development Server
```bash
cd root4tech-crm/frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Build Production Bundle
```bash
npm run build
```

---

## 5. How to Add and Remove Leads

### Adding a New Lead:
1. Navigate to **Leads** in the sidebar (or click the **+ Add Lead** button on the Dashboard).
2. Click the blue **"+ Add New Lead"** button at the top right.
3. Complete the form with the lead's details:
   - **Full Name** (e.g. *Jonathan Miller*)
   - **Company Name** (e.g. *Apex Logistics Ltd*)
   - **Phone Number** (e.g. *+1 415 889 2314*)
   - **Email Address** (e.g. *jmiller@apexlogistics.io*)
   - **Country**
   - **Interested Service** (e.g. *Custom Web & Cloud Platform*)
   - **Status** (*New*, *Contacted*, *Interested*, *Converted*)
   - **Operational Notes**
4. Click **"Save Lead"**. The lead will immediately appear at the top of your pipeline and save to `localStorage`.

### Removing Previous Leads (3 Methods):
1. **Remove a Single Lead**:
   - In the Leads table, find the row of the lead you wish to delete.
   - Click the red **Delete** (trash icon) button on the right side.
   - Confirm the deletion prompt.
2. **Bulk Remove Multiple Selected Leads**:
   - Select the checkbox next to any leads you wish to delete (or check the header checkbox to select all visible leads).
   - A floating dark bar will appear at the bottom showing: **`Delete Selected (X)`**.
   - Click **"Delete Selected"** and confirm. All checked leads are deleted at once.
3. **Clear All Previous Leads**:
   - Click the red **"Clear All Leads"** button in the top toolbar.
   - Confirm the prompt. All existing leads in the database are cleared immediately.
   *(You can restore original demo data anytime from **Settings -> Reload Initial Demo Records**).*

