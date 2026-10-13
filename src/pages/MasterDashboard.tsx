import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Settings, Plus, Users, UserCheck, Home, School as SchoolIcon } from 'lucide-react';

export default function MasterDashboard() {
  const { schools, students, houses, wardens, addSchool } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  // Calculate total counts
  const totalStudents = students.length;
  const totalWardens = wardens.length;
  const totalHouses = houses.length;

  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    admin_username: '',
    admin_password: '',
    admin_name: '',
    admin_email: '',
    licence_start_date: new Date().toISOString().split('T')[0],
    licence_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleAddSchool = () => {
    if (!newSchool.name || !newSchool.code || !newSchool.admin_username || !newSchool.admin_password || !newSchool.admin_name) {
      setToast({ type: 'error', message: 'Please fill all required fields' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Check if school code already exists
    if (schools.find((s: any) => s.code === newSchool.code)) {
      setToast({ type: 'error', message: 'School code already exists' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Check if username already exists
    if (schools.find((s: any) => s.admin_username === newSchool.admin_username)) {
      setToast({ type: 'error', message: 'Username already exists' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    addSchool({
      ...newSchool,
      status: 'Active',
      licence_status: 'Active',
      last_login: '',
      total_time_spent: 0
    });

    setToast({ type: 'success', message: 'School added successfully!' });
    setTimeout(() => setToast(null), 3000);
    setShowAddSchool(false);
    setNewSchool({
      name: '',
      code: '',
      admin_username: '',
      admin_password: '',
      admin_name: '',
      admin_email: '',
      licence_start_date: new Date().toISOString().split('T')[0],
      licence_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name} | Manage all schools</p>
        </div>
        <button 
          onClick={() => setShowAddSchool(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New School
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SchoolIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
              <p className="text-xs text-gray-500">Total Schools</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalHouses}</p>
              <p className="text-xs text-gray-500">Total Houses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalWardens}</p>
              <p className="text-xs text-gray-500">Total Wardens</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{schools.filter((s: any) => s.status === 'Active').length}</p>
              <p className="text-xs">Active Schools</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{schools.filter((s: any) => s.licence_status === 'Active').length}</p>
              <p className="text-xs">Active Licences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/master/school-analytics')}
            className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">School Analytics</p>
              <p className="text-xs text-gray-500">View detailed school statistics</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/master/settings')}
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Settings</p>
              <p className="text-xs text-gray-500">Manage system settings</p>
            </div>
          </button>
          <button 
            onClick={() => {
              // Add new school functionality
              alert('Add School feature coming soon!');
            }}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Add School</p>
              <p className="text-xs text-gray-500">Create new school account</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h3 className="font-semibold text-gray-800">All Schools</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">School Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.map((school: any) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{school.name}</td>
                  <td className="px-4 py-3 text-gray-600">{school.code}</td>
                  <td className="px-4 py-3 text-gray-600">{school.admin_name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{school.admin_username}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {school.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Add New School</h2>
              <button onClick={() => setShowAddSchool(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                  <input 
                    type="text" 
                    value={newSchool.name}
                    onChange={e => setNewSchool({ ...newSchool, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="e.g., Kendriya Vidyalaya No. 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code *</label>
                  <input 
                    type="text" 
                    value={newSchool.code}
                    onChange={e => setNewSchool({ ...newSchool, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="e.g., KV003"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                  <input 
                    type="text" 
                    value={newSchool.admin_name}
                    onChange={e => setNewSchool({ ...newSchool, admin_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Admin full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input 
                    type="email" 
                    value={newSchool.admin_email}
                    onChange={e => setNewSchool({ ...newSchool, admin_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="admin@school.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username *</label>
                  <input 
                    type="text" 
                    value={newSchool.admin_username}
                    onChange={e => setNewSchool({ ...newSchool, admin_username: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Unique username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password *</label>
                  <input 
                    type="text" 
                    value={newSchool.admin_password}
                    onChange={e => setNewSchool({ ...newSchool, admin_password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Unique password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Licence Start Date</label>
                  <input 
                    type="date" 
                    value={newSchool.licence_start_date}
                    onChange={e => setNewSchool({ ...newSchool, licence_start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Licence Expiry Date</label>
                  <input 
                    type="date" 
                    value={newSchool.licence_expiry_date}
                    onChange={e => setNewSchool({ ...newSchool, licence_expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Make sure username and password are unique for each school. School admin will use these credentials to login.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowAddSchool(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button onClick={handleAddSchool} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                Add School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
