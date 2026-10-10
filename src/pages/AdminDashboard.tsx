import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, CheckCircle2, Clock } from 'lucide-react';

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
    let morningPresent = 0, morningAbsent = 0, morningSick = 0, morningOD = 0, morningStaffWard = 0;
    let nightPresent = 0, nightAbsent = 0, nightSick = 0, nightOD = 0, nightStaffWard = 0;
    
    houseSummaries.forEach((h: any) => {
      // Morning stats
      morningPresent += h.present;
      morningAbsent += h.absent;
      morningSick += h.sick;
      morningOD += h.od;
      morningStaffWard += h.staffWard;
      
      // Night stats
      nightPresent += h.nightSummary.present;
      nightAbsent += h.nightSummary.absent;
      nightSick += h.nightSummary.sick;
      nightOD += h.nightSummary.od;
      nightStaffWard += h.nightSummary.staffWard;
    });
    
    const totalPresent = morningPresent + nightPresent;
    const overallMorningAttendance = totalStudents > 0 ? ((morningPresent / totalStudents) * 100).toFixed(1) : '0.0';
    const overallNightAttendance = totalStudents > 0 ? ((nightPresent / totalStudents) * 100).toFixed(1) : '0.0';
    const attendancePercentage = totalStudents > 0 ? ((totalPresent / (totalStudents * 2)) * 100).toFixed(1) : '0.0';
    const completedHouses = houseSummaries.filter((h: { attendanceCompleted: boolean }) => h.attendanceCompleted).length;
    
    return { 
      totalStudents, 
      morningPresent, morningAbsent, morningSick, morningOD, morningStaffWard,
      nightPresent, nightAbsent, nightSick, nightOD, nightStaffWard,
      overallMorningAttendance, overallNightAttendance, attendancePercentage, 
      completedHouses, totalHouses: houseSummaries.length 
    };
  }, [houseSummaries, students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of all houses - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
            <span>☀️</span><span>Morning: {houseSummaries.filter((h: any) => h.morningDone).length}/{totalStats.totalHouses}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
            <span>🌙</span><span>Night: {houseSummaries.filter((h: any) => h.nightDone).length}/{totalStats.totalHouses}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4" /><span>Both: {totalStats.completedHouses}/{totalStats.totalHouses}</span>
          </div>
        </div>
      </div>

      {/* Morning Attendance Cards */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
        <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
          <span>☀️</span> Morning Attendance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{totalStats.morningPresent}</p>
            <p className="text-xs text-gray-600 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{totalStats.morningAbsent}</p>
            <p className="text-xs text-gray-600 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{totalStats.morningSick}</p>
            <p className="text-xs text-gray-600 mt-1">Sick</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{totalStats.morningOD}</p>
            <p className="text-xs text-gray-600 mt-1">On Duty</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{totalStats.morningStaffWard}</p>
            <p className="text-xs text-gray-600 mt-1">Staff Ward</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg p-3 text-white">
            <p className="text-2xl font-bold">{totalStats.overallMorningAttendance}%</p>
            <p className="text-xs mt-1">Attendance</p>
          </div>
        </div>
      </div>

      {/* Night Attendance Cards */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
          <span>🌙</span> Night Attendance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{totalStats.nightPresent}</p>
            <p className="text-xs text-gray-600 mt-1">Present</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{totalStats.nightAbsent}</p>
            <p className="text-xs text-gray-600 mt-1">Absent</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{totalStats.nightSick}</p>
            <p className="text-xs text-gray-600 mt-1">Sick</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{totalStats.nightOD}</p>
            <p className="text-xs text-gray-600 mt-1">On Duty</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{totalStats.nightStaffWard}</p>
            <p className="text-xs text-gray-600 mt-1">Staff Ward</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-3 text-white">
            <p className="text-2xl font-bold">{totalStats.overallNightAttendance}%</p>
            <p className="text-xs mt-1">Attendance</p>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
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
                <th className="text-center px-3 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseSummaries.map((house: any) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${house.attendanceCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="font-medium">{house.house_name}</span></div></td>
                  <td className="text-center px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${house.morningDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{house.present} Present</span></td>
                  <td className="text-center px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${house.nightDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>{house.nightSummary.present} Present</span></td>
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
    </div>
  );
}
