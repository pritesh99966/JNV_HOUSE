import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
          <button onClick={() => navigate('/warden/attendance', { state: { session: 'Morning' } })} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Mark Attendance</button>
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
          <button onClick={() => navigate('/warden/attendance', { state: { session: 'Morning' } })} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
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
          <button onClick={() => navigate('/warden/attendance', { state: { session: 'Night' } })} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Mark Night Attendance →
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">☀️</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Morning</span>
          </div>
          <p className="text-4xl font-bold">{morningSummary.present}</p>
          <p className="text-sm opacity-90 mt-1">Present</p>
          <p className="text-2xl font-bold mt-2">{morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0'}%</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🌙</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Night</span>
          </div>
          <p className="text-4xl font-bold">{nightSummary.present}</p>
          <p className="text-sm opacity-90 mt-1">Present</p>
          <p className="text-2xl font-bold mt-2">{nightSummary.total > 0 ? ((nightSummary.present / nightSummary.total) * 100).toFixed(1) : '0.0'}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Overall</span>
          </div>
          <p className="text-4xl font-bold">{morningSummary.present + nightSummary.present}</p>
          <p className="text-sm opacity-90 mt-1">Total Present</p>
          <p className="text-2xl font-bold mt-2">{((parseFloat(morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0') + parseFloat(nightSummary.total > 0 ? ((nightSummary.present / nightSummary.total) * 100).toFixed(1) : '0.0')) / 2).toFixed(1)}%</p>
        </div>
      </div>

      {/* Attendance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning Attendance Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ☀️ Morning Attendance Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Present', value: morningSummary.present },
                    { name: 'Absent', value: morningSummary.absent },
                    { name: 'Sick', value: morningSummary.sick },
                    { name: 'On Duty', value: morningSummary.od },
                    { name: 'Staff Ward', value: morningSummary.staffWard }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Night Attendance Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🌙 Night Attendance Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Present', value: nightSummary.present },
                    { name: 'Absent', value: nightSummary.absent },
                    { name: 'Sick', value: nightSummary.sick },
                    { name: 'On Duty', value: nightSummary.od },
                    { name: 'Staff Ward', value: nightSummary.staffWard }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
