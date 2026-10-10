import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Licence } from '../types';
import { 
  getAllLicences, 
  createLicence, 
  updateLicence, 
  renewLicence, 
  suspendLicence, 
  activateLicence,
  getLicenceStats,
  getLicenceDaysRemaining,
  LICENCE_PLANS,
  calculateExpiryDate
} from '../utils/licence';
import { createAuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from '../utils/audit';
import { Plus, Edit2, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function LicenceManagement() {
  const { schools } = useData();
  const [licences, setLicences] = useState<Licence[]>([]);
  const [stats, setStats] = useState(getLicenceStats());
  const [showForm, setShowForm] = useState(false);
  const [editingLicence, setEditingLicence] = useState<Licence | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    school_id: '',
    plan: 'Basic' as 'Basic' | 'Standard' | 'Premium',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: calculateExpiryDate(new Date().toISOString().split('T')[0], 12),
    student_limit: 200,
    status: 'Active' as 'Active' | 'Suspended' | 'Expired',
    amount: 5000
  });

  useEffect(() => {
    loadLicences();
  }, []);

  const loadLicences = () => {
    setLicences(getAllLicences());
    setStats(getLicenceStats());
  };

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddForm = () => {
    setEditingLicence(null);
    setFormData({
      school_id: '',
      plan: 'Basic',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: calculateExpiryDate(new Date().toISOString().split('T')[0], 12),
      student_limit: 200,
      status: 'Active',
      amount: 5000
    });
    setShowForm(true);
  };

  const openEditForm = (licence: Licence) => {
    setEditingLicence(licence);
    setFormData({
      school_id: licence.school_id,
      plan: licence.plan,
      start_date: licence.start_date,
      expiry_date: licence.expiry_date,
      student_limit: licence.student_limit,
      status: licence.status,
      amount: licence.amount
    });
    setShowForm(true);
  };

  const handlePlanChange = (plan: 'Basic' | 'Standard' | 'Premium') => {
    const planDetails = LICENCE_PLANS[plan];
    setFormData({
      ...formData,
      plan,
      student_limit: planDetails.student_limit,
      amount: planDetails.price
    });
  };

  const handleSave = () => {
    if (!formData.school_id) {
      showToast('error', 'Please select a school');
      return;
    }

    if (editingLicence) {
      updateLicence(editingLicence.id, formData);
      createAuditLog(
        AUDIT_ACTIONS.LICENCE_UPDATE,
        RESOURCE_TYPES.LICENCE,
        editingLicence.id,
        `Licence updated for school ${formData.school_id}`
      );
      showToast('success', 'Licence updated successfully');
    } else {
      createLicence(formData);
      createAuditLog(
        AUDIT_ACTIONS.LICENCE_CREATE,
        RESOURCE_TYPES.LICENCE,
        formData.school_id,
        `New licence created for school ${formData.school_id}`
      );
      showToast('success', 'Licence created successfully');
    }
    
    setShowForm(false);
    loadLicences();
  };

  const handleRenew = (licenceId: string) => {
    renewLicence(licenceId, 12);
    createAuditLog(
      AUDIT_ACTIONS.LICENCE_RENEW,
      RESOURCE_TYPES.LICENCE,
      licenceId,
      'Licence renewed for 12 months'
    );
    showToast('success', 'Licence renewed successfully');
    loadLicences();
  };

  const handleSuspend = (licenceId: string) => {
    suspendLicence(licenceId);
    createAuditLog(
      AUDIT_ACTIONS.LICENCE_SUSPEND,
      RESOURCE_TYPES.LICENCE,
      licenceId,
      'Licence suspended'
    );
    showToast('success', 'Licence suspended');
    loadLicences();
  };

  const handleActivate = (licenceId: string) => {
    activateLicence(licenceId);
    createAuditLog(
      AUDIT_ACTIONS.LICENCE_UPDATE,
      RESOURCE_TYPES.LICENCE,
      licenceId,
      'Licence activated'
    );
    showToast('success', 'Licence activated');
    loadLicences();
  };

  const getStatusBadge = (status: string, daysRemaining?: number) => {
    if (status === 'Suspended') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Suspended</span>;
    }
    if (status === 'Expired' || (daysRemaining !== undefined && daysRemaining <= 0)) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Expired</span>;
    }
    if (daysRemaining !== undefined && daysRemaining <= 30) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Expiring Soon</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: 'bg-blue-100 text-blue-700',
      Standard: 'bg-purple-100 text-purple-700',
      Premium: 'bg-yellow-100 text-yellow-700'
    };
    return <span className={`px-2 py-1 ${colors[plan as keyof typeof colors]} rounded-full text-xs font-medium`}>{plan}</span>;
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Licence Management</h1>
          <p className="text-gray-500 text-sm">Manage school subscriptions and licences</p>
        </div>
        <button 
          onClick={openAddForm} 
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Licence
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Schools</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-1">Active Licences</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
          <p className="text-xs text-gray-500 mt-1">Suspended</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
          <p className="text-xs text-gray-500 mt-1">Expired</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
          <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
          <p className="text-xs text-gray-500 mt-1">Expiring Soon</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
          <p className="text-xs text-gray-500 mt-1">Total Capacity</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Licences Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-800">All Licences</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">School</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Days Left</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Student Limit</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licences.map(licence => {
                const school = schools.find((s: any) => s.id === licence.school_id);
                const daysRemaining = getLicenceDaysRemaining(licence.school_id);
                
                return (
                  <tr key={licence.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{school?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{getPlanBadge(licence.plan)}</td>
                    <td className="px-4 py-3 text-gray-600">{licence.start_date}</td>
                    <td className="px-4 py-3 text-gray-600">{licence.expiry_date}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`font-medium ${daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {daysRemaining} days
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">{licence.student_limit}</td>
                    <td className="text-center px-4 py-3 font-medium">₹{licence.amount.toLocaleString()}</td>
                    <td className="text-center px-4 py-3">{getStatusBadge(licence.status, daysRemaining)}</td>
                    <td className="text-center px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditForm(licence)} 
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {licence.status === 'Active' && daysRemaining <= 30 && (
                          <button 
                            onClick={() => handleRenew(licence.id)} 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Renew"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        {licence.status === 'Active' ? (
                          <button 
                            onClick={() => handleSuspend(licence.id)} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Suspend"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(licence.id)} 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
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
        {licences.length === 0 && (
          <div className="text-center py-10 text-gray-500">No licences found</div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingLicence ? 'Edit Licence' : 'Add New Licence'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <select 
                  value={formData.school_id} 
                  onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={!!editingLicence}
                >
                  <option value="">Select School</option>
                  {schools.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Basic', 'Standard', 'Premium'] as const).map(plan => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => handlePlanChange(plan)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.plan === plan 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-800">{plan}</p>
                      <p className="text-xs text-gray-600 mt-1">{LICENCE_PLANS[plan].student_limit} students</p>
                      <p className="text-sm font-bold text-purple-600 mt-2">₹{LICENCE_PLANS[plan].price.toLocaleString()}/year</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    value={formData.start_date} 
                    onChange={e => {
                      const startDate = e.target.value;
                      setFormData({ 
                        ...formData, 
                        start_date: startDate,
                        expiry_date: calculateExpiryDate(startDate, 12)
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input 
                    type="date" 
                    value={formData.expiry_date} 
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Limit *</label>
                  <input 
                    type="number" 
                    value={formData.student_limit} 
                    onChange={e => setFormData({ ...formData, student_limit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                {editingLicence ? 'Update' : 'Create'} Licence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
