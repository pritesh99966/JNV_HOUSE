import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, CheckCircle2, Clock } from 'lucide-react';

export default function WardenDashboard() {
  const { user } = useAuth();
  const { houses, students, attendance, wardens, getAttendanceSummary } = useData();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const houseId = user?.assigned_house_id || '';
  const house = houses.find((h: { id: string }) => h.id === houseId);
  const warden = wardens.find((w: { id: string }) => w.id === user?.id);
  const morningSummary = useMemo(() => getAttendanceSummary(houseId, today, 'Morning'), [houseId, today, attendance, students, getAttendanceSummary]);
  const nightSummary = useMemo(() => getAttendanceSummary(houseId, today, 'Night'), [houseId, today, attendance, students, getAttendanceSummary]);
  const morningDone = morningSummary.present + morningSummary.absent + morningSummary.sick + morningSummary.od + morningSummary.staffWard > 0;
  const nightDone = nightSummary.present + nightSummary.absent + nightSummary.sick + nightSummary.od + nightSummary.staffWard > 0;
  const percentage = morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0';

  if (!house) return <div className="text-center py-10 text-gray-500">No house assigned</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{house.house_name}</h1>
          <p className="text-gray-500 text-sm">Warden: {warden?.name || 'N/A'} | {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>☀️ Morning {morningDone ? '✓' : '⏳'}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>🌙 Night {nightDone ? '✓' : '⏳'}</span>
          <button onClick={() => navigate('/warden/attendance')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Mark Attendance</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3"><Users className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{morningSummary.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-3"><UserCheck className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{morningSummary.present}</p>
          <p className="text-xs text-gray-500 mt-1">☀️ Morning Present</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3"><UserCheck className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{nightSummary.present}</p>
          <p className="text-xs text-gray-500 mt-1">🌙 Night Present</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mb-3"><UserX className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{morningSummary.absent + nightSummary.absent}</p>
          <p className="text-xs text-gray-500 mt-1">Total Absent</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-700 flex items-center justify-center mb-3"><UserX className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{morningSummary.sick + nightSummary.sick}</p>
          <p className="text-xs text-gray-500 mt-1">Total Sick</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-indigo-200 text-xs">Attendance</p>
          <p className="text-3xl font-bold mt-1">{percentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">☀️ Morning Attendance</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-green-600">{morningSummary.present}</p><p className="text-xs text-gray-500">Present</p></div>
            <div><p className="text-2xl font-bold text-red-600">{morningSummary.absent}</p><p className="text-xs text-gray-500">Absent</p></div>
            <div><p className="text-2xl font-bold text-yellow-600">{morningSummary.sick + morningSummary.od + morningSummary.staffWard}</p><p className="text-xs text-gray-500">Other</p></div>
          </div>
          <div className="mt-3 text-center">
            <span className={`text-sm font-medium ${morningDone ? 'text-green-600' : 'text-yellow-600'}`}>{morningDone ? '✓ Completed' : '⏳ Pending'}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">🌙 Night Attendance</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-green-600">{nightSummary.present}</p><p className="text-xs text-gray-500">Present</p></div>
            <div><p className="text-2xl font-bold text-red-600">{nightSummary.absent}</p><p className="text-xs text-gray-500">Absent</p></div>
            <div><p className="text-2xl font-bold text-yellow-600">{nightSummary.sick + nightSummary.od + nightSummary.staffWard}</p><p className="text-xs text-gray-500">Other</p></div>
          </div>
          <div className="mt-3 text-center">
            <span className={`text-sm font-medium ${nightDone ? 'text-indigo-600' : 'text-gray-500'}`}>{nightDone ? '✓ Completed' : '⏳ Pending'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
