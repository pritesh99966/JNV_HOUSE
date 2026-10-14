import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Printer, FileText } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const { houses, students, attendance } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'house'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const reportData = useMemo(() => {
    if (reportType === 'daily') {
      return houses.filter((h: any) => isAdmin || h.id === assignedHouseId).map((house: any) => {
        const morningRecords = attendance.filter((a: any) => 
          a.house_id === house.id && 
          a.attendance_date === selectedDate && 
          a.session === 'Morning'
        );
        const nightRecords = attendance.filter((a: any) => 
          a.house_id === house.id && 
          a.attendance_date === selectedDate && 
          a.session === 'Night'
        );
        const totalStudents = students.filter((s: any) => s.house_id === house.id && s.status === 'Active').length;
        
        return {
          house: house.house_name,
          totalStudents,
          morningPresent: morningRecords.filter((r: any) => r.status === 'Present').length,
          morningLeave: morningRecords.filter((r: any) => r.status === 'Leave').length,
          morningSick: morningRecords.filter((r: any) => r.status === 'Sick').length,
          nightPresent: nightRecords.filter((r: any) => r.status === 'Present').length,
          nightLeave: nightRecords.filter((r: any) => r.status === 'Leave').length,
          nightSick: nightRecords.filter((r: any) => r.status === 'Sick').length,
        };
      });
    } else if (reportType === 'monthly') {
      const filteredStudents = students.filter((s: any) => 
        (isAdmin || s.house_id === assignedHouseId) && 
        (!selectedHouse || s.house_id === selectedHouse) &&
        s.status === 'Active'
      );
      
      return filteredStudents.map((student: any) => {
        const monthRecords = attendance.filter((a: any) => 
          a.student_id === student.id && 
          a.attendance_date.startsWith(selectedMonth)
        );
        
        const present = monthRecords.filter((r: any) => r.status === 'Present').length;
        const leave = monthRecords.filter((r: any) => r.status === 'Leave').length;
        const sick = monthRecords.filter((r: any) => r.status === 'Sick').length;
        const od = monthRecords.filter((r: any) => r.status === 'OD').length;
        const staffWard = monthRecords.filter((r: any) => r.status === 'Staff Ward').length;
        const absentMissing = monthRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
        const nr = monthRecords.filter((r: any) => r.status === 'NR').length;
        const suspended = monthRecords.filter((r: any) => r.status === 'Suspended').length;
        
        const totalRecords = monthRecords.length;
        const percentage = totalRecords > 0 ? ((present / totalRecords) * 100).toFixed(1) : '0.0';
        const leaveDays = ((leave + sick + od + staffWard) / 2).toFixed(1);
        
        const house = houses.find((h: any) => h.id === student.house_id);
        
        return {
          srNo: student.sr_no,
          name: student.student_name,
          class: `${student.class}-${student.section}`,
          house: house?.house_name || '',
          present,
          leave,
          sick,
          od,
          staffWard,
          absentMissing,
          nr,
          suspended,
          totalRecords,
          percentage,
          leaveDays
        };
      });
    } else {
      return [];
    }
  }, [reportType, selectedDate, selectedMonth, selectedHouse, houses, students, attendance, isAdmin, assignedHouseId]);

  const handleExport = () => {
    if (reportData.length === 0) {
      setToast({ type: 'error', message: 'No data to export' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const headers = Object.keys(reportData[0]);
      let csv = headers.join(',') + '\n';
      reportData.forEach((row: any) => {
        csv += headers.map(h => `"${row[h]}"`).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
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
    if (reportData.length === 0) {
      setToast({ type: 'error', message: 'No data to print' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setToast({ type: 'error', message: 'Please allow popups' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const headers = Object.keys(reportData[0]);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4f46e5; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${reportData.map((row: any) => 
              `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm">Generate and export reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly Report
          </button>
          <button
            onClick={() => setReportType('house')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'house' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            House Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reportType === 'daily' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          )}
          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">House</label>
                  <select
                    value={selectedHouse}
                    onChange={e => setSelectedHouse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Houses</option>
                    {houses.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.house_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - {reportData.length} records
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {reportData.length > 0 && Object.keys(reportData[0]).map(key => (
                  <th key={key} className="text-left px-4 py-3 font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(row).map((val: any, i: number) => (
                    <td key={i} className="px-4 py-3 text-gray-700">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && (
          <div className="text-center py-10 text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
}
