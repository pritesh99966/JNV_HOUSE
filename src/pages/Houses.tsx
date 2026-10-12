import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { House, HouseCategory, Gender, HouseStatus } from '../types';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

export default function Houses() {
  const { houses, students, wardens, addHouse, updateHouse, deleteHouse } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [formData, setFormData] = useState({ house_name: '', category: 'Senior Boys' as HouseCategory, gender: 'Male' as Gender, status: 'Active' as HouseStatus });

  const openAddForm = () => { setEditingHouse(null); setFormData({ house_name: '', category: 'Senior Boys', gender: 'Male', status: 'Active' }); setShowForm(true); };
  const openEditForm = (h: House) => { setEditingHouse(h); setFormData({ house_name: h.house_name, category: h.category, gender: h.gender, status: h.status }); setShowForm(true); };
  const handleSave = () => {
    if (!formData.house_name) { setToast({ type: 'error', message: 'Name required' }); setTimeout(() => setToast(null), 3000); return; }
    if (editingHouse) { updateHouse(editingHouse.id, formData); setToast({ type: 'success', message: 'Updated' }); } else { addHouse(formData); setToast({ type: 'success', message: 'Added' }); }
    setShowForm(false); setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Houses</h1><p className="text-gray-500 text-sm">{houses.length} houses</p></div>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add House</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {houses.map((h: House) => {
          const studentCount = students.filter((s: { house_id: string; status: string }) => s.house_id === h.id && s.status === 'Active').length;
          const warden = wardens.find((w: { assigned_house_id: string }) => w.assigned_house_id === h.id);
          return (
            <div key={h.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-bold text-gray-800">{h.house_name}</h3><p className="text-xs text-gray-500">{h.category} • {h.gender}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${h.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{h.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-indigo-500" /><span className="text-sm text-gray-600"><strong>{studentCount}</strong> students</span></div>
              <div className="text-sm text-gray-600 mb-4"><p><span className="text-gray-400">Warden:</span> <span className="font-medium">{warden?.name || 'Not Assigned'}</span></p></div>
              <div className="flex gap-2 pt-3 border-t">
                <button onClick={() => openEditForm(h)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => setShowDeleteConfirm(h.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="text-lg font-bold">{editingHouse ? 'Edit' : 'Add'} House</h2><button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={formData.house_name} onChange={e => setFormData({ ...formData, house_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as HouseCategory })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Senior Boys">Senior Boys</option><option value="Junior Boys">Junior Boys</option><option value="Girls">Girls</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Male">Male</option><option value="Female">Female</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as HouseStatus })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{editingHouse ? 'Update' : 'Add'}</button></div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full"><h3 className="text-lg font-bold mb-2">Delete House?</h3><p className="text-sm text-gray-600 mb-4">This will permanently remove this house.</p>
            <div className="flex justify-end gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={() => { deleteHouse(showDeleteConfirm); setShowDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
