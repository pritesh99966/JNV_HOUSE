import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Settings, Plus } from 'lucide-react';

export default function MasterDashboard() {
  const { schools, students, houses } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Master Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome, {user?.name} | Manage all schools</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-purple-600">{schools.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Schools</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{houses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Houses</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-2xl font-bold">{schools.filter((s: any) => s.status === 'Active').length}</p>
          <p className="text-xs mt-1">Active Schools</p>
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
    </div>
  );
}
