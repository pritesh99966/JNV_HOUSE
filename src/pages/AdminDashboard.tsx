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
      const morningSummary = getAttendanceSummary(house.id, today, 'Morning');
      const nightSummary = getAttendanceSummary(house.id, today, 'Night');
      const warden = wardens.find((w: { assigned_house_id: string }) => w.assigned_house_id === house.id);
      const morningDone = morningSummary.present + morningSummary.absent + morningSummary.sick + morningSummary.od + morningSummary.staffWard > 0;
      const nightDone = nightSummary.present + nightSummary.absent + nightSummary.sick + nightSummary.od + nightSummary.staffWard > 0;
      const attendanceCompleted = morningDone && nightDone;
      const percentage = morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0';
      return { ...house, ...morningSummary, morningDone, nightDone, nightSummary, warden, attendanceCompleted, percentage };
    });
  }, [houses, attendance, students, today, wardens, getAttendanceSummary]);

  const totalStats = useMemo(() => {
    const totalStudents = students.filter((s: { status: string }) => s.status === 'Active').length;
    let morningPresent = 0, morningAbsent = 0;
    let nightPresent = 0, nightAbsent = 0;
    let totalPresent = 0, totalAbsent = 0, totalSick = 0, totalOd = 0, totalStaffWard = 0;
    
    houseSummaries.forEach((h: any) => {
      // Morning stats
      morningPresent += h.present;
      morningAbsent += h.absent;
      totalPresent += h.present;
      totalAbsent += h.absent;
      totalSick += h.sick;
      totalOd += h.od;
      totalStaffWard += h.staffWard;
      
      // Night stats
      nightPresent += h.nightSummary.present;
      nightAbsent += h.nightSummary.absent;
      totalPresent += h.nightSummary.present;
      totalAbsent += h.nightSummary.absent;
      totalSick += h.nightSummary.sick;
      totalOd += h.nightSummary.od;
      totalStaffWard += h.nightSummary.staffWard;
    });
    
    // Calculate overall percentage (average of morning and night)
    const morningPercentage = totalStudents > 0 ? ((morningPresent / totalStudents) * 100) : 0;
    const nightPercentage = totalStudents > 0 ? ((nightPresent / totalStudents) * 100) : 0;
    const attendancePercentage = ((morningPercentage + nightPercentage) / 2).toFixed(1);
    
    const completedHouses = houseSummaries.filter((h: { attendanceCompleted: boolean }) => h.attendanceCompleted).length;
    const morningCompleted = houseSummaries.filter((h: any) => h.morningDone).length;
    const nightCompleted = houseSummaries.filter((h: any) => h.nightDone).length;
    
    return { 
      totalStudents, 
      morningPresent, morningAbsent,
      nightPresent, nightAbsent,
      present: totalPresent, 
      absent: totalAbsent, 
      sick: totalSick, 
      od: totalOd, 
      staffWard: totalStaffWard, 
      attendancePercentage, 
      completedHouses, 
      morningCompleted,
      nightCompleted,
      totalHouses: houseSummaries.length 
    };
  }, [houseSummaries, students]);

  const barChartData = houseSummaries.map((h: any) => ({
    name: h.house_name.replace(' Sr Boys', '').replace(' Jr Boys', '').replace(' Girls', ''),
    'Morning Present': h.present,
    'Morning Absent': h.absent,
    'Night Present': h.nightSummary.present,
    'Night Absent': h.nightSummary.absent,
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
    { label: '☀️ Morning Present', value: totalStats.morningPresent, icon: UserCheck, lightColor: 'bg-orange-50 text-orange-700' },
    { label: '🌙 Night Present', value: totalStats.nightPresent, icon: UserCheck, lightColor: 'bg-indigo-50 text-indigo-700' },
    { label: 'Total Present', value: totalStats.present, icon: CheckCircle2, lightColor: 'bg-green-50 text-green-700' },
    { label: 'Total Absent', value: totalStats.absent, icon: UserX, lightColor: 'bg-red-50 text-red-700' },
    { label: 'Sick', value: totalStats.sick, icon: Heart, lightColor: 'bg-yellow-50 text-yellow-700' },
    { label: 'On Duty', value: totalStats.od, icon: Briefcase, lightColor: 'bg-purple-50 text-purple-700' },
    { label: 'Staff Ward', value: totalStats.staffWard, icon: Stethoscope, lightColor: 'bg-pink-50 text-pink-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of all houses - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
            <span>☀️</span>
            <span>Morning: {totalStats.morningCompleted}/{totalStats.totalHouses}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
            <span>🌙</span>
            <span>Night: {totalStats.nightCompleted}/{totalStats.totalHouses}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Both: {totalStats.completedHouses}/{totalStats.totalHouses}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
                <Bar dataKey="Morning Present" fill="#f97316" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Morning Absent" fill="#fca5a5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Night Present" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Night Absent" fill="#a5b4fc" radius={[2, 2, 0, 0]} />
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
                <th colSpan={2} className="text-center px-3 py-2 font-semibold text-orange-700 bg-orange-50 border-b border-orange-200">☀️ Morning</th>
                <th colSpan={2} className="text-center px-3 py-2 font-semibold text-indigo-700 bg-indigo-50 border-b border-indigo-200">🌙 Night</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">%</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Action</th>
              </tr>
              <tr className="bg-gray-50 border-b">
                <th></th>
                <th className="text-center px-3 py-2 text-xs font-medium text-green-700">Present</th>
                <th className="text-center px-3 py-2 text-xs font-medium text-red-700">Absent</th>
                <th className="text-center px-3 py-2 text-xs font-medium text-green-700">Present</th>
                <th className="text-center px-3 py-2 text-xs font-medium text-red-700">Absent</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseSummaries.map((house: any) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${house.attendanceCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="font-medium">{house.house_name}</span></div></td>
                  <td className="text-center px-3 py-3 text-green-600 font-medium bg-orange-50/30">{house.present}</td>
                  <td className="text-center px-3 py-3 text-red-600 font-medium bg-orange-50/30">{house.absent}</td>
                  <td className="text-center px-3 py-3 text-green-600 font-medium bg-indigo-50/30">{house.nightSummary.present}</td>
                  <td className="text-center px-3 py-3 text-red-600 font-medium bg-indigo-50/30">{house.nightSummary.absent}</td>
                  <td className="text-center px-3 py-3 font-bold">{house.total}</td>
                  <td className="text-center px-3 py-3 font-medium">{house.percentage}%</td>
                  <td className="text-center px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${house.morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>☀️ {house.morningDone ? '✓' : '⏳'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${house.nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>🌙 {house.nightDone ? '✓' : '⏳'}</span>
                    </div>
                  </td>
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
          {houseSummaries.map((house: any) => (
            <div key={house.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-800">{house.house_name.toUpperCase()}</h4>
                <span className={`w-3 h-3 rounded-full ${house.attendanceCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{house.total}</p>
              <p className="text-xs text-gray-500 mb-3">Total Students</p>
              
              {/* Morning Attendance */}
              <div className="mb-2 p-2 bg-orange-50 rounded-lg">
                <p className="text-xs font-semibold text-orange-700 mb-1">☀️ Morning</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">Present:</span><span className="font-medium text-green-600">{house.present}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Absent:</span><span className="font-medium text-red-600">{house.absent}</span></div>
                </div>
              </div>
              
              {/* Night Attendance */}
              <div className="mb-2 p-2 bg-indigo-50 rounded-lg">
                <p className="text-xs font-semibold text-indigo-700 mb-1">🌙 Night</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">Present:</span><span className="font-medium text-green-600">{house.nightSummary.present}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Absent:</span><span className="font-medium text-red-600">{house.nightSummary.absent}</span></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="flex justify-between"><span className="text-gray-500">Sick:</span><span className="font-medium text-yellow-600">{house.sick + house.nightSummary.sick}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">OD:</span><span className="font-medium text-blue-600">{house.od + house.nightSummary.od}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Staff Ward:</span><span className="font-medium text-purple-600">{house.staffWard + house.nightSummary.staffWard}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Attendance:</span><span className="font-medium">{house.percentage}%</span></div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${house.morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>☀️ Morning {house.morningDone ? '✓' : '⏳'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${house.nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>🌙 Night {house.nightDone ? '✓' : '⏳'}</span>
                </div>
                <p className="text-xs text-gray-500">Warden: <span className="font-medium text-gray-700">{house.warden?.name || 'Not Assigned'}</span></p>
              </div>
              <button onClick={() => navigate(`/admin/house/${house.id}`)} className="mt-3 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
