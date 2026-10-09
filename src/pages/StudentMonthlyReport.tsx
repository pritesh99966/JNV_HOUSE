import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Printer, FileText, Trophy, AlertTriangle, Calendar } from 'lucide-react';

export default function StudentMonthlyReport() {
  const { user } = useAuth();
  const { houses, students, attendance, wardens } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [selectedClass, setSelectedClass] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'present' | 'absent' | 'percentage'>('percentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const studentReports = useMemo(() => {
    const filteredStudents = students.filter((s: any) => {
      if (!isAdmin && s.house_id !== assignedHouseId) return false;
      if (selectedHouse && s.house_id !== selectedHouse) return false;
      if (selectedClass && s.class !== selectedClass) return false;
      if (s.status !== 'Active') return false;
      return true;
    });

    return filteredStudents.map((student: any) => {
      const house = houses.find((h: any) => h.id === student.house_id);
      const monthRecords = attendance.filter((a: any) => 
        a.student_id === student.id && 
        a.attendance_date.startsWith(selectedMonth)
      );
      
      const morningRecords = monthRecords.filter((a: any) => a.session === 'Morning');
      const nightRecords = monthRecords.filter((a: any) => a.session === 'Night');
      
      const count = (records: any[], status: string) => records.filter((r: any) => r.status === status).length;
      
      const morningPresent = count(morningRecords, 'Present');
      const morningAbsent = count(morningRecords, 'Absent');
      const morningSick = count(morningRecords, 'Sick');
      const morningOD = count(morningRecords, 'OD');
      const morningSW = count(morningRecords, 'Staff Ward');
      
      const nightPresent = count(nightRecords, 'Present');
      const nightAbsent = count(nightRecords, 'Absent');
      const nightSick = count(nightRecords, 'Sick');
      const nightOD = count(nightRecords, 'OD');
      const nightSW = count(nightRecords, 'Staff Ward');
      
      const totalPresent = morningPresent + nightPresent;
      const totalAbsent = morningAbsent + nightAbsent;
      const totalSick = morningSick + nightSick;
      const totalOD = morningOD + nightOD;
      const totalSW = morningSW + nightSW;
      const totalRecords = monthRecords.length;
      
      const percentage = totalRecords > 0 ? ((totalPresent / totalRecords) * 100) : 0;
      const leaveDays = (totalSick + totalOD + totalSW) / 2;
      
      return {
        student,
        house: house?.house_name || '',
        morningPresent, morningAbsent, morningSick, morningOD, morningSW,
        nightPresent, nightAbsent, nightSick, nightOD, nightSW,
        totalPresent, totalAbsent, totalSick, totalOD, totalSW, totalRecords,
        percentage: parseFloat(percentage.toFixed(1)),
        leaveDays: parseFloat(leaveDays.toFixed(1)),
      };
    });
  }, [students, attendance, houses, selectedMonth, selectedHouse, selectedClass, isAdmin, assignedHouseId]);

  const sortedReports = useMemo(() => {
    return [...studentReports].sort((a, b) => {
      let valA: number | string, valB: number | string;
      switch (sortBy) {
        case 'name': valA = a.student.student_name; valB = b.student.student_name; break;
        case 'present': valA = a.totalPresent; valB = b.totalPresent; break;
        case 'absent': valA = a.totalAbsent; valB = b.totalAbsent; break;
        case 'percentage': valA = a.percentage; valB = b.percentage; break;
        default: valA = a.percentage; valB = b.percentage;
      }
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [studentReports, sortBy, sortOrder]);

  const analytics = useMemo(() => {
    if (studentReports.length === 0) return null;
    const totalStudents = studentReports.length;
    const avgPercentage = studentReports.reduce((sum, r) => sum + r.percentage, 0) / totalStudents;
    const topPerformers = [...studentReports].sort((a, b) => b.percentage - a.percentage).slice(0, 5);
    const needAttention = studentReports.filter(r => r.percentage < 75).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
    const highLeave = [...studentReports].sort((a, b) => b.leaveDays - a.leaveDays).slice(0, 5);
    const totalLeaves = studentReports.reduce((sum, r) => sum + r.leaveDays, 0);
    const totalSick = studentReports.reduce((sum, r) => sum + r.totalSick, 0) / 2;
    const totalOD = studentReports.reduce((sum, r) => sum + r.totalOD, 0) / 2;
    return { totalStudents, avgPercentage: avgPercentage.toFixed(1), topPerformers, needAttention, highLeave, totalLeaves: totalLeaves.toFixed(1), totalSick: totalSick.toFixed(1), totalOD: totalOD.toFixed(1) };
  }, [studentReports]);

  const handleExport = () => {
    if (sortedReports.length === 0) { setToast({ type: 'error', message: 'No data to export' }); setTimeout(() => setToast(null), 3000); return; }
    try {
      const data = sortedReports.map(r => ({
        'Sr No': r.student.sr_no || '',
        'Admission No': r.student.admission_no,
        'Student Name': r.student.student_name,
        'Class': `${r.student.class}-${r.student.section}`,
        'House': r.house,
        'Morning Present': r.morningPresent,
        'Morning Absent': r.morningAbsent,
        'Morning Sick': r.morningSick,
        'Morning OD': r.morningOD,
        'Night Present': r.nightPresent,
        'Night Absent': r.nightAbsent,
        'Night Sick': r.nightSick,
        'Night OD': r.nightOD,
        'Total Present': r.totalPresent,
        'Total Absent': r.totalAbsent,
        'Total Sick (Days)': r.totalSick / 2,
        'Total OD (Days)': r.totalOD / 2,
        'Total Leave (Days)': r.leaveDays,
        'Attendance %': r.percentage,
      }));
      
      const headers = Object.keys(data[0]);
      let html = '<table border="1"><thead><tr>';
      headers.forEach(h => { html += `<th>${h}</th>`; });
      html += '</tr></thead><tbody>';
      data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => { html += `<td>${(row as any)[h] ?? ''}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_monthly_report_${selectedMonth}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ type: 'success', message: 'Report exported successfully' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setToast({ type: 'error', message: 'Export failed' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handlePrint = () => {
    if (sortedReports.length === 0) { setToast({ type: 'error', message: 'No data to print' }); setTimeout(() => setToast(null), 3000); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { setToast({ type: 'error', message: 'Allow popups' }); setTimeout(() => setToast(null), 3000); return; }
    
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    const html = `<!DOCTYPE html><html><head><title>Student Monthly Report - ${monthName}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
      h1 { color: #4f46e5; margin-bottom: 5px; }
      .meta { color: #666; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
      th { background-color: #f3f4f6; font-weight: bold; }
      .morning { background-color: #fff7ed; }
      .night { background-color: #eef2ff; }
      .good { color: #059669; font-weight: bold; }
      .bad { color: #dc2626; font-weight: bold; }
      .section-header { background-color: #f97316; color: white; }
      .section-header.night { background-color: #6366f1; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>Student Monthly Attendance Report</h1>
    <div class="meta"><p>Month: ${monthName} | Total Students: ${sortedReports.length} | Generated: ${new Date().toLocaleString()}</p></div>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Sr</th>
          <th rowspan="2">Name</th>
          <th rowspan="2">Class</th>
          <th colspan="5" class="section-header">☀️ Morning</th>
          <th colspan="5" class="section-header night">🌙 Night</th>
          <th colspan="4" class="section-header" style="background:#059669">Summary</th>
        </tr>
        <tr>
          <th class="morning">P</th><th class="morning">A</th><th class="morning">Sick</th><th class="morning">OD</th><th class="morning">SW</th>
          <th class="night">P</th><th class="night">A</th><th class="night">Sick</th><th class="night">OD</th><th class="night">SW</th>
          <th>Present</th><th>Absent</th><th>Leave Days</th><th>%</th>
        </tr>
      </thead>
      <tbody>
        ${sortedReports.map(r => `
          <tr>
            <td>${r.student.sr_no || ''}</td>
            <td style="text-align:left">${r.student.student_name}</td>
            <td>${r.student.class}-${r.student.section}</td>
            <td class="morning good">${r.morningPresent}</td>
            <td class="morning bad">${r.morningAbsent}</td>
            <td class="morning">${r.morningSick}</td>
            <td class="morning">${r.morningOD}</td>
            <td class="morning">${r.morningSW}</td>
            <td class="night good">${r.nightPresent}</td>
            <td class="night bad">${r.nightAbsent}</td>
            <td class="night">${r.nightSick}</td>
            <td class="night">${r.nightOD}</td>
            <td class="night">${r.nightSW}</td>
            <td class="good">${r.totalPresent}</td>
            <td class="bad">${r.totalAbsent}</td>
            <td>${r.leaveDays}</td>
            <td class="${r.percentage >= 75 ? 'good' : 'bad'}">${r.percentage}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table></body></html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  const getPercentageColor = (p: number) => {
    if (p >= 90) return 'text-green-600 bg-green-50';
    if (p >= 75) return 'text-blue-600 bg-blue-50';
    if (p >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Student Monthly Report</h1>
          <p className="text-gray-500 text-sm">Complete monthly attendance analysis for each student</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" /> Export</button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">House</label>
              <select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">All Houses</option>
                {houses.map((h: any) => <option key={h.id} value={h.id}>{h.house_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="percentage">Attendance %</option>
              <option value="name">Name</option>
              <option value="present">Present Count</option>
              <option value="absent">Absent Count</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="desc">Descending (High → Low)</option>
              <option value="asc">Ascending (Low → High)</option>
            </select>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-xs">Total Students</p>
            <p className="text-3xl font-bold">{analytics.totalStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-xs">Average Attendance</p>
            <p className="text-3xl font-bold">{analytics.avgPercentage}%</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
            <p className="text-yellow-100 text-xs">Total Sick Leaves</p>
            <p className="text-3xl font-bold">{analytics.totalSick}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-xs">Total OD Leaves</p>
            <p className="text-3xl font-bold">{analytics.totalOD}</p>
          </div>
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Top 5 Performers
            </h3>
            <div className="space-y-2">
              {analytics.topPerformers.map((r, i) => (
                <div key={r.student.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{r.student.student_name}</p>
                      <p className="text-xs text-gray-500">{r.student.class}-{r.student.section}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">{r.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Need Attention (&lt;75%)
            </h3>
            <div className="space-y-2">
              {analytics.needAttention.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">All students above 75% ✓</p>
              ) : analytics.needAttention.map((r, i) => (
                <div key={r.student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{r.student.student_name}</p>
                      <p className="text-xs text-gray-500">{r.student.class}-{r.student.section}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600">{r.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-yellow-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-500" /> Highest Leave Takers
            </h3>
            <div className="space-y-2">
              {analytics.highLeave.filter(r => r.leaveDays > 0).slice(0, 5).map((r, i) => (
                <div key={r.student.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{r.student.student_name}</p>
                      <p className="text-xs text-gray-500">Sick: {(r.totalSick/2).toFixed(1)} | OD: {(r.totalOD/2).toFixed(1)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-yellow-700">{r.leaveDays} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Student-wise Monthly Attendance - {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          <span className="text-sm text-gray-500">{sortedReports.length} students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-600">Sr</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-600">Student</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-600">Class</th>
                <th colSpan={5} className="text-center px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-50 border-b border-orange-200">☀️ Morning</th>
                <th colSpan={5} className="text-center px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border-b border-indigo-200">🌙 Night</th>
                <th colSpan={4} className="text-center px-2 py-1 text-xs font-semibold text-green-700 bg-green-50 border-b border-green-200">Summary</th>
              </tr>
              <tr className="bg-gray-50 border-b">
                <th colSpan={3}></th>
                <th className="text-center px-2 py-1 text-xs text-green-700">P</th>
                <th className="text-center px-2 py-1 text-xs text-red-700">A</th>
                <th className="text-center px-2 py-1 text-xs text-yellow-700">Sick</th>
                <th className="text-center px-2 py-1 text-xs text-blue-700">OD</th>
                <th className="text-center px-2 py-1 text-xs text-purple-700">SW</th>
                <th className="text-center px-2 py-1 text-xs text-green-700">P</th>
                <th className="text-center px-2 py-1 text-xs text-red-700">A</th>
                <th className="text-center px-2 py-1 text-xs text-yellow-700">Sick</th>
                <th className="text-center px-2 py-1 text-xs text-blue-700">OD</th>
                <th className="text-center px-2 py-1 text-xs text-purple-700">SW</th>
                <th className="text-center px-2 py-1 text-xs text-green-700">Total P</th>
                <th className="text-center px-2 py-1 text-xs text-red-700">Total A</th>
                <th className="text-center px-2 py-1 text-xs text-yellow-700">Leave Days</th>
                <th className="text-center px-2 py-1 text-xs text-gray-700">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedReports.map((r, idx) => (
                <tr key={r.student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs">{r.student.sr_no || idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {r.student.photo_url ? <img src={r.student.photo_url} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{r.student.student_name.charAt(0)}</div>}
                      <span className="font-medium text-xs">{r.student.student_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.student.class}-{r.student.section}</td>
                  <td className="text-center px-2 py-2 text-xs text-green-600 font-medium bg-orange-50/30">{r.morningPresent}</td>
                  <td className="text-center px-2 py-2 text-xs text-red-600 font-medium bg-orange-50/30">{r.morningAbsent}</td>
                  <td className="text-center px-2 py-2 text-xs text-yellow-600 bg-orange-50/30">{r.morningSick}</td>
                  <td className="text-center px-2 py-2 text-xs text-blue-600 bg-orange-50/30">{r.morningOD}</td>
                  <td className="text-center px-2 py-2 text-xs text-purple-600 bg-orange-50/30">{r.morningSW}</td>
                  <td className="text-center px-2 py-2 text-xs text-green-600 font-medium bg-indigo-50/30">{r.nightPresent}</td>
                  <td className="text-center px-2 py-2 text-xs text-red-600 font-medium bg-indigo-50/30">{r.nightAbsent}</td>
                  <td className="text-center px-2 py-2 text-xs text-yellow-600 bg-indigo-50/30">{r.nightSick}</td>
                  <td className="text-center px-2 py-2 text-xs text-blue-600 bg-indigo-50/30">{r.nightOD}</td>
                  <td className="text-center px-2 py-2 text-xs text-purple-600 bg-indigo-50/30">{r.nightSW}</td>
                  <td className="text-center px-2 py-2 text-xs text-green-600 font-bold">{r.totalPresent}</td>
                  <td className="text-center px-2 py-2 text-xs text-red-600 font-bold">{r.totalAbsent}</td>
                  <td className="text-center px-2 py-2 text-xs text-yellow-700 font-bold">{r.leaveDays}</td>
                  <td className="text-center px-2 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPercentageColor(r.percentage)}`}>{r.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedReports.length === 0 && <div className="text-center py-10 text-gray-500">No data available</div>}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div><span className="font-bold text-green-600">P</span> = Present</div>
          <div><span className="font-bold text-red-600">A</span> = Absent</div>
          <div><span className="font-bold text-yellow-600">Sick</span> = Sick Leave</div>
          <div><span className="font-bold text-blue-600">OD</span> = On Duty</div>
          <div><span className="font-bold text-purple-600">SW</span> = Staff Ward</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">📝 Leave Days = (Sick + OD + Staff Ward) / 2 (Morning + Night sessions = 1 day)</p>
      </div>
    </div>
  );
}
