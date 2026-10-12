import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { downloadBackup, uploadBackup, restoreSchoolData } from '../utils/schoolManagement';
import { Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { schools, students, attendance, wardens, houses } = useData();
  const { user } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMaster = user?.role === 'master';
  const schoolId = user?.school_id || '';

  const stats = isMaster ? [
    { label: 'Total Schools', value: schools.length },
    { label: 'Total Houses', value: houses.length },
    { label: 'Total Students', value: students.length },
    { label: 'Total Wardens', value: wardens.length },
  ] : [
    { label: 'Total Houses', value: houses.filter((h: any) => !schoolId || h.school_id === schoolId).length },
    { label: 'Total Wardens', value: wardens.filter((w: any) => !schoolId || w.school_id === schoolId).length },
    { label: 'Total Students', value: students.filter((s: any) => !schoolId || s.school_id === schoolId).length },
    { label: 'Attendance Records', value: attendance.filter((a: any) => !schoolId || a.school_id === schoolId).length },
  ];

  const handleBackup = () => {
    try {
      const targetSchoolId = isMaster ? selectedSchool : schoolId;
      if (!targetSchoolId) {
        setToast({ type: 'error', message: 'Please select a school' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      const school = schools.find((s: any) => s.id === targetSchoolId);
      if (!school) {
        setToast({ type: 'error', message: 'School not found' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      downloadBackup(targetSchoolId, school.name);
      setToast({ type: 'success', message: `Backup downloaded for ${school.name}` });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Backup failed:', error);
      setToast({ type: 'error', message: 'Backup failed. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await uploadBackup(file);
      setPendingBackup(backup);
      setShowRestoreConfirm(true);
    } catch (error) {
      console.error('Restore failed:', error);
      setToast({ type: 'error', message: 'Invalid backup file' });
      setTimeout(() => setToast(null), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = () => {
    try {
      if (!pendingBackup) {
        setToast({ type: 'error', message: 'No backup data' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      restoreSchoolData(pendingBackup);
      setToast({ type: 'success', message: 'Data restored successfully! Reloading...' });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Restore failed:', error);
      setToast({ type: 'error', message: 'Restore failed. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    }
    setShowRestoreConfirm(false);
    setPendingBackup(null);
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
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

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">System configuration and data management</p>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Backup & Restore</h3>
        <div className="space-y-4">
          {/* School Selection for Master */}
          {isMaster && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select School</label>
              <select 
                value={selectedSchool}
                onChange={e => setSelectedSchool(e.target.value)}
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
            {/* Backup Button */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Backup Data</p>
                  <p className="text-sm text-green-600 mb-3">
                    {isMaster 
                      ? 'Download complete backup of selected school data'
                      : 'Download complete backup of your school data'}
                  </p>
                  <button 
                    onClick={handleBackup}
                    disabled={isMaster && !selectedSchool}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Download Backup
                  </button>
                </div>
              </div>
            </div>

            {/* Restore Button */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Upload className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Restore Data</p>
                  <p className="text-sm text-blue-600 mb-3">
                    Restore school data from backup file
                  </p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button 
                    onClick={handleRestoreClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload & Restore
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Important:</strong> Backup file contains complete school data including houses, wardens, students, attendance, and activity logs. Restoring will replace existing data for that school.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      {isMaster && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Data Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-800">Reset All Data</p>
                <p className="text-sm text-yellow-600">Clear all data and reload with seed data</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-800">Clear Old Attendance</p>
                <p className="text-sm text-blue-600">Remove attendance records older than 7 days to free storage</p>
              </div>
              <button onClick={() => { 
                const att = JSON.parse(localStorage.getItem('hms_attendance') || '[]');
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const cutoff = sevenDaysAgo.toISOString().split('T')[0];
                const filtered = att.filter((a: any) => a.attendance_date >= cutoff);
                localStorage.setItem('hms_attendance', JSON.stringify(filtered));
                setToast({ type: 'success', message: `Cleared ${att.length - filtered.length} old records` });
                setTimeout(() => setToast(null), 3000);
              }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <RefreshCw className="w-4 h-4" /> Clear Old
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Storage Used</p>
                <p className="text-sm text-gray-600">Approximate localStorage usage</p>
              </div>
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
      )}

      {/* Login Credentials */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Login Credentials</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Username</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Password</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isMaster && (
                <>
                  <tr>
                    <td className="px-4 py-2">Master Admin</td>
                    <td className="px-4 py-2 font-mono">master</td>
                    <td className="px-4 py-2 font-mono">master123</td>
                  </tr>
                  {schools.map((school: any) => (
                    <tr key={school.id}>
                      <td className="px-4 py-2">School Admin - {school.name}</td>
                      <td className="px-4 py-2 font-mono">{school.admin_username}</td>
                      <td className="px-4 py-2 font-mono">{school.admin_password}</td>
                    </tr>
                  ))}
                </>
              )}
              {!isMaster && wardens.filter((w: any) => !schoolId || w.school_id === schoolId).map((w: any) => (
                <tr key={w.id}>
                  <td className="px-4 py-2">Warden</td>
                  <td className="px-4 py-2 font-mono">{w.username}</td>
                  <td className="px-4 py-2 font-mono">{w.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Reset All Data?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">This will delete all data and restore defaults.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleResetData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation */}
      {showRestoreConfirm && pendingBackup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold">Restore Data?</h3>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>School:</strong> {pendingBackup.school?.name || 'Unknown'}<br/>
                <strong>Backup Date:</strong> {new Date(pendingBackup.timestamp).toLocaleString()}<br/>
                <strong>Students:</strong> {pendingBackup.students?.length || 0}<br/>
                <strong>Wardens:</strong> {pendingBackup.wardens?.length || 0}<br/>
                <strong>Houses:</strong> {pendingBackup.houses?.length || 0}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will replace all existing data for this school. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRestoreConfirm(false); setPendingBackup(null); }} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleRestore} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Restore Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
