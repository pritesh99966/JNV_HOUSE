import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus } from '../types';
import { Save, RotateCcw, CheckCheck, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Sick', 'OD', 'Staff Ward'];
const STATUS_COLORS: Record<string, string> = { Present: 'bg-green-100 text-green-700 border-green-300', Absent: 'bg-red-100 text-red-700 border-red-300', Sick: 'bg-yellow-100 text-yellow-700 border-yellow-300', OD: 'bg-blue-100 text-blue-700 border-blue-300', 'Staff Ward': 'bg-purple-100 text-purple-700 border-purple-300' };

export default function Attendance() {
  const { user } = useAuth();
  const { houses, students, attendance, bulkSaveAttendance, getAttendanceForDate } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? (houses[0]?.id || '') : assignedHouseId);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const houseStudents = useMemo(() => students.filter((s: { house_id: string; status: string }) => s.house_id === selectedHouse && s.status === 'Active').sort((a: { roll_no: string }, b: { roll_no: string }) => a.roll_no.localeCompare(b.roll_no)), [students, selectedHouse]);

  useEffect(() => {
    const existing = getAttendanceForDate(selectedHouse, selectedDate);
    const data: Record<string, AttendanceStatus> = {};
    existing.forEach((a: { student_id: string; status: AttendanceStatus }) => { data[a.student_id] = a.status; });
    setAttendanceData(data); setHasChanges(false);
  }, [selectedHouse, selectedDate, getAttendanceForDate]);

  const filteredStudents = useMemo(() => {
    return houseStudents.filter((s: { class: string; student_name: string; roll_no: string }) => {
      if (filterClass && s.class !== filterClass) return false;
      if (search) { const q = search.toLowerCase(); return s.student_name.toLowerCase().includes(q) || s.roll_no.includes(q); }
      return true;
    });
  }, [houseStudents, search, filterClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => { setAttendanceData(prev => ({ ...prev, [studentId]: status })); setHasChanges(true); };
  const markAllPresent = () => { const data: Record<string, AttendanceStatus> = {}; houseStudents.forEach((s: { id: string }) => { data[s.id] = 'Present'; }); setAttendanceData(data); setHasChanges(true); };
  const resetAttendance = () => { setAttendanceData({}); setHasChanges(true); };

  const handleSave = () => {
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({ student_id: studentId, house_id: selectedHouse, status, remark: '' }));
    if (records.length === 0) { setToast({ type: 'warning', message: 'No data to save' }); setTimeout(() => setToast(null), 3000); return; }
    bulkSaveAttendance(records, selectedDate, user?.id || 'admin');
    setShowConfirm(false); setHasChanges(false);
    setToast({ type: 'success', message: `Saved for ${records.length} students` }); setTimeout(() => setToast(null), 3000);
  };

  const summary = useMemo(() => {
    let present = 0, absent = 0, sick = 0, od = 0, staffWard = 0;
    Object.values(attendanceData).forEach(status => { if (status === 'Present') present++; else if (status === 'Absent') absent++; else if (status === 'Sick') sick++; else if (status === 'OD') od++; else if (status === 'Staff Ward') staffWard++; });
    return { present, absent, sick, od, staffWard, total: houseStudents.length, marked: present + absent + sick + od + staffWard };
  }, [attendanceData, houseStudents]);

  const classes = [...new Set(houseStudents.map((s: { class: string }) => s.class))].sort();
  const house = houses.find((h: { id: string }) => h.id === selectedHouse);

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>{toast.message}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Daily Attendance</h1><p className="text-gray-500 text-sm">{house?.house_name || 'Select house'}</p></div>
        {hasChanges && <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><AlertCircle className="w-3 h-3" /> Unsaved changes</span>}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {isAdmin && <div><label className="block text-xs font-medium text-gray-600 mb-1">House</label><select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">{houses.filter((h: { status: string }) => h.status === 'Active').map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>}
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Search</label><input type="text" placeholder="Name/Roll..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Class</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option>{classes.map((c: string) => <option key={c} value={c}>Class {c}</option>)}</select></div>
          <div className="flex items-end"><button onClick={() => { setSearch(''); setFilterClass(''); }} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button></div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100"><p className="text-xl font-bold text-green-700">{summary.present}</p><p className="text-xs text-green-600">Present</p></div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100"><p className="text-xl font-bold text-red-700">{summary.absent}</p><p className="text-xs text-red-600">Absent</p></div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100"><p className="text-xl font-bold text-yellow-700">{summary.sick}</p><p className="text-xs text-yellow-600">Sick</p></div>
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100"><p className="text-xl font-bold text-blue-700">{summary.od}</p><p className="text-xs text-blue-600">OD</p></div>
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100"><p className="text-xl font-bold text-purple-700">{summary.staffWard}</p><p className="text-xs text-purple-600">Staff Ward</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200"><p className="text-xl font-bold text-gray-700">{summary.marked}/{summary.total}</p><p className="text-xs text-gray-600">Marked</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={markAllPresent} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><CheckCheck className="w-4 h-4" /> Mark All Present</button>
        <button onClick={resetAttendance} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><RotateCcw className="w-4 h-4" /> Reset</button>
        <button onClick={() => setShowConfirm(true)} disabled={!hasChanges} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"><Save className="w-4 h-4" /> Save</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="text-left px-3 py-3 w-12">Roll</th><th className="text-left px-3 py-3">Student</th><th className="text-left px-3 py-3 w-16">Class</th><th className="text-left px-3 py-3 w-16 hidden sm:table-cell">Room</th>{STATUS_OPTIONS.map(s => <th key={s} className="text-center px-2 py-3 text-xs">{s}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student: { id: string; roll_no: string; student_name: string; class: string; section: string; room_no: string }) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{student.roll_no}</td>
                  <td className="px-3 py-2.5 font-medium">{student.student_name}</td>
                  <td className="px-3 py-2.5 text-gray-600">{student.class}-{student.section}</td>
                  <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell">{student.room_no}</td>
                  {STATUS_OPTIONS.map(status => (
                    <td key={status} className="text-center px-2 py-2.5">
                      <label className="cursor-pointer inline-flex items-center justify-center">
                        <input type="radio" name={`att_${student.id}`} checked={attendanceData[student.id] === status} onChange={() => handleStatusChange(student.id, status)} className="sr-only" />
                        <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${attendanceData[student.id] === status ? STATUS_COLORS[status] + ' border-current' : 'border-gray-300 hover:border-gray-400'}`}>
                          {attendanceData[student.id] === status && <span className="w-3 h-3 rounded-full bg-current"></span>}
                        </span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <div className="text-center py-10 text-gray-500">No students found</div>}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Save Attendance?</h3>
            <p className="text-sm text-gray-600 mb-4">Saving for <strong>{summary.marked}</strong> students in <strong>{house?.house_name}</strong> on <strong>{selectedDate}</strong>.</p>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
              <div className="bg-green-50 p-2 rounded"><span className="font-bold text-green-700">{summary.present}</span><br/>Present</div>
              <div className="bg-red-50 p-2 rounded"><span className="font-bold text-red-700">{summary.absent}</span><br/>Absent</div>
              <div className="bg-yellow-50 p-2 rounded"><span className="font-bold text-yellow-700">{summary.sick}</span><br/>Sick</div>
              <div className="bg-blue-50 p-2 rounded"><span className="font-bold text-blue-700">{summary.od}</span><br/>OD</div>
              <div className="bg-purple-50 p-2 rounded"><span className="font-bold text-purple-700">{summary.staffWard}</span><br/>Staff Ward</div>
              <div className="bg-gray-50 p-2 rounded"><span className="font-bold text-gray-700">{summary.total - summary.marked}</span><br/>Unmarked</div>
            </div>
            <div className="flex justify-end gap-3"><button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Confirm & Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
