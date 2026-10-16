import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, Home, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { houses, students, attendance, wardens, getAttendanceSummary } = useData();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const isMaster = user?.role === 'master';
  const isAdmin = user?.role === 'admin';

  const houseSummaries = useMemo(() => {
    if (isMaster) return [];
    return houses.filter((h: any) => h.status === 'Active').map((house: any) => {
      const morningSummary = getAttendanceSummary(house.id, today, 'Morning');
      const nightSummary = getAttendanceSummary(house.id, today, 'Night');
      const warden = wardens.find((w: any) => w.assigned_house_id === house.id);
      const morningDone = morningSummary.present + morningSummary.leave + morningSummary.sick + morningSummary.od + morningSummary.staffWard > 0;
      const nightDone = nightSummary.present + nightSummary.leave + nightSummary.sick + nightSummary.od + nightSummary.staffWard > 0;
      const percentage = morningSummary.total > 0 ? ((morningSummary.present / morningSummary.total) * 100).toFixed(1) : '0.0';
      return { ...house, ...morningSummary, morningDone, nightDone, nightSummary, warden, percentage };
    });
  }, [houses, attendance, students, today, wardens, getAttendanceSummary, isMaster]);

  const totalStats = useMemo(() => {
    if (isMaster) {
      return { totalStudents: students.length, totalHouses: houses.length, totalWardens: wardens.length };
    }
    const totalStudents = students.filter((s: any) => s.status === 'Active').length;
    let morningPresent = 0, nightPresent = 0;
    
    houseSummaries.forEach((h: any) => {
      morningPresent += h.present;
      nightPresent += h.nightSummary.present;
    });
    
    const attendancePercentage = totalStudents > 0 ? (((morningPresent + nightPresent) / (totalStudents * 2)) * 100).toFixed(1) : '0.0';
    
    return { 
      totalStudents, 
      morningPresent,
      nightPresent,
      attendancePercentage, 
      totalHouses: houses.length,
      totalWardens: wardens.length
    };
  }, [houseSummaries, students, houses, wardens, isMaster]);

  if (isMaster) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name} | Manage all schools</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3"><Home className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{totalStats.totalHouses}</p>
            <p className="text-xs text-gray-500 mt-1">Total Houses</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center mb-3"><Users className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{totalStats.totalStudents}</p>
            <p className="text-xs text-gray-500 mt-1">Total Students</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-3"><UserCheck className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{totalStats.totalWardens}</p>
            <p className="text-xs text-gray-500 mt-1">Total Wardens</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-purple-200 text-xs">Schools</p>
            <p className="text-3xl font-bold mt-1">2</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold text-gray-800">All Schools</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">School Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Kendriya Vidyalaya No. 1</td>
                  <td className="px-4 py-3 text-gray-600">KV001</td>
                  <td className="px-4 py-3 text-gray-600">Rajesh Kumar</td>
                  <td className="text-center px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Kendriya Vidyalaya No. 2</td>
                  <td className="px-4 py-3 text-gray-600">KV002</td>
                  <td className="px-4 py-3 text-gray-600">Suresh Patel</td>
                  <td className="text-center px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Admin' : 'Warden'} Dashboard</h1>
          <p className="text-gray-500 text-sm">{user?.school_name} - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3"><Users className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{totalStats.totalStudents}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-3"><UserCheck className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{totalStats.morningPresent}</p>
          <p className="text-xs text-gray-500 mt-1">☀️ Morning Present</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3"><UserCheck className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-gray-800">{totalStats.nightPresent}</p>
          <p className="text-xs text-gray-500 mt-1">🌙 Night Present</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-indigo-200 text-xs">Overall Attendance</p>
          <p className="text-3xl font-bold mt-1">{totalStats.attendancePercentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h3 className="font-semibold text-gray-800">House-wise Attendance Status</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">House</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">☀️ Morning</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">🌙 Night</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseSummaries.map((house: any) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${house.morningDone && house.nightDone ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="font-medium">{house.house_name}</span></div></td>
                  <td className="text-center px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${house.morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{house.present} Present</span></td>
                  <td className="text-center px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${house.nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>{house.nightSummary.present} Present</span></td>
                  <td className="text-center px-3 py-3 font-bold">{house.total}</td>
                  <td className="text-center px-3 py-3 font-medium">{house.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
