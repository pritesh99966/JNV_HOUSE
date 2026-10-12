import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function MasterDashboard() {
  const { schools, students, houses } = useData();
  const { user } = useAuth();

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
