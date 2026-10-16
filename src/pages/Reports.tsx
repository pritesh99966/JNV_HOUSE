import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Printer, FileText } from 'lucide-react';

type ReportType = 'daily' | 'monthly' | 'house' | 'absent' | 'sick' | 'od' | 'staffward';

export default function Reports() {
  const { user } = useAuth();
  const { houses, students, attendance, schools } = useData();
  const isAdmin = user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const assignedHouseId = user?.assigned_house_id || '';
  const schoolId = user?.school_id || '';
  
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHouse, setSelectedHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.substring(0, 7));
  const [selectedSession, setSelectedSession] = useState<'Morning' | 'Night' | 'Both'>('Both');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  
  const school = schools.find((s: any) => s.id === schoolId);

  const reportData = useMemo(() => {
    if (reportType === 'daily') {
      return houses.filter((h: any) => (isAdmin || h.id === assignedHouseId) && h.status === 'Active').map((house: any) => {
        const allRecords = attendance.filter((a: any) => a.house_id === house.id && a.attendance_date === selectedDate);
        const morningRecords = allRecords.filter((a: any) => a.session === 'Morning');
        const nightRecords = allRecords.filter((a: any) => a.session === 'Night');
        const totalStudents = students.filter((s: any) => s.house_id === house.id && s.status === 'Active').length;
        
        const baseData: any = { 
          House: house.house_name, 
          'Total Students': totalStudents,
        };

        // Add columns based on selected session
        if (selectedSession === 'Morning' || selectedSession === 'Both') {
          baseData['Morning Present'] = morningRecords.filter((r: any) => r.status === 'Present').length;
          baseData['Morning Leave'] = morningRecords.filter((r: any) => r.status === 'Leave').length;
          baseData['Morning Sick'] = morningRecords.filter((r: any) => r.status === 'Sick').length;
          baseData['Morning OD'] = morningRecords.filter((r: any) => r.status === 'OD').length;
          baseData['Morning Staff Ward'] = morningRecords.filter((r: any) => r.status === 'Staff Ward').length;
          baseData['Morning Absent(Missing)'] = morningRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
          baseData['Morning NR'] = morningRecords.filter((r: any) => r.status === 'NR').length;
          baseData['Morning Suspended'] = morningRecords.filter((r: any) => r.status === 'Suspended').length;
        }

        if (selectedSession === 'Night' || selectedSession === 'Both') {
          baseData['Night Present'] = nightRecords.filter((r: any) => r.status === 'Present').length;
          baseData['Night Leave'] = nightRecords.filter((r: any) => r.status === 'Leave').length;
          baseData['Night Sick'] = nightRecords.filter((r: any) => r.status === 'Sick').length;
          baseData['Night OD'] = nightRecords.filter((r: any) => r.status === 'OD').length;
          baseData['Night Staff Ward'] = nightRecords.filter((r: any) => r.status === 'Staff Ward').length;
          baseData['Night Absent(Missing)'] = nightRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
          baseData['Night NR'] = nightRecords.filter((r: any) => r.status === 'NR').length;
          baseData['Night Suspended'] = nightRecords.filter((r: any) => r.status === 'Suspended').length;
        }

        return baseData;
      });
    } else if (reportType === 'monthly') {
      const hs = students.filter((s: any) => (isAdmin || s.house_id === assignedHouseId) && s.status === 'Active' && (!selectedHouse || s.house_id === selectedHouse));
      return hs.map((student: any) => {
        let monthRecords = attendance.filter((a: any) => a.student_id === student.id && a.attendance_date.startsWith(selectedMonth));
        
        if (selectedSession !== 'Both') {
          monthRecords = monthRecords.filter((a: any) => a.session === selectedSession);
        }
        
        const morningRecords = monthRecords.filter((a: any) => a.session === 'Morning');
        const nightRecords = monthRecords.filter((a: any) => a.session === 'Night');
        const house = houses.find((h: any) => h.id === student.house_id);
        const present = monthRecords.filter((r: any) => r.status === 'Present').length;
        const leave = monthRecords.filter((r: any) => r.status === 'Leave').length;
        const sick = monthRecords.filter((r: any) => r.status === 'Sick').length;
        const od = monthRecords.filter((r: any) => r.status === 'OD').length;
        const sw = monthRecords.filter((r: any) => r.status === 'Staff Ward').length;
        const am = monthRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
        const nr = monthRecords.filter((r: any) => r.status === 'NR').length;
        const suspended = monthRecords.filter((r: any) => r.status === 'Suspended').length;
        const leaveDays = ((leave + sick + od + sw + am + nr + suspended) / (selectedSession === 'Both' ? 2 : 1)).toFixed(1);
        const percentage = monthRecords.length > 0 ? ((present / monthRecords.length) * 100).toFixed(1) : '0.0';
        
        const baseData: any = { 
          Name: student.student_name, 
          Admission: student.admission_no, 
          Class: `${student.class}-${student.section}`, 
          House: house?.house_name || '',
        };

        if (selectedSession === 'Morning' || selectedSession === 'Both') {
          baseData['Morning Present'] = morningRecords.filter((r: any) => r.status === 'Present').length;
          baseData['Morning Leave'] = morningRecords.filter((r: any) => r.status === 'Leave').length;
          baseData['Morning Sick'] = morningRecords.filter((r: any) => r.status === 'Sick').length;
          baseData['Morning OD'] = morningRecords.filter((r: any) => r.status === 'OD').length;
          baseData['Morning Staff Ward'] = morningRecords.filter((r: any) => r.status === 'Staff Ward').length;
          baseData['Morning Absent(Missing)'] = morningRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
          baseData['Morning NR'] = morningRecords.filter((r: any) => r.status === 'NR').length;
          baseData['Morning Suspended'] = morningRecords.filter((r: any) => r.status === 'Suspended').length;
        }

        if (selectedSession === 'Night' || selectedSession === 'Both') {
          baseData['Night Present'] = nightRecords.filter((r: any) => r.status === 'Present').length;
          baseData['Night Leave'] = nightRecords.filter((r: any) => r.status === 'Leave').length;
          baseData['Night Sick'] = nightRecords.filter((r: any) => r.status === 'Sick').length;
          baseData['Night OD'] = nightRecords.filter((r: any) => r.status === 'OD').length;
          baseData['Night Staff Ward'] = nightRecords.filter((r: any) => r.status === 'Staff Ward').length;
          baseData['Night Absent(Missing)'] = nightRecords.filter((r: any) => r.status === 'Absent(Missing)').length;
          baseData['Night NR'] = nightRecords.filter((r: any) => r.status === 'NR').length;
          baseData['Night Suspended'] = nightRecords.filter((r: any) => r.status === 'Suspended').length;
        }

        baseData['Total Present'] = present;
        baseData['Total Leave'] = leave;
        baseData['Total Sick'] = sick;
        baseData['Total OD'] = od;
        baseData['Total Staff Ward'] = sw;
        baseData['Total Absent(Missing)'] = am;
        baseData['Total NR'] = nr;
        baseData['Total Suspended'] = suspended;
        baseData['Leave Days'] = leaveDays;
        baseData['Attendance %'] = percentage;

        return baseData;
      });
    } else if (reportType === 'absent' || reportType === 'sick' || reportType === 'od' || reportType === 'staffward') {
      const statusMap: Record<string, string> = { absent: 'Leave', sick: 'Sick', od: 'OD', staffward: 'Staff Ward' };
      const targetStatus = statusMap[reportType];
      let records = attendance.filter((a: any) => a.attendance_date === selectedDate && a.status === targetStatus && (isAdmin || a.house_id === assignedHouseId) && (!selectedHouse || a.house_id === selectedHouse));
      
      if (selectedSession !== 'Both') {
        records = records.filter((a: any) => a.session === selectedSession);
      }
      
      return records.map((r: any) => {
        const student = students.find((s: any) => s.id === r.student_id);
        const house = houses.find((h: any) => h.id === r.house_id);
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
    return [];
  }, [reportType, selectedDate, selectedHouse, selectedMonth, selectedSession, houses, students, attendance, isAdmin, assignedHouseId]);

  // Calculate totals for daily report
  const totals = useMemo(() => {
    if (reportType !== 'daily' || reportData.length === 0) return null;
    
    const totals: any = {};
    const keys = Object.keys(reportData[0]);
    keys.forEach(key => {
      if (key !== 'House') {
        totals[key] = reportData.reduce((sum: number, row: any) => sum + (row[key] || 0), 0);
      }
    });
    return totals;
  }, [reportType, reportData]);

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
      let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><title>${school?.name || 'School'} - ${reportType} Report</title></head><body>`;
      
      html += `<h1 style="color: #4f46e5; font-family: Arial;">${school?.name || 'School'}</h1>`;
      html += `<h2 style="color: #666; font-family: Arial;">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${selectedDate}</h2>`;
      html += `<p style="color: #999; font-family: Arial;">Session: ${selectedSession} | Generated: ${new Date().toLocaleString()}</p>`;
      
      html += '<table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial;"><thead><tr>';
      headers.forEach(h => { html += `<th style="background-color: #4f46e5; color: white; padding: 8px; font-weight: bold;">${h.replace(/([A-Z])/g, ' $1').trim()}</th>`; });
      html += '<th style="background-color: #4f46e5; color: white; padding: 8px; font-weight: bold;">Hm/Ahm Sign</th>';
      html += '</tr></thead><tbody>';
      reportData.forEach((row: Record<string, unknown>) => {
        html += '<tr>';
        headers.forEach(h => { html += `<td style="padding: 6px;">${row[h] ?? ''}</td>`; });
        html += '<td style="padding: 6px;"></td>';
        html += '</tr>';
      });
      
      if (reportType === 'daily' && totals) {
        html += '<tr style="background-color: #f3f4f6; font-weight: bold;">';
        html += '<td style="padding: 6px;">TOTAL</td>';
        headers.forEach(h => { html += `<td style="padding: 6px;">${totals[h] ?? ''}</td>`; });
        html += '<td style="padding: 6px;"></td>';
        html += '</tr>';
      }
      
      html += '</tbody></table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${school?.name || 'school'}_${reportType}_report_${selectedDate}.xls`;
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
      showToast('error', 'Excel export failed.');
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
      let csvContent = BOM;
      
      csvContent += `School:,${school?.name || 'School'}\n`;
      csvContent += `Report Type:,${reportType}\n`;
      csvContent += `Date:,${selectedDate}\n`;
      csvContent += `Session:,${selectedSession}\n\n`;
      
      csvContent += headers.map(h => `"${h.replace(/([A-Z])/g, ' $1').trim()}"`).join(',') + ',"Hm/Ahm Sign"\n';
      csvContent += reportData.map((row: Record<string, unknown>) => 
        headers.map(h => {
          const value = String(row[h] ?? '').replace(/"/g, '""');
          return `"${value}"`;
        }).join(',') + ',""\n'
      ).join('');
      
      if (reportType === 'daily' && totals) {
        csvContent += '"TOTAL",';
        csvContent += Object.keys(totals).map(key => totals[key]).join(',') + ',""\n';
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${school?.name || 'school'}_${reportType}_report_${selectedDate}.csv`;
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
      showToast('error', 'CSV export failed.');
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
          <title>${school?.name || 'School'} - ${reportType} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4f46e5; margin-bottom: 5px; }
            h2 { color: #666; margin-bottom: 10px; font-size: 16px; }
            .meta { color: #999; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .total-row { background-color: #f3f4f6; font-weight: bold; }
            .signature-col { width: 100px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${school?.name || 'School'}</h1>
          <h2>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
          <div class="meta">
            <p>Date: ${selectedDate} | Session: ${selectedSession} | Generated: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${reportData.length}</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}<th class="signature-col">Hm/Ahm Sign</th></tr>
            </thead>
            <tbody>
              ${reportData.map((row: Record<string, unknown>) =>
                `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}<td></td></tr>`
              ).join('')}
              ${reportType === 'daily' && totals ? `
                <tr class="total-row">
                  <td>TOTAL</td>
                  ${Object.keys(totals).map(key => `<td>${totals[key]}</td>`).join('')}
                  <td></td>
                </tr>
              ` : ''}
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
      showToast('error', 'Print failed.');
    }
  };

  const reportTypes = [
    { value: 'daily', label: 'Daily Report' }, 
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'house', label: 'House Report' }, 
    { value: 'absent', label: 'Absent' },
    { value: 'sick', label: 'Sick' }, 
    { value: 'od', label: 'OD' }, 
    { value: 'staffward', label: 'Staff Ward' },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{school?.name || 'Reports'}</h1>
          <p className="text-gray-500 text-sm">Generate and export reports</p>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(reportType === 'daily' || reportType === 'absent' || reportType === 'sick' || reportType === 'od' || reportType === 'staffward') && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          )}
          {reportType === 'monthly' && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Month</label><input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="Both">Both (Morning + Night)</option>
              <option value="Morning">Morning Only</option>
              <option value="Night">Night Only</option>
            </select>
          </div>
          {isAdmin && (reportType === 'monthly' || reportType === 'absent' || reportType === 'sick' || reportType === 'od' || reportType === 'staffward') && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1">House</label><select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">All</option>{houses.map((h: any) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            {school?.name || 'School'} - {reportTypes.find(r => r.value === reportType)?.label} - {reportData.length} records
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{reportData.length > 0 && Object.keys(reportData[0] as Record<string, unknown>).map(key => <th key={key} className="text-left px-4 py-3 font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th>)}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hm/Ahm Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((row: Record<string, unknown>, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">{Object.values(row).map((val, i) => <td key={i} className="px-4 py-3 text-gray-700">{String(val)}</td>)}<td className="px-4 py-3"></td></tr>
              ))}
              {reportType === 'daily' && totals && (
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 text-gray-900">TOTAL</td>
                  {Object.keys(totals).map(key => <td key={key} className="px-4 py-3 text-gray-900">{totals[key]}</td>)}
                  <td className="px-4 py-3"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && <div className="text-center py-10 text-gray-500">No data available</div>}
      </div>
    </div>
  );
}
