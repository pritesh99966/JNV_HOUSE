import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AttendanceHistory() {
  const { user } = useAuth();
  const { houses, students, attendance, wardens } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterHouse, setFilterHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [search, setSearch] = useState('');

  const filteredRecords = useMemo(() => {
    return attendance.filter((a: { house_id: string; attendance_date: string; status: string; student_id: string; session: string }) => {
      if (!isAdmin && a.house_id !== assignedHouseId) return false;
      if (filterHouse && a.house_id !== filterHouse) return false;
      if (filterDate && a.attendance_date !== filterDate) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterSession && a.session !== filterSession) return false;
      if (search) { const student = students.find((s: { id: string; student_name: string }) => s.id === a.student_id); if (!student) return false; const q = search.toLowerCase(); return student.student_name.toLowerCase().includes(q); }
      return true;
    }).sort((a: { attendance_date: string }, b: { attendance_date: string }) => b.attendance_date.localeCompare(a.attendance_date));
  }, [attendance, students, filterDate, filterHouse, filterStatus, filterSession, search, isAdmin, assignedHouseId]);

  const exportToExcel = () => {
    const data = filteredRecords.slice(0, 500).map((a: { attendance_date: string; student_id: string; house_id: string; status: string; marked_by: string; session: string }) => {
      const student = students.find((s: { id: string }) => s.id === a.student_id);
      const house = houses.find((h: { id: string }) => h.id === a.house_id);
      const warden = wardens.find((w: { id: string }) => w.id === a.marked_by);
      return { Date: a.attendance_date, Session: a.session, Student: student?.student_name || '', 'Sr No': student?.sr_no || '', Admission: student?.admission_no || '', Class: student?.class || '', 'Bed No': student?.bed_no || '', House: house?.house_name || '', Status: a.status, 'Marked By': warden?.name || a.marked_by };
    });
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Attendance'); XLSX.writeFile(wb, `attendance_${filterDate}.xlsx`);
  };

  const statusColors: Record<string, string> = { Present: 'bg-green-100 text-green-700', Absent: 'bg-red-100 text-red-700', Sick: 'bg-yellow-100 text-yellow-700', OD: 'bg-blue-100 text-blue-700', 'Staff Ward': 'bg-purple-100 text-purple-700' };
  const sessionColors: Record<string, string> = { Morning: 'bg-orange-100 text-orange-700', Night: 'bg-indigo-100 text-indigo-700' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Attendance History</h1><p className="text-gray-500 text-sm">{filteredRecords.length} records</p></div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          {isAdmin && <div><label className="block text-xs font-medium text-gray-600 mb-1">House</label><select value={filterHouse} onChange={e => setFilterHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>}
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Session</label><select value={filterSession} onChange={e => setFilterSession(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option><option value="Morning">Morning</option><option value="Night">Night</option></select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Sick">Sick</option><option value="OD">OD</option><option value="Staff Ward">Staff Ward</option></select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Search</label><input type="text" placeholder="Name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="flex items-end"><button onClick={() => { setFilterDate(new Date().toISOString().split('T')[0]); setFilterHouse(isAdmin ? '' : assignedHouseId); setFilterStatus(''); setFilterSession(''); setSearch(''); }} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3 font-medium text-gray-600">Date</th><th className="text-left px-4 py-3 font-medium text-gray-600">Session</th><th className="text-left px-4 py-3 font-medium text-gray-600">Student</th><th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Adm No</th><th className="text-left px-4 py-3 font-medium text-gray-600">Class</th><th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">House</th><th className="text-left px-4 py-3 font-medium text-gray-600">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.slice(0, 100).map((record: { id: string; attendance_date: string; student_id: string; house_id: string; status: string; session: string }) => {
                const student = students.find((s: { id: string }) => s.id === record.student_id);
                const house = houses.find((h: { id: string }) => h.id === record.house_id);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{record.attendance_date}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${sessionColors[record.session] || ''}`}>{record.session === 'Morning' ? '☀️' : '🌙'} {record.session}</span></td>
                    <td className="px-4 py-3 font-medium">{student?.student_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{student?.admission_no}</td>
                    <td className="px-4 py-3">{student?.class}-{student?.section}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{house?.house_name}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status] || ''}`}>{record.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && <div className="text-center py-10 text-gray-500">No records found</div>}
      </div>
    </div>
  );
}
