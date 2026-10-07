import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Heart, Briefcase, Stethoscope, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

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
  const summary = morningSummary;
  const houseStudents = useMemo(() => students.filter((s: { house_id: string; status: string }) => s.house_id === houseId && s.status === 'Active'), [students, houseId]);
  const morningDone = morningSummary.present + morningSummary.absent + morningSummary.sick + morningSummary.od + morningSummary.staffWard > 0;
  const nightDone = nightSummary.present + nightSummary.absent + nightSummary.sick + nightSummary.od + nightSummary.staffWard > 0;
  const attendanceCompleted = morningDone && nightDone;
  const percentage = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : '0.0';

  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = attendance.filter((a: { house_id: string; attendance_date: string }) => a.house_id === houseId && a.attendance_date === dateStr);
      const present = dayRecords.filter((r: { status: string }) => r.status === 'Present').length;
      days.push({ date: d.toLocaleDateString('en', { weekday: 'short' }), '%': houseStudents.length > 0 ? parseFloat(((present / houseStudents.length) * 100).toFixed(1)) : 0 });
    }
    return days;
  }, [attendance, houseId, houseStudents]);

  const pieData = [
    { name: 'Present', value: summary.present }, { name: 'Absent', value: summary.absent },
    { name: 'Sick', value: summary.sick }, { name: 'OD', value: summary.od }, { name: 'Staff Ward', value: summary.staffWard },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Students', value: summary.total, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'Present', value: summary.present, icon: UserCheck, color: 'bg-green-50 text-green-700' },
    { label: 'Absent', value: summary.absent, icon: UserX, color: 'bg-red-50 text-red-700' },
    { label: 'Sick', value: summary.sick, icon: Heart, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'On Duty', value: summary.od, icon: Briefcase, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Staff Ward', value: summary.staffWard, icon: Stethoscope, color: 'bg-purple-50 text-purple-700' },
  ];

  if (!house) return <div className="text-center py-10 text-gray-500">No house assigned</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{house.house_name}</h1>
          <p className="text-gray-500 text-sm">Warden: {warden?.name || 'N/A'} | {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>☀️ Morning {morningDone ? '✓' : '⏳'}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>🌙 Night {nightDone ? '✓' : '⏳'}</span>
        </div>
          <button onClick={() => navigate('/warden/attendance')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Mark Attendance</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}><card.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">Today's Attendance</p>
            <p className="text-4xl font-bold mt-1">{percentage}%</p>
            <p className="text-indigo-200 text-sm mt-2"><TrendingUp className="w-4 h-4 inline mr-1" />{summary.present} of {summary.total} students present</p>
          </div>
          <div className="hidden sm:block"><div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center"><span className="text-2xl font-bold">{percentage}%</span></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Attendance']} />
                <Line type="monotone" dataKey="%" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Today's Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_: unknown, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h3 className="font-semibold text-gray-800">Today's Summary</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3 font-medium text-gray-600">Status</th><th className="text-center px-4 py-3 font-medium text-gray-600">Count</th><th className="text-center px-4 py-3 font-medium text-gray-600">%</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {[{ label: 'Present', count: summary.present, color: 'text-green-600' }, { label: 'Absent', count: summary.absent, color: 'text-red-600' }, { label: 'Sick', count: summary.sick, color: 'text-yellow-600' }, { label: 'OD', count: summary.od, color: 'text-blue-600' }, { label: 'Staff Ward', count: summary.staffWard, color: 'text-purple-600' }].map(row => (
              <tr key={row.label} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                <td className={`text-center px-4 py-3 font-bold ${row.color}`}>{row.count}</td>
                <td className="text-center px-4 py-3">{summary.total > 0 ? ((row.count / summary.total) * 100).toFixed(1) : '0.0'}%</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold"><td className="px-4 py-3">Total</td><td className="text-center px-4 py-3">{summary.total}</td><td className="text-center px-4 py-3">100%</td></tr>
            </tbody>
          </table>
        </div>

      {/* Morning vs Night Comparison */}
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
