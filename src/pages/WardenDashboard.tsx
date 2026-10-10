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

      {/* Total Students Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{morningSummary.total}</p>
            <p className="text-sm text-gray-500">Total Students in {house.house_name}</p>
          </div>
        </div>
      </div>

      {/* Morning Attendance Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">☀️</span> Morning Attendance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-green-600">{morningSummary.present}</p>
            <p className="text-xs text-gray-600 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-red-600">{morningSummary.absent}</p>
            <p className="text-xs text-gray-600 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">{morningSummary.sick}</p>
            <p className="text-xs text-gray-600 mt-1">Sick</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{morningSummary.od}</p>
            <p className="text-xs text-gray-600 mt-1">On Duty</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{morningSummary.staffWard}</p>
            <p className="text-xs text-gray-600 mt-1">Staff Ward</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg p-4 text-white shadow-sm">
            <p className="text-3xl font-bold">{morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0'}%</p>
            <p className="text-xs mt-1">Attendance</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {morningDone ? '✓ Completed' : '⏳ Pending'}
          </span>
          <button onClick={() => navigate('/warden/attendance')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Mark Morning Attendance →
          </button>
        </div>
      </div>

      {/* Night Attendance Overview */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🌙</span> Night Attendance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-green-600">{nightSummary.present}</p>
            <p className="text-xs text-gray-600 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-red-600">{nightSummary.absent}</p>
            <p className="text-xs text-gray-600 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">{nightSummary.sick}</p>
            <p className="text-xs text-gray-600 mt-1">Sick</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{nightSummary.od}</p>
            <p className="text-xs text-gray-600 mt-1">On Duty</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{nightSummary.staffWard}</p>
            <p className="text-xs text-gray-600 mt-1">Staff Ward</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-4 text-white shadow-sm">
            <p className="text-3xl font-bold">{nightSummary.total > 0 ? ((nightSummary.present / nightSummary.total) * 100).toFixed(1) : '0.0'}%</p>
            <p className="text-xs mt-1">Attendance</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${nightDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {nightDone ? '✓ Completed' : '⏳ Pending'}
          </span>
          <button onClick={() => navigate('/warden/attendance')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Mark Night Attendance →
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📊 Overall Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-2xl font-bold text-orange-700">{morningSummary.present}</p>
            <p className="text-xs text-gray-600 mt-1">☀️ Morning Present</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <p className="text-2xl font-bold text-indigo-700">{nightSummary.present}</p>
            <p className="text-xs text-gray-600 mt-1">🌙 Night Present</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-2xl font-bold text-red-700">{morningSummary.absent + nightSummary.absent}</p>
            <p className="text-xs text-gray-600 mt-1">Total Absent</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-700">{morningSummary.sick + nightSummary.sick}</p>
            <p className="text-xs text-gray-600 mt-1">Total Sick</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-2xl font-bold text-blue-700">{morningSummary.od + nightSummary.od}</p>
            <p className="text-xs text-gray-600 mt-1">Total On Duty</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-2xl font-bold text-purple-700">{morningSummary.staffWard + nightSummary.staffWard}</p>
            <p className="text-xs text-gray-600 mt-1">Total Staff Ward</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg p-3 text-white">
            <p className="text-2xl font-bold">{morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0'}%</p>
            <p className="text-xs mt-1">☀️ Morning %</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-3 text-white">
            <p className="text-2xl font-bold">{nightSummary.total > 0 ? ((nightSummary.present / nightSummary.total) * 100).toFixed(1) : '0.0'}%</p>
            <p className="text-xs mt-1">🌙 Night %</p>
          </div>
        </div>
      </div>
    </div>
  );
}
