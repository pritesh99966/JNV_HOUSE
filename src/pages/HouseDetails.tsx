import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, UserCheck, UserX } from 'lucide-react';

export default function HouseDetails() {
  const { id } = useParams<{ id: string }>();
  const { houses, students, attendance } = useData();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const house = houses.find((h: any) => h.id === id);
  const houseStudents = useMemo(() => 
    students.filter((s: any) => s.house_id === id && s.status === 'Active'),
    [students, id]
  );

  const morningAttendance = useMemo(() => 
    attendance.filter((a: any) => a.house_id === id && a.attendance_date === selectedDate && a.session === 'Morning'),
    [attendance, id, selectedDate]
  );

  const nightAttendance = useMemo(() => 
    attendance.filter((a: any) => a.house_id === id && a.attendance_date === selectedDate && a.session === 'Night'),
    [attendance, id, selectedDate]
  );

  const getStudentStatus = (studentId: string, session: 'Morning' | 'Night') => {
    const records = session === 'Morning' ? morningAttendance : nightAttendance;
    const record = records.find((r: any) => r.student_id === studentId);
    return record?.status || 'Not Marked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      case 'Sick': return 'bg-yellow-100 text-yellow-700';
      case 'OD': return 'bg-blue-100 text-blue-700';
      case 'Staff Ward': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getChangeIcon = (morningStatus: string, nightStatus: string) => {
    if (morningStatus === 'Present' && nightStatus === 'Absent') {
      return <div title="Present → Absent"><ArrowRight className="w-4 h-4 text-red-500" /></div>;
    }
    if (morningStatus === 'Absent' && nightStatus === 'Present') {
      return <div title="Absent → Present"><ArrowLeft className="w-4 h-4 text-green-500" /></div>;
    }
    if (morningStatus === nightStatus) {
      return <span className="text-gray-400">—</span>;
    }
    return <span className="text-gray-400">~</span>;
  };

  const morningStats = useMemo(() => ({
    present: morningAttendance.filter((a: any) => a.status === 'Present').length,
    absent: morningAttendance.filter((a: any) => a.status === 'Absent').length,
    sick: morningAttendance.filter((a: any) => a.status === 'Sick').length,
    od: morningAttendance.filter((a: any) => a.status === 'OD').length,
    staffWard: morningAttendance.filter((a: any) => a.status === 'Staff Ward').length,
  }), [morningAttendance]);

  const nightStats = useMemo(() => ({
    present: nightAttendance.filter((a: any) => a.status === 'Present').length,
    absent: nightAttendance.filter((a: any) => a.status === 'Absent').length,
    sick: nightAttendance.filter((a: any) => a.status === 'Sick').length,
    od: nightAttendance.filter((a: any) => a.status === 'OD').length,
    staffWard: nightAttendance.filter((a: any) => a.status === 'Staff Ward').length,
  }), [nightAttendance]);

  const changes = useMemo(() => {
    const changesList: any[] = [];
    houseStudents.forEach((student: any) => {
      const morningStatus = getStudentStatus(student.id, 'Morning');
      const nightStatus = getStudentStatus(student.id, 'Night');
      
      if (morningStatus !== nightStatus) {
        changesList.push({
          student,
          morningStatus,
          nightStatus,
          change: `${morningStatus} → ${nightStatus}`
        });
      }
    });
    return changesList;
  }, [houseStudents, morningAttendance, nightAttendance]);

  if (!house) {
    return <div className="text-center py-10 text-gray-500">House not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{house.house_name}</h1>
          <p className="text-gray-500 text-sm">Morning vs Night Attendance Comparison</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Summary */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
            ☀️ Morning Attendance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{morningStats.present}</p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{morningStats.absent}</p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{morningStats.sick}</p>
              <p className="text-xs text-gray-600">Sick</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{morningStats.od}</p>
              <p className="text-xs text-gray-600">OD</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{morningStats.staffWard}</p>
              <p className="text-xs text-gray-600">Staff Ward</p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg p-3 text-white text-center">
              <p className="text-2xl font-bold">{houseStudents.length > 0 ? ((morningStats.present / houseStudents.length) * 100).toFixed(1) : 0}%</p>
              <p className="text-xs">Attendance</p>
            </div>
          </div>
        </div>

        {/* Night Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            🌙 Night Attendance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{nightStats.present}</p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{nightStats.absent}</p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{nightStats.sick}</p>
              <p className="text-xs text-gray-600">Sick</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{nightStats.od}</p>
              <p className="text-xs text-gray-600">OD</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{nightStats.staffWard}</p>
              <p className="text-xs text-gray-600">Staff Ward</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-3 text-white text-center">
              <p className="text-2xl font-bold">{houseStudents.length > 0 ? ((nightStats.present / houseStudents.length) * 100).toFixed(1) : 0}%</p>
              <p className="text-xs">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      {changes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            📊 Changes Between Morning & Night ({changes.length} students)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Present → Absent</p>
              <p className="text-xl font-bold text-red-600">
                {changes.filter(c => c.morningStatus === 'Present' && c.nightStatus === 'Absent').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Absent → Present</p>
              <p className="text-xl font-bold text-green-600">
                {changes.filter(c => c.morningStatus === 'Absent' && c.nightStatus === 'Present').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Other Changes</p>
              <p className="text-xl font-bold text-blue-600">
                {changes.filter(c => !((c.morningStatus === 'Present' && c.nightStatus === 'Absent') || (c.morningStatus === 'Absent' && c.nightStatus === 'Present'))).length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">No Change</p>
              <p className="text-xl font-bold text-gray-600">
                {houseStudents.length - changes.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student-wise Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Student-wise Attendance Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sr</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-center px-4 py-3 font-medium text-orange-700 bg-orange-50">☀️ Morning</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Change</th>
                <th className="text-center px-4 py-3 font-medium text-indigo-700 bg-indigo-50">🌙 Night</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseStudents.map((student: any) => {
                const morningStatus = getStudentStatus(student.id, 'Morning');
                const nightStatus = getStudentStatus(student.id, 'Night');
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">{student.sr_no}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {student.student_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{student.student_name}</span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3 bg-orange-50/30">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(morningStatus)}`}>
                        {morningStatus}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      {getChangeIcon(morningStatus, nightStatus)}
                    </td>
                    <td className="text-center px-4 py-3 bg-indigo-50/30">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(nightStatus)}`}>
                        {nightStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Changes Detail List */}
      {changes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">Detailed Changes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-center px-4 py-3 font-medium text-orange-700">Morning</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">→</th>
                  <th className="text-center px-4 py-3 font-medium text-indigo-700">Night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changes.map((change, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {change.student.photo_url ? (
                          <img src={change.student.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {change.student.student_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{change.student.student_name}</span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(change.morningStatus)}`}>
                        {change.morningStatus}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 text-gray-400">→</td>
                    <td className="text-center px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(change.nightStatus)}`}>
                        {change.nightStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
