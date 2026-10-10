import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { houses, students, attendance, wardens } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetData = () => { localStorage.clear(); window.location.reload(); };

  const stats = [
    { label: 'Total Houses', value: houses.length },
    { label: 'Total Wardens', value: wardens.length },
    { label: 'Total Students', value: students.length },
    { label: 'Attendance Records', value: attendance.length },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">Settings</h1><p className="text-gray-500 text-sm">System configuration</p></div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-indigo-600">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>)}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Data Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div><p className="font-medium text-yellow-800">Reset All Data</p><p className="text-sm text-yellow-600">Clear all data and reload with seed data</p></div>
            <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"><RefreshCw className="w-4 h-4" /> Reset</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div><p className="font-medium text-blue-800">Clear Old Attendance</p><p className="text-sm text-blue-600">Remove attendance records older than 7 days to free storage</p></div>
            <button onClick={() => { 
              const att = JSON.parse(localStorage.getItem('hms_attendance') || '[]');
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              const cutoff = sevenDaysAgo.toISOString().split('T')[0];
              const filtered = att.filter((a: any) => a.attendance_date >= cutoff);
              localStorage.setItem('hms_attendance', JSON.stringify(filtered));
              alert(`Cleared ${att.length - filtered.length} old records. ${filtered.length} records remaining.`);
            }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><RefreshCw className="w-4 h-4" /> Clear Old</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div><p className="font-medium text-gray-800">Storage Used</p><p className="text-sm text-gray-600">Approximate localStorage usage</p></div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{(() => {
                let total = 0;
                for (let key in localStorage) {
                  if (localStorage.hasOwnProperty(key) && key.startsWith('hms_')) {
                    total += localStorage.getItem(key)?.length || 0;
                  }
                }
                return (total / 1024).toFixed(1) + ' KB';
              })()}</p>
              <p className="text-xs text-gray-500">of ~5 MB limit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Login Credentials</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-4 py-2 font-medium text-gray-600">Role</th><th className="text-left px-4 py-2 font-medium text-gray-600">Username</th><th className="text-left px-4 py-2 font-medium text-gray-600">Password</th></tr></thead>
            <tbody className="divide-y">
              <tr><td className="px-4 py-2">Admin</td><td className="px-4 py-2 font-mono">admin</td><td className="px-4 py-2 font-mono">admin123</td></tr>
              {wardens.map((w: { id: string; username: string; password: string }) => <tr key={w.id}><td className="px-4 py-2">Warden</td><td className="px-4 py-2 font-mono">{w.username}</td><td className="px-4 py-2 font-mono">{w.password}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div><h3 className="text-lg font-bold">Reset All Data?</h3></div>
            <p className="text-sm text-gray-600 mb-4">This will delete all data and restore defaults.</p>
            <div className="flex justify-end gap-3"><button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleResetData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Reset</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
