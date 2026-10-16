import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RefreshCw, AlertTriangle, Download, Upload } from 'lucide-react';
import { backupSchoolData, downloadBackup, uploadBackup, restoreSchoolData } from '../utils/backup';

export default function Settings() {
  const { user } = useAuth();
  const { houses, students, attendance, wardens, schools, updateSchool } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [fileInputRef] = useState<{ current: HTMLInputElement | null }>({ current: null });

  const isMaster = user?.role === 'master';
  const schoolId = user?.school_id || '';

  const handleResetData = () => { localStorage.clear(); window.location.reload(); };

  const handleChangePassword = () => {
    if (!selectedSchoolId || !newPassword) {
      setToast({ type: 'error', message: 'Please select school and enter new password' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    updateSchool(selectedSchoolId, { admin_password: newPassword });
    setToast({ type: 'success', message: 'Password changed successfully' });
    setShowChangePassword(false);
    setNewPassword('');
    setSelectedSchoolId('');
    setTimeout(() => setToast(null), 3000);
  };

  const handleBackup = () => {
    try {
      const targetSchoolId = isMaster ? selectedSchoolId : schoolId;
      if (!targetSchoolId) {
        setToast({ type: 'error', message: 'Please select a school' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      const backup = backupSchoolData(targetSchoolId);
      const school = schools.find((s: any) => s.id === targetSchoolId);
      downloadBackup(backup, `${school?.name || 'school'}_backup`);
      
      setToast({ type: 'success', message: 'Backup downloaded successfully' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Backup failed:', error);
      setToast({ type: 'error', message: 'Backup failed' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await uploadBackup(file);
      
      if (confirm('This will replace all existing data. Are you sure?')) {
        restoreSchoolData(backup);
        setToast({ type: 'success', message: 'Data restored successfully. Reloading...' });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      setToast({ type: 'error', message: 'Restore failed' });
      setTimeout(() => setToast(null), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = isMaster ? [
    { label: 'Total Schools', value: schools.length },
    { label: 'Total Houses', value: houses.length },
    { label: 'Total Students', value: students.length },
    { label: 'Total Wardens', value: wardens.length },
  ] : [
    { label: 'Total Houses', value: houses.length },
    { label: 'Total Wardens', value: wardens.length },
    { label: 'Total Students', value: students.length },
    { label: 'Attendance Records', value: attendance.length },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div><h1 className="text-2xl font-bold text-gray-800">Settings</h1><p className="text-gray-500 text-sm">System configuration</p></div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-indigo-600">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>)}
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Backup & Restore</h3>
        <div className="space-y-4">
          {isMaster && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select School</label>
              <select 
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">-- Select a School --</option>
                {schools.map((school: any) => (
                  <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleBackup}
              disabled={isMaster && !selectedSchoolId}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>
            
            <div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                onChange={handleRestore}
                className="hidden"
                id="restore-file"
              />
              <label 
                htmlFor="restore-file"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload & Restore
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Backup file contains complete school data including houses, wardens, students, and attendance. Restoring will replace existing data.
            </p>
          </div>
        </div>
      </div>

      {/* Master Admin - Change School Password */}
      {isMaster && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">School Admin Password Management</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <div>
                <p className="font-medium text-purple-800">Change School Admin Password</p>
                <p className="text-sm text-purple-600">Reset password for any school admin</p>
              </div>
              <span className="text-purple-600">→</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Data Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div><p className="font-medium text-yellow-800">Reset All Data</p><p className="text-sm text-yellow-600">Clear all data and reload with seed data</p></div>
            <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"><RefreshCw className="w-4 h-4" /> Reset</button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Change School Admin Password</h2>
              <button onClick={() => { setShowChangePassword(false); setNewPassword(''); setSelectedSchoolId(''); }} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select School *</label>
                <select 
                  value={selectedSchoolId}
                  onChange={e => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">-- Select School --</option>
                  {schools.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name} ({school.admin_username})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => { setShowChangePassword(false); setNewPassword(''); setSelectedSchoolId(''); }} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleChangePassword} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">Change Password</button>
            </div>
          </div>
        </div>
      )}

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
