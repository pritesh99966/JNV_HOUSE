import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Warden } from '../types';
import { Plus, Edit2, Trash2, X, Shield, ShieldOff } from 'lucide-react';

export default function Wardens() {
  const { houses, wardens, addWarden, updateWarden, deleteWarden } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingWarden, setEditingWarden] = useState<Warden | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', mobile: '', password: 'warden123', assigned_house_id: '', status: 'Active' as 'Active' | 'Inactive', photo_url: '' });

  const openAddForm = () => { setEditingWarden(null); setFormData({ name: '', username: '', email: '', mobile: '', password: 'warden123', assigned_house_id: '', status: 'Active', photo_url: '' }); setShowForm(true); };
  const openEditForm = (w: Warden) => { setEditingWarden(w); setFormData({ name: w.name, username: w.username, email: w.email, mobile: w.mobile, password: w.password, assigned_house_id: w.assigned_house_id, status: w.status, photo_url: w.photo_url }); setShowForm(true); };

  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.assigned_house_id) { setToast({ type: 'error', message: 'Fill required fields' }); setTimeout(() => setToast(null), 3000); return; }
    if (editingWarden) { updateWarden(editingWarden.id, formData); setToast({ type: 'success', message: 'Updated' }); } else { addWarden(formData); setToast({ type: 'success', message: 'Added' }); }
    setShowForm(false); setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = (w: Warden) => { updateWarden(w.id, { status: w.status === 'Active' ? 'Inactive' : 'Active' }); };
  const resetPassword = (w: Warden) => { updateWarden(w.id, { password: 'warden123' }); setToast({ type: 'success', message: `Password reset for ${w.name}` }); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Warden Management</h1><p className="text-gray-500 text-sm">{wardens.length} wardens</p></div>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Warden</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wardens.map((w: Warden) => {
          const house = houses.find((h: { id: string }) => h.id === w.assigned_house_id);
          return (
            <div key={w.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3"><div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">{w.name.charAt(0)}</div><div><h3 className="font-bold text-gray-800">{w.name}</h3><p className="text-xs text-gray-500">@{w.username}</p></div></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{w.status}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="text-gray-400">House:</span> <span className="font-medium text-indigo-600">{house?.house_name || 'N/A'}</span></p>
                <p><span className="text-gray-400">Email:</span> {w.email}</p>
                <p><span className="text-gray-400">Mobile:</span> {w.mobile}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <button onClick={() => openEditForm(w)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => toggleStatus(w)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100">{w.status === 'Active' ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}{w.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => resetPassword(w)} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Reset Pwd</button>
                <button onClick={() => setShowDeleteConfirm(w.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="text-lg font-bold">{editingWarden ? 'Edit' : 'Add'} Warden</h2><button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Username *</label><input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label><input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">House *</label><select value={formData.assigned_house_id} onChange={e => setFormData({ ...formData, assigned_house_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{editingWarden ? 'Update' : 'Add'}</button></div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full"><h3 className="text-lg font-bold mb-2">Delete Warden?</h3><p className="text-sm text-gray-600 mb-4">This will permanently remove this warden.</p>
            <div className="flex justify-end gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={() => { deleteWarden(showDeleteConfirm); setShowDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
