import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Printer } from 'lucide-react';

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
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const reportData = useMemo(() => {
    switch (reportType) {
      case 'daily':
        return houses.filter((h: { id: string; status: string }) => (isAdmin || h.id === assignedHouseId) && h.status === 'Active').map((house: { id: string; house_name: string }) => {
          const allRecords = attendance.filter((a: { house_id: string; attendance_date: string }) => a.house_id === house.id && a.attendance_date === selectedDate);
          const morningRecords = allRecords.filter((a: { session: string }) => a.session === 'Morning');
          const nightRecords = allRecords.filter((a: { session: string }) => a.session === 'Night');
          const total = students.filter((s: { house_id: string; status: string }) => s.house_id === house.id && s.status === 'Active').length;
          return { 
            House: house.house_name, 
            Total: total,
            'Morning Present': morningRecords.filter((r: { status: string }) => r.status === 'Present').length,
            'Morning Absent': morningRecords.filter((r: { status: string }) => r.status === 'Absent').length,
            'Night Present': nightRecords.filter((r: { status: string }) => r.status === 'Present').length,
            'Night Absent': nightRecords.filter((r: { status: string }) => r.status === 'Absent').length,
            'Total Present': allRecords.filter((r: { status: string }) => r.status === 'Present').length,
            'Total Absent': allRecords.filter((r: { status: string }) => r.status === 'Absent').length,
            'Total Sick': allRecords.filter((r: { status: string }) => r.status === 'Sick').length,
            'Total OD': allRecords.filter((r: { status: string }) => r.status === 'OD').length,
            'Total Staff Ward': allRecords.filter((r: { status: string }) => r.status === 'Staff Ward').length,
          };
        });
      case 'monthly': {
        const hs = students.filter((s: { house_id: string; status: string }) => (isAdmin || s.house_id === assignedHouseId) && s.status === 'Active' && (!selectedHouse || s.house_id === selectedHouse));
        return hs.map((student: { id: string; student_name: string; admission_no: string; class: string; section: string; house_id: string }) => {
          const monthRecords = attendance.filter((a: { student_id: string; attendance_date: string }) => a.student_id === student.id && a.attendance_date.startsWith(selectedMonth));
          const morningRecords = monthRecords.filter((a: { session: string }) => a.session === 'Morning');
          const nightRecords = monthRecords.filter((a: { session: string }) => a.session === 'Night');
          const house = houses.find((h: { id: string }) => h.id === student.house_id);
          const present = monthRecords.filter((r: { status: string }) => r.status === 'Present').length;
          const absent = monthRecords.filter((r: { status: string }) => r.status === 'Absent').length;
          const sick = monthRecords.filter((r: { status: string }) => r.status === 'Sick').length;
          const od = monthRecords.filter((r: { status: string }) => r.status === 'OD').length;
          const sw = monthRecords.filter((r: { status: string }) => r.status === 'Staff Ward').length;
          const leaveDays = ((sick + od + sw) / 2).toFixed(1);
          const percentage = monthRecords.length > 0 ? ((present / monthRecords.length) * 100).toFixed(1) : '0.0';
          return { 
            Name: student.student_name, 
            Admission: student.admission_no, 
            Class: `${student.class}-${student.section}`, 
            House: house?.house_name || '', 
            'Morning Present': morningRecords.filter((r: { status: string }) => r.status === 'Present').length,
            'Morning Absent': morningRecords.filter((r: { status: string }) => r.status === 'Absent').length,
            'Night Present': nightRecords.filter((r: { status: string }) => r.status === 'Present').length,
            'Night Absent': nightRecords.filter((r: { status: string }) => r.status === 'Absent').length,
            'Total Present': present,
            'Total Absent': absent,
            'Total Sick': sick,
            'Total OD': od,
            'Total Staff Ward': sw,
            'Leave Days': leaveDays,
            'Attendance %': percentage,
          };
        });
      }
      case 'absent': case 'sick': case 'od': case 'staffward': {
        const statusMap: Record<string, string> = { absent: 'Absent', sick: 'Sick', od: 'OD', staffward: 'Staff Ward' };
        const targetStatus = statusMap[reportType];
        const records = attendance.filter((a: { attendance_date: string; status: string; house_id: string }) => a.attendance_date === selectedDate && a.status === targetStatus && (isAdmin || a.house_id === assignedHouseId) && (!selectedHouse || a.house_id === selectedHouse));
        return records.map((r: { student_id: string; house_id: string; status: string; session: string }) => {
          const student = students.find((s: { id: string }) => s.id === r.student_id);
          const house = houses.find((h: { id: string }) => h.id === r.house_id);
          return { 
            Name: student?.student_name || '', 
            'Sr No': student?.sr_no || '',
            Class: student ? `${student.class}-${student.section}` : '', 
            House: house?.house_name || '', 
            'Bed No': student?.bed_no || '', 
            Session: r.session || 'Morning',
            Status: r.status 
          };
        });
      }
      default: return [];
    }
  }, [reportType, selectedDate, selectedHouse, selectedMonth, houses, students, attendance, isAdmin, assignedHouseId]);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      showToast('error', 'No data to export');
      return;
    }
    try {
      const headers = Object.keys(reportData[0] as Record<string, unknown>);
      let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>';
      headers.forEach(h => { html += `<th style="background-color:#4f46e5;color:white;padding:8px;font-weight:bold;">${h.replace(/([A-Z])/g, ' $1').trim()}</th>`; });
      html += '</tr></thead><tbody>';
      reportData.forEach((row: Record<string, unknown>) => {
        html += '<tr>';
        headers.forEach(h => { html += `<td style="padding:6px;">${row[h] ?? ''}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xls`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      showToast('success', `Excel file exported successfully (${reportData.length} records)`);
    } catch (error) {
      console.error('Excel export failed:', error);
      showToast('error', 'Excel export failed. Please try CSV export instead.');
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      showToast('error', 'No data to export');
      return;
    }
    try {
      const headers = Object.keys(reportData[0] as Record<string, unknown>);
      const BOM = '\uFEFF';
      const csvContent = BOM + [
        headers.map(h => `"${h.replace(/([A-Z])/g, ' $1').trim()}"`).join(','),
        ...reportData.map((row: Record<string, unknown>) => 
          headers.map(h => {
            const value = String(row[h] ?? '').replace(/"/g, '""');
            return `"${value}"`;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      showToast('success', `CSV file exported successfully (${reportData.length} records)`);
    } catch (error) {
      console.error('CSV export failed:', error);
      showToast('error', 'CSV export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    if (reportData.length === 0) {
      showToast('error', 'No data to print');
      return;
    }
    try {
      const headers = Object.keys(reportData[0] as Record<string, unknown>);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('error', 'Please allow popups to print reports');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTypes.find(r => r.value === reportType)?.label} - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4f46e5; margin-bottom: 10px; }
            .meta { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${reportTypes.find(r => r.value === reportType)?.label}</h1>
          <div class="meta">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${reportData.length}</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${reportData.map((row: Record<string, unknown>) =>
                `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('Print failed:', error);
      showToast('error', 'Print failed. Please try again.');
    }
  };

  const reportTypes = [
    { value: 'daily', label: 'Daily Report' }, { value: 'monthly', label: 'Monthly Report' },
    { value: 'house', label: 'House Report' }, { value: 'absent', label: 'Absent' },
    { value: 'sick', label: 'Sick' }, { value: 'od', label: 'OD' }, { value: 'staffward', label: 'Staff Ward' },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Reports</h1><p className="text-gray-500 text-sm">Generate and export reports</p></div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"><Printer className="w-4 h-4" /> Print</button>
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
