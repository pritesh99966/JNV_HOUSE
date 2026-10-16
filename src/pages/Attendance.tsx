import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, AttendanceStatus, AttendanceSession } from '../types';
import { Save, RotateCcw, CheckCheck, AlertCircle, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Leave', 'Sick', 'OD', 'Staff Ward', 'Absent(Missing)', 'NR', 'Suspended'];

const STATUS_COLORS: Record<string, string> = {
  Present: 'bg-green-100 text-green-700 border-green-300',
  Absent: 'bg-red-100 text-red-700 border-red-300',
  Leave: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Sick: 'bg-orange-100 text-orange-700 border-orange-300',
  OD: 'bg-blue-100 text-blue-700 border-blue-300',
  'Staff Ward': 'bg-purple-100 text-purple-700 border-purple-300',
  'Absent(Missing)': 'bg-red-100 text-red-700 border-red-300',
  NR: 'bg-gray-100 text-gray-700 border-gray-300',
  Suspended: 'bg-pink-100 text-pink-700 border-pink-300'
};

export default function Attendance() {
  const { user } = useAuth();
  const { houses, students, attendance, bulkSaveAttendance, getAttendanceForDate } = useData();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? (houses[0]?.id || '') : assignedHouseId);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>(
    ((location.state as any)?.session === 'Night' ? 'Night' : 'Morning') as AttendanceSession
  );
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [remarkData, setRemarkData] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const houseStudents = useMemo(() => students.filter((s: Student) => s.house_id === selectedHouse && s.status === 'Active').sort((a: Student, b: Student) => (a.sr_no || '').localeCompare(b.sr_no || '')), [students, selectedHouse]);

  useEffect(() => {
    const existing = getAttendanceForDate(selectedHouse, selectedDate, selectedSession);
    const data: Record<string, AttendanceStatus> = {};
    const remarks: Record<string, string> = {};
    existing.forEach((a: { student_id: string; status: AttendanceStatus; remark: string }) => { 
      data[a.student_id] = a.status;
      remarks[a.student_id] = a.remark || '';
    });
    setAttendanceData(data);
    setRemarkData(remarks);
    setHasChanges(false);
  }, [selectedHouse, selectedDate, selectedSession, getAttendanceForDate]);

  const filteredStudents = useMemo(() => {
    return houseStudents.filter((s: Student) => {
      if (filterClass && s.class !== filterClass) return false;
      if (search) { const q = search.toLowerCase(); return s.student_name.toLowerCase().includes(q) || (s.sr_no || '').includes(q); }
      return true;
    });
  }, [houseStudents, search, filterClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => { 
    setAttendanceData(prev => ({ ...prev, [studentId]: status })); 
    setHasChanges(true); 
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRemarkData(prev => ({ ...prev, [studentId]: remark }));
    setHasChanges(true);
  };

  const markAllPresent = () => { 
    const data: Record<string, AttendanceStatus> = {}; 
    houseStudents.forEach((s: Student) => { data[s.id] = 'Present'; }); 
    setAttendanceData(data); 
    setHasChanges(true); 
  };

  const resetAttendance = () => { 
    setAttendanceData({}); 
    setRemarkData({});
    setHasChanges(true); 
  };

  const handleSave = () => {
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({ 
      student_id: studentId, 
      house_id: selectedHouse, 
      status, 
      remark: remarkData[studentId] || '' 
    }));
    if (records.length === 0) { 
      setToast({ type: 'warning', message: 'No data to save' }); 
      setTimeout(() => setToast(null), 3000); 
      return; 
    }
    bulkSaveAttendance(records, selectedDate, selectedSession, user?.id || 'admin');
    setShowConfirm(false); 
    setHasChanges(false);
    setToast({ type: 'success', message: `${selectedSession} attendance saved for ${records.length} students` }); 
    setTimeout(() => setToast(null), 3000);
  };

  const summary = useMemo(() => {
    let present = 0, absent = 0, leave = 0, sick = 0, od = 0, staffWard = 0, absentMissing = 0, nr = 0, suspended = 0;
    Object.values(attendanceData).forEach(status => { 
      if (status === 'Present') present++; 
      else if (status === 'Absent') absent++;
      else if (status === 'Leave') leave++; 
      else if (status === 'Sick') sick++; 
      else if (status === 'OD') od++; 
      else if (status === 'Staff Ward') staffWard++;
      else if (status === 'Absent(Missing)') absentMissing++;
      else if (status === 'NR') nr++;
      else if (status === 'Suspended') suspended++;
    });
    return { present, absent, leave, sick, od, staffWard, absentMissing, nr, suspended, total: houseStudents.length, marked: present + absent + leave + sick + od + staffWard + absentMissing + nr + suspended };
  }, [attendanceData, houseStudents]);

  const classes = [...new Set(houseStudents.map((s: Student) => s.class))].sort();
  const house = houses.find((h: { id: string }) => h.id === selectedHouse);

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>{toast.message}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Daily Attendance</h1><p className="text-gray-500 text-sm">{house?.house_name || 'Select house'}</p></div>
        {hasChanges && <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><AlertCircle className="w-3 h-3" /> Unsaved changes</span>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSelectedSession('Morning')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${selectedSession === 'Morning' ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'}`}>
          <Sun className="w-5 h-5" /> Morning Attendance
        </button>
        <button onClick={() => setSelectedSession('Night')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${selectedSession === 'Night' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50'}`}>
          <Moon className="w-5 h-5" /> Night Attendance
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {isAdmin && <div><label className="block text-xs font-medium text-gray-600 mb-1">House</label><select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">{houses.filter((h: { status: string }) => h.status === 'Active').map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>}
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Search</label><input type="text" placeholder="Name/Sr No..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Class</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option>{classes.map((c: string) => <option key={c} value={c}>Class {c}</option>)}</select></div>
          <div className="flex items-end"><button onClick={() => { setSearch(''); setFilterClass(''); }} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100"><p className="text-xl font-bold text-green-700">{summary.present}</p><p className="text-xs text-green-600">Present</p></div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100"><p className="text-xl font-bold text-red-700">{summary.absent}</p><p className="text-xs text-red-600">Absent</p></div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100"><p className="text-xl font-bold text-yellow-700">{summary.leave}</p><p className="text-xs text-yellow-600">Leave</p></div>
        <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100"><p className="text-xl font-bold text-orange-700">{summary.sick}</p><p className="text-xs text-orange-600">Sick</p></div>
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100"><p className="text-xl font-bold text-blue-700">{summary.od}</p><p className="text-xs text-blue-600">OD</p></div>
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100"><p className="text-xl font-bold text-purple-700">{summary.staffWard}</p><p className="text-xs text-purple-600">Staff Ward</p></div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100"><p className="text-xl font-bold text-red-700">{summary.absentMissing}</p><p className="text-xs text-red-600">Absent(Missing)</p></div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200"><p className="text-xl font-bold text-gray-700">{summary.nr}</p><p className="text-xs text-gray-600">NR</p></div>
        <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-100"><p className="text-xl font-bold text-pink-700">{summary.suspended}</p><p className="text-xs text-pink-600">Suspended</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={markAllPresent} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><CheckCheck className="w-4 h-4" /> Mark All Present</button>
        <button onClick={resetAttendance} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><RotateCcw className="w-4 h-4" /> Reset</button>
        <button onClick={() => setShowConfirm(true)} disabled={!hasChanges} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"><Save className="w-4 h-4" /> Save {selectedSession} Attendance</button>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${selectedSession === 'Morning' ? 'border-orange-200' : 'border-indigo-200'}`}>
        <div className={`px-4 py-2 text-sm font-medium text-white ${selectedSession === 'Morning' ? 'bg-gradient-to-r from-orange-400 to-yellow-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
          {selectedSession === 'Morning' ? '☀️' : '🌙'} {selectedSession} Attendance - {selectedDate}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-3 w-12">Sr</th>
                <th className="text-left px-3 py-3">Student</th>
                <th className="text-left px-3 py-3 w-16">Class</th>
                <th className="text-left px-3 py-3 w-16 hidden sm:table-cell">Bed</th>
                {STATUS_OPTIONS.map(s => <th key={s} className="text-center px-2 py-3 text-xs">{s}</th>)}
                <th className="text-left px-3 py-3 w-40">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student: Student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{student.sr_no || '-'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {student.photo_url ? <img src={student.photo_url} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{student.student_name.charAt(0)}</div>}
                      <span className="font-medium">{student.student_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{student.class}-{student.section}</td>
                  <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell">{student.bed_no || '-'}</td>
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
                  <td className="px-3 py-2.5">
                    <input 
                      type="text" 
                      value={remarkData[student.id] || ''}
                      onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                      placeholder="Add remark..."
                      className="w-full px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <div className="text-center py-10 text-gray-500">No students found</div>}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Save {selectedSession} Attendance?</h3>
            <p className="text-sm text-gray-600 mb-4">Saving <strong>{selectedSession.toLowerCase()}</strong> attendance for <strong>{summary.marked}</strong> students in <strong>{house?.house_name}</strong> on <strong>{selectedDate}</strong>.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center text-xs">
              <div className="bg-green-50 p-2 rounded"><span className="font-bold text-green-700">{summary.present}</span><br/>Present</div>
              <div className="bg-red-50 p-2 rounded"><span className="font-bold text-red-700">{summary.absent}</span><br/>Absent</div>
              <div className="bg-yellow-50 p-2 rounded"><span className="font-bold text-yellow-700">{summary.leave}</span><br/>Leave</div>
              <div className="bg-orange-50 p-2 rounded"><span className="font-bold text-orange-700">{summary.sick}</span><br/>Sick</div>
              <div className="bg-blue-50 p-2 rounded"><span className="font-bold text-blue-700">{summary.od}</span><br/>OD</div>
              <div className="bg-purple-50 p-2 rounded"><span className="font-bold text-purple-700">{summary.staffWard}</span><br/>Staff Ward</div>
              <div className="bg-red-50 p-2 rounded"><span className="font-bold text-red-700">{summary.absentMissing}</span><br/>Absent(Missing)</div>
              <div className="bg-gray-50 p-2 rounded"><span className="font-bold text-gray-700">{summary.nr}</span><br/>NR</div>
              <div className="bg-pink-50 p-2 rounded"><span className="font-bold text-pink-700">{summary.suspended}</span><br/>Suspended</div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
