import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { School } from '../types';
import { Plus, Edit2, Trash2, School as SchoolIcon, Users, Building2, Activity } from 'lucide-react';

export default function MasterDashboard() {
  const { schools, houses, wardens, students, attendance, addSchool, updateSchool, deleteSchool } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    admin_username: '',
    admin_password: '',
    admin_name: '',
    admin_email: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended'
  });

  const openAddForm = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      code: '',
      admin_username: '',
      admin_password: '',
      admin_name: '',
      admin_email: '',
      status: 'Active'
    });
    setShowForm(true);
  };

  const openEditForm = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      admin_username: school.admin_username,
      admin_password: school.admin_password,
      admin_name: school.admin_name,
      admin_email: school.admin_email,
      status: school.status
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.admin_username || !formData.admin_password || !formData.admin_name) {
      setToast({ type: 'error', message: 'Please fill all required fields' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    if (editingSchool) {
      updateSchool(editingSchool.id, formData);
      setToast({ type: 'success', message: 'School updated successfully' });
    } else {
      addSchool(formData);
      setToast({ type: 'success', message: 'School created successfully' });
    }
    setShowForm(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    deleteSchool(id);
    setShowDeleteConfirm(null);
    setToast({ type: 'success', message: 'School deleted successfully' });
    setTimeout(() => setToast(null), 3000);
  };

  const getSchoolStats = (schoolId: string) => {
    const schoolHouses = houses.filter((h: any) => h.school_id === schoolId || !h.school_id);
    const schoolWardens = wardens.filter((w: any) => w.school_id === schoolId || !w.school_id);
    const schoolStudents = students.filter((s: any) => s.school_id === schoolId || !s.school_id);
    const schoolAttendance = attendance.filter((a: any) => a.school_id === schoolId || !a.school_id);
    
    return {
      houses: schoolHouses.length,
      wardens: schoolWardens.length,
      students: schoolStudents.length,
      attendance: schoolAttendance.length
    };
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
          <h1 className="text-2xl font-bold text-gray-800">Master Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage all schools</p>
        </div>
        <button 
          onClick={openAddForm} 
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add School
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
            <SchoolIcon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Schools</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{houses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Houses</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{attendance.length}</p>
          <p className="text-xs text-gray-500 mt-1">Attendance Records</p>
        </div>
      </div>

      {/* Schools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school: School) => {
          const stats = getSchoolStats(school.id);
          return (
            <div key={school.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{school.name}</h3>
                  <p className="text-xs text-gray-500">Code: {school.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  school.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {school.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="text-gray-400">Admin:</span> <span className="font-medium">{school.admin_name}</span></p>
                <p><span className="text-gray-400">Username:</span> <span className="font-mono text-xs">{school.admin_username}</span></p>
                <p><span className="text-gray-400">Email:</span> {school.admin_email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-blue-700">{stats.houses}</p>
                  <p className="text-xs text-gray-600">Houses</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-700">{stats.students}</p>
                  <p className="text-xs text-gray-600">Students</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button 
                  onClick={() => openEditForm(school)} 
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(school.id)} 
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {schools.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl">
          No schools found. Click "Add School" to create one.
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingSchool ? 'Edit School' : 'Add New School'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="e.g., Kendriya Vidyalaya No. 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Code *</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="e.g., KV003"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                <input 
                  type="text" 
                  value={formData.admin_name} 
                  onChange={e => setFormData({ ...formData, admin_name: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Admin full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <input 
                  type="email" 
                  value={formData.admin_email} 
                  onChange={e => setFormData({ ...formData, admin_email: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="admin@school.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username *</label>
                <input 
                  type="text" 
                  value={formData.admin_username} 
                  onChange={e => setFormData({ ...formData, admin_username: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Username for school admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password *</label>
                <input 
                  type="text" 
                  value={formData.admin_password} 
                  onChange={e => setFormData({ ...formData, admin_password: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Password for school admin"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                {editingSchool ? 'Update' : 'Create'} School
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Delete School?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the school and all its data (houses, students, attendance). This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Delete School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
