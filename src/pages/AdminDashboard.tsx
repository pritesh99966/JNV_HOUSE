import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Heart, Briefcase, Stethoscope, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
  const { houses, students, attendance, wardens, getAttendanceSummary } = useData();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const houseSummaries = useMemo(() => {
    return houses.filter((h: { status: string }) => h.status === 'Active').map((house: { id: string; house_name: string }) => {
      const summary = getAttendanceSummary(house.id, today);
      const warden = wardens.find((w: { assigned_house_id: string }) => w.assigned_house_id === house.id);
      const attendanceCompleted = summary.present + summary.absent + summary.sick + summary.od + summary.staffWard > 0;
      const percentage = summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(1) : '0.0';
      return { ...house, ...summary, warden, attendanceCompleted, percentage };
    });
  }, [houses, attendance, students, today, wardens, getAttendanceSummary]);

  const totalStats = useMemo(() => {
    const totalStudents = students.filter((s: { status: string }) => s.status === 'Active').length;
    let present = 0, absent = 0, sick = 0, od = 0, staffWard = 0;
    houseSummaries.forEach((h: { present: number; absent: number; sick: number; od: number; staffWard: number }) => {
      present += h.present; absent += h.absent; sick += h.sick; od += h.od; staffWard += h.staffWard;
    });
    const attendancePercentage = totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : '0.0';
    const completedHouses = houseSummaries.filter((h: { attendanceCompleted: boolean }) => h.attendanceCompleted).length;
    return { totalStudents, present, absent, sick, od, staffWard, attendancePercentage, completedHouses, totalHouses: houseSummaries.length };
  }, [houseSummaries, students]);

  const barChartData = houseSummaries.map((h: { house_name: string; present: number; absent: number; sick: number; od: number; staffWard: number }) => ({
    name: h.house_name.replace(' Sr Boys', '').replace(' Jr Boys', '').replace(' Girls', ''),
    Present: h.present, Absent: h.absent, Sick: h.sick, OD: h.od, 'Staff Ward': h.staffWard,
  }));

  const pieData = [
    { name: 'Present', value: totalStats.present }, { name: 'Absent', value: totalStats.absent },
    { name: 'Sick', value: totalStats.sick }, { name: 'OD', value: totalStats.od }, { name: 'Staff Ward', value: totalStats.staffWard },
  ].filter(d => d.value > 0);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let present = 0;
      attendance.forEach((a: { attendance_date: string; status: string }) => { if (a.attendance_date === dateStr && a.status === 'Present') present++; });
      const totalActive = students.filter((s: { status: string }) => s.status === 'Active').length;
      days.push({ date: d.toLocaleDateString('en', { weekday: 'short' }), 'Attendance %': totalActive > 0 ? parseFloat(((present / totalActive) * 100).toFixed(1)) : 0 });
    }
    return days;
  }, [attendance, students]);

  const statCards = [
    { label: 'Total Students', value: totalStats.totalStudents, icon: Users, lightColor: 'bg-blue-50 text-blue-700' },
    { label: 'Present', value: totalStats.present, icon: UserCheck, lightColor: 'bg-green-50 text-green-700' },
    { label: 'Absent', value: totalStats.absent, icon: UserX, lightColor: 'bg-red-50 text-red-700' },
    { label: 'Sick', value: totalStats.sick, icon: Heart, lightColor: 'bg-yellow-50 text-yellow-700' },
    { label: 'On Duty', value: totalStats.od, icon: Briefcase, lightColor: 'bg-indigo-50 text-indigo-700' },
    { label: 'Staff Ward', value: totalStats.staffWard, icon: Stethoscope, lightColor: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of all houses - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm"><CheckCircle2 className="w-4 h-4" /><span>{totalStats.completedHouses}/{totalStats.totalHouses} Completed</span></div>
          {totalStats.completedHouses < totalStats.totalHouses && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm"><AlertTriangle className="w-4 h-4" /><span>{totalStats.totalHouses - totalStats.completedHouses} Pending</span></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg ${card.lightColor} flex items-center justify-center mb-3`}><card.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">Overall Attendance Percentage</p>
            <p className="text-4xl font-bold mt-1">{totalStats.attendancePercentage}%</p>
            <p className="text-indigo-200 text-sm mt-2"><TrendingUp className="w-4 h-4 inline mr-1" />Today's attendance across all houses</p>
          </div>
          <div className="hidden sm:block"><div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center"><span className="text-2xl font-bold">{totalStats.attendancePercentage}%</span></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">House-wise Attendance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Present" fill="#10b981" radius={[2, 2, 0, 0]} /><Bar dataKey="Absent" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Sick" fill="#f59e0b" radius={[2, 2, 0, 0]} /><Bar dataKey="OD" fill="#3b82f6" radius={[2, 2, 0, 0]} /><Bar dataKey="Staff Ward" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Attendance Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_: unknown, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Daily Attendance Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Attendance']} />
              <Line type="monotone" dataKey="Attendance %" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h3 className="font-semibold text-gray-800">House-wise Attendance Status</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">House</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Present</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Absent</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Sick</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">OD</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">SW</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">%</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseSummaries.map((house: { id: string; house_name: string; present: number; absent: number; sick: number; od: number; staffWard: number; total: number; percentage: string; attendanceCompleted: boolean; warden?: { name: string } }) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${house.attendanceCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="font-medium">{house.house_name}</span></div></td>
                  <td className="text-center px-3 py-3 text-green-600 font-medium">{house.present}</td>
                  <td className="text-center px-3 py-3 text-red-600 font-medium">{house.absent}</td>
                  <td className="text-center px-3 py-3 text-yellow-600 font-medium">{house.sick}</td>
                  <td className="text-center px-3 py-3 text-blue-600 font-medium">{house.od}</td>
                  <td className="text-center px-3 py-3 text-purple-600 font-medium">{house.staffWard}</td>
                  <td className="text-center px-3 py-3 font-bold">{house.total}</td>
                  <td className="text-center px-3 py-3 font-medium">{house.percentage}%</td>
                  <td className="text-center px-3 py-3">{house.attendanceCompleted ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"><CheckCircle2 className="w-3 h-3" /> Done</span> : <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>}</td>
                  <td className="text-center px-3 py-3"><button onClick={() => navigate(`/admin/house/${house.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">House Overview Cards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {houseSummaries.map((house: { id: string; house_name: string; present: number; absent: number; sick: number; od: number; staffWard: number; total: number; percentage: string; attendanceCompleted: boolean; warden?: { name: string } }) => (
            <div key={house.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-800">{house.house_name.toUpperCase()}</h4>
                <span className={`w-3 h-3 rounded-full ${house.attendanceCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{house.total}</p>
              <p className="text-xs text-gray-500 mb-3">Total Students</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Present:</span><span className="font-medium text-green-600">{house.present}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Absent:</span><span className="font-medium text-red-600">{house.absent}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sick:</span><span className="font-medium text-yellow-600">{house.sick}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">OD:</span><span className="font-medium text-blue-600">{house.od}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Staff Ward:</span><span className="font-medium text-purple-600">{house.staffWard}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Attendance:</span><span className="font-medium">{house.percentage}%</span></div>
              </div>
              <div className="mt-3 pt-3 border-t"><p className="text-xs text-gray-500">Warden: <span className="font-medium text-gray-700">{house.warden?.name || 'Not Assigned'}</span></p></div>
              <button onClick={() => navigate(`/admin/house/${house.id}`)} className="mt-3 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
