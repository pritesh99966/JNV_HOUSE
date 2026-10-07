import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

type ReportType = 'daily' | 'monthly' | 'house' | 'absent' | 'sick' | 'od' | 'staffward';

export default function Reports() {
  const { user } = useAuth();
  const { houses, students, attendance } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.substring(0, 7));

  const reportData = useMemo(() => {
    switch (reportType) {
      case 'daily':
        return houses.filter((h: { id: string; status: string }) => isAdmin || h.id === assignedHouseId ? h.status === 'Active' : false).map((house: { id: string; house_name: string }) => {
          const records = attendance.filter((a: { house_id: string; attendance_date: string }) => a.house_id === house.id && a.attendance_date === selectedDate);
          const total = students.filter((s: { house_id: string; status: string }) => s.house_id === house.id && s.status === 'Active').length;
          return { House: house.house_name, Total: total, Present: records.filter((r: { status: string }) => r.status === 'Present').length, Absent: records.filter((r: { status: string }) => r.status === 'Absent').length, Sick: records.filter((r: { status: string }) => r.status === 'Sick').length, OD: records.filter((r: { status: string }) => r.status === 'OD').length, StaffWard: records.filter((r: { status: string }) => r.status === 'Staff Ward').length };
        });
      case 'monthly': {
        const hs = students.filter((s: { house_id: string; status: string }) => (isAdmin || s.house_id === assignedHouseId) && s.status === 'Active' && (!selectedHouse || s.house_id === selectedHouse));
        return hs.map((student: { id: string; student_name: string; admission_no: string; class: string; section: string; house_id: string }) => {
          const monthRecords = attendance.filter((a: { student_id: string; attendance_date: string }) => a.student_id === student.id && a.attendance_date.startsWith(selectedMonth));
          const house = houses.find((h: { id: string }) => h.id === student.house_id);
          return { Name: student.student_name, Admission: student.admission_no, Class: `${student.class}-${student.section}`, House: house?.house_name || '', Present: monthRecords.filter((r: { status: string }) => r.status === 'Present').length, Absent: monthRecords.filter((r: { status: string }) => r.status === 'Absent').length, Total: monthRecords.length };
        });
      }
      case 'absent': case 'sick': case 'od': case 'staffward': {
        const statusMap: Record<string, string> = { absent: 'Absent', sick: 'Sick', od: 'OD', staffward: 'Staff Ward' };
        const targetStatus = statusMap[reportType];
        const records = attendance.filter((a: { attendance_date: string; status: string; house_id: string }) => a.attendance_date === selectedDate && a.status === targetStatus && (isAdmin || a.house_id === assignedHouseId) && (!selectedHouse || a.house_id === selectedHouse));
        return records.map((r: { student_id: string; house_id: string; status: string }) => {
          const student = students.find((s: { id: string }) => s.id === r.student_id);
          const house = houses.find((h: { id: string }) => h.id === r.house_id);
          return { Name: student?.student_name || '', Class: student ? `${student.class}-${student.section}` : '', House: house?.house_name || '', Room: student?.room_no || '', Status: r.status };
        });
      }
      default: return [];
    }
  }, [reportType, selectedDate, selectedHouse, selectedMonth, houses, students, attendance, isAdmin, assignedHouseId]);

  const exportToExcel = () => { const ws = XLSX.utils.json_to_sheet(reportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Report'); XLSX.writeFile(wb, `${reportType}_report.xlsx`); };
  const exportToCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0] as Record<string, unknown>);
    const csv = [headers.join(','), ...reportData.map((row: Record<string, unknown>) => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}_report.csv`; a.click();
  };

  const reportTypes = [
    { value: 'daily', label: 'Daily Report' }, { value: 'monthly', label: 'Monthly Report' },
    { value: 'house', label: 'House Report' }, { value: 'absent', label: 'Absent' },
    { value: 'sick', label: 'Sick' }, { value: 'od', label: 'OD' }, { value: 'staffward', label: 'Staff Ward' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Reports</h1><p className="text-gray-500 text-sm">Generate and export reports</p></div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2 mb-4">
          {reportTypes.map(rt => (
            <button key={rt.value} onClick={() => setReportType(rt.value as ReportType)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${reportType === rt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{rt.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(reportType === 'daily' || reportType === 'absent' || reportType === 'sick' || reportType === 'od' || reportType === 'staffward') && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          )}
          {reportType === 'monthly' && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Month</label><input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          )}
          {isAdmin && (reportType === 'monthly' || reportType === 'absent' || reportType === 'sick' || reportType === 'od' || reportType === 'staffward') && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">House</label><select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50"><h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" />{reportTypes.find(r => r.value === reportType)?.label} - {reportData.length} records</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{reportData.length > 0 && Object.keys(reportData[0] as Record<string, unknown>).map(key => <th key={key} className="text-left px-4 py-3 font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((row: Record<string, unknown>, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">{Object.values(row).map((val, i) => <td key={i} className="px-4 py-3 text-gray-700">{String(val)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && <div className="text-center py-10 text-gray-500">No data available</div>}
      </div>
    </div>
  );
}
