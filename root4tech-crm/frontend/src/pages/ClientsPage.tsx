import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Client } from '@/types/crm';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileText,
  X,
  Phone,
  Mail,
  Building,
  Globe,
  Briefcase
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useCRM();
  const navigate = useNavigate();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [service, setService] = useState('Custom Web & Cloud Platform');
  const [status, setStatus] = useState<Client['status']>('Active');

  const openAddModal = () => {
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setCountry('United States');
    setService('Custom Web & Cloud Platform');
    setStatus('Active');
    setIsAddModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company);
    setPhone(client.phone);
    setEmail(client.email);
    setCountry(client.country);
    setService(client.service);
    setStatus(client.status);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name,
      company,
      phone,
      email,
      country,
      service,
      status,
      totalBilled: 0
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient.id, {
      name,
      company,
      phone,
      email,
      country,
      service,
      status
    });
    setEditingClient(null);
  };

  const handleDelete = (id: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to remove client "${clientName}"?`)) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.country.toLowerCase().includes(query) ||
      c.service.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (st: Client['status']) => {
    switch (st) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Onboarding':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Clients Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active customer directory, contracts, and accounts
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Active', 'Onboarding', 'Completed', 'Inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? `All (${clients.length})` : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients, company, country..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Professional Clients Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Client Name</th>
                <th className="py-3.5 px-4 font-semibold">Company Name</th>
                <th className="py-3.5 px-4 font-semibold">Phone</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Country</th>
                <th className="py-3.5 px-4 font-semibold">Service</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {client.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {client.company}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                    {client.phone}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                    {client.email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    {client.country}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={client.service}>
                    {client.service}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        client.status
                      )}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate('/quotations')}
                        title="Create Quotation"
                        className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-medium flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Quote</span>
                      </button>
                      <button
                        onClick={() => setViewingClient(client)}
                        title="View Details"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(client)}
                        title="Edit Client"
                        className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        title="Delete Client"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CLIENT MODAL */}
      {(isAddModalOpen || editingClient) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingClient(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingClient ? handleSaveEdit : handleSaveAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Contact Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chloe Bennett"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Strata Engineering Group"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    required
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Australia"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Client['status'])}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Service / Contract Scope *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Custom Web & Cloud Platform">Custom Web & Cloud Platform</option>
                  <option value="Enterprise Architecture & DevOps">Enterprise Architecture & DevOps</option>
                  <option value="Payment Gateway Integration">Payment Gateway Integration</option>
                  <option value="IoT Solar Telemetry Portal">IoT Solar Telemetry Portal</option>
                  <option value="Bioinformatics Data Hub">Bioinformatics Data Hub</option>
                  <option value="Venture Portfolio Analytics UI">Venture Portfolio Analytics UI</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CLIENT DETAILS MODAL */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Client Profile
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                    viewingClient.status
                  )}`}
                >
                  {viewingClient.status}
                </span>
              </div>
              <button
                onClick={() => setViewingClient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Client Name</span>
                <span className="text-sm font-bold text-slate-900">{viewingClient.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Organization</span>
                  <span className="font-semibold text-slate-800">{viewingClient.company}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Phone</span>
                    <span className="font-mono text-slate-800">{viewingClient.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Email</span>
                    <span className="font-mono text-slate-800 truncate block">{viewingClient.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Country / Region</span>
                  <span className="font-medium text-slate-800">{viewingClient.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Contracted Service</span>
                  <span className="font-medium text-blue-600">{viewingClient.service}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Added: {viewingClient.dateAdded}</span>
              <button
                onClick={() => setViewingClient(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
