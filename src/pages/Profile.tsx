import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Save, Lock } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { houses, wardens } = useData();
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const warden = wardens.find((w: { id: string }) => w.id === user?.id);
  const house = houses.find((h: { id: string }) => h.id === warden?.assigned_house_id);

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) { setToast({ type: 'error', message: 'Fill all fields' }); setTimeout(() => setToast(null), 3000); return; }
    if (newPassword !== confirmPassword) { setToast({ type: 'error', message: 'Passwords do not match' }); setTimeout(() => setToast(null), 3000); return; }
    if (warden && oldPassword === warden.password) {
      const wardensData = JSON.parse(localStorage.getItem('hms_wardens') || '[]');
      const updated = wardensData.map((w: { id: string; password: string }) => w.id === warden.id ? { ...w, password: newPassword } : w);
      localStorage.setItem('hms_wardens', JSON.stringify(updated));
      setToast({ type: 'success', message: 'Password changed' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } else { setToast({ type: 'error', message: 'Current password incorrect' }); }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>}
      <div><h1 className="text-2xl font-bold text-gray-800">My Profile</h1><p className="text-gray-500 text-sm">View and manage your profile</p></div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">{user?.name?.charAt(0) || 'A'}</div>
          <div><h2 className="text-xl font-bold text-gray-800">{user?.name}</h2><p className="text-gray-500">@{user?.username}</p><p className="text-sm text-indigo-600 font-medium capitalize">{user?.role}</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">Name</p><p className="font-medium">{warden?.name || user?.name}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">Username</p><p className="font-medium">{user?.username}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">Email</p><p className="font-medium">{warden?.email || user?.email || 'N/A'}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">Mobile</p><p className="font-medium">{warden?.mobile || 'N/A'}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">House</p><p className="font-medium text-indigo-600">{house?.house_name || 'N/A'}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-1">Status</p><p className="font-medium text-green-600">{warden?.status || 'Active'}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-600" /> Change Password</h3>
        <div className="max-w-md space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <button onClick={handleChangePassword} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Save className="w-4 h-4" /> Change Password</button>
        </div>
      </div>
    </div>
  );
}
