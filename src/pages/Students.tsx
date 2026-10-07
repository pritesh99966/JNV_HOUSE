import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student, Gender, StudentStatus } from '../types';
import { Search, Plus, Edit2, Trash2, X, Upload, Download, Camera, User } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Students() {
  const { user } = useAuth();
  const { houses, students, addStudent, updateStudent, deleteStudent, bulkImportStudents } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  const [search, setSearch] = useState('');
  const [filterHouse, setFilterHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [filterClass, setFilterClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((s: Student) => {
      if (!isAdmin && s.house_id !== assignedHouseId) return false;
      if (filterHouse && s.house_id !== filterHouse) return false;
      if (filterClass && s.class !== filterClass) return false;
      if (search) { const q = search.toLowerCase(); return s.student_name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q) || (s.sr_no || '').includes(q); }
      return true;
    });
  }, [students, search, filterHouse, filterClass, isAdmin, assignedHouseId]);

  const [formData, setFormData] = useState({
    admission_no: '', student_name: '', gender: 'Male' as Gender, class: '', section: 'A',
    dob: '', father_name: '', mother_name: '', mobile: '',
    house_id: isAdmin ? '' : assignedHouseId, bed_no: '', sr_no: '',
    photo_url: '', medical_remark: '', status: 'Active' as StudentStatus
  });

  const openAddForm = () => {
    setEditingStudent(null);
    setFormData({
      admission_no: `ADM${String(Date.now()).slice(-5)}`, student_name: '', gender: 'Male',
      class: '', section: 'A', dob: '', father_name: '', mother_name: '', mobile: '',
      house_id: isAdmin ? '' : assignedHouseId, bed_no: '', sr_no: '',
      photo_url: '', medical_remark: '', status: 'Active'
    });
    setShowForm(true);
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admission_no: student.admission_no, student_name: student.student_name, gender: student.gender,
      class: student.class, section: student.section, dob: student.dob, father_name: student.father_name,
      mother_name: student.mother_name, mobile: student.mobile, house_id: student.house_id,
      bed_no: student.bed_no, sr_no: student.sr_no, photo_url: student.photo_url,
      medical_remark: student.medical_remark, status: student.status
    });
    setShowForm(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before storing to save localStorage space
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize to max 150x150 for thumbnail
          const maxSize = 150;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
          } else {
            if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          // Convert to JPEG with 0.6 quality for smaller size
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setFormData({ ...formData, photo_url: compressed });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.student_name || !formData.house_id || !formData.class) {
      setToast({ type: 'error', message: 'Please fill required fields' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setToast({ type: 'success', message: 'Student updated' });
    } else {
      addStudent(formData);
      setToast({ type: 'success', message: 'Student added' });
    }
    setShowForm(false);
    setTimeout(() => setToast(null), 3000);
  };

  // Excel Export
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      setToast({ type: 'error', message: 'No data to export' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      const exportData = filteredStudents.map((s: Student) => {
        const house = houses.find((h: { id: string }) => h.id === s.house_id);
        return {
          'Sr No': s.sr_no || '', 'Admission No': s.admission_no, 'Student Name': s.student_name,
          'Gender': s.gender, 'Class': s.class, 'Section': s.section, 'DOB': s.dob,
          'Father Name': s.father_name, 'Mother Name': s.mother_name, 'Mobile': s.mobile,
          'House': house?.house_name || '', 'Bed No': s.bed_no || '', 'Medical Remark': s.medical_remark, 'Status': s.status
        };
      });
      
      const headers = Object.keys(exportData[0]);
      let html = '<table border="1"><thead><tr>';
      headers.forEach(h => { html += `<th>${h}</th>`; });
      html += '</tr></thead><tbody>';
      exportData.forEach(row => {
        html += '<tr>';
        headers.forEach(h => { html += `<td>${(row as any)[h] || ''}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setToast({ type: 'success', message: 'Students exported successfully' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setToast({ type: 'error', message: 'Export failed. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Excel Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      
      const importedStudents = jsonData.map((row, index) => {
        const houseName = row['House'] || row['house'] || '';
        const house = houses.find((h: { house_name: string }) => h.house_name.toLowerCase() === houseName.toLowerCase());
        return {
          admission_no: row['Admission No'] || row['admission_no'] || `IMP${String(Date.now() + index).slice(-5)}`,
          student_name: row['Student Name'] || row['student_name'] || row['Name'] || '',
          gender: (row['Gender'] || row['gender'] || 'Male') as Gender,
          class: row['Class'] || row['class'] || '',
          section: row['Section'] || row['section'] || 'A',
          dob: row['DOB'] || row['dob'] || '',
          father_name: row['Father Name'] || row['father_name'] || '',
          mother_name: row['Mother Name'] || row['mother_name'] || '',
          mobile: row['Mobile'] || row['mobile'] || '',
          house_id: house?.id || (isAdmin ? '' : assignedHouseId),
          bed_no: row['Bed No'] || row['bed_no'] || '',
          sr_no: row['Sr No'] || row['sr_no'] || String(index + 1).padStart(2, '0'),
          photo_url: '',
          medical_remark: row['Medical Remark'] || row['medical_remark'] || '',
          status: 'Active' as StudentStatus,
        };
      }).filter(s => s.student_name && s.class);

      if (importedStudents.length > 0) {
        bulkImportStudents(importedStudents);
        setToast({ type: 'success', message: `${importedStudents.length} students imported successfully` });
        setShowImportModal(false);
      } else {
        setToast({ type: 'error', message: 'No valid students found in file' });
      }
      setTimeout(() => setToast(null), 3000);
    };
    reader.readAsBinaryString(file);
  };

  // Download template
  const downloadTemplate = () => {
    try {
      const template = [{
        'Sr No': '01', 'Admission No': 'ADM00001', 'Student Name': 'John Doe', 'Gender': 'Male',
        'Class': '10', 'Section': 'A', 'DOB': '2008-05-15', 'Father Name': 'Mr. Robert Doe',
        'Mother Name': 'Mrs. Jane Doe', 'Mobile': '9876543210', 'House': 'Aravalli Sr Boys',
        'Bed No': 'B001', 'Medical Remark': '', 'Status': 'Active'
      }];
      
      const headers = Object.keys(template[0]);
      let html = '<table border="1"><thead><tr>';
      headers.forEach(h => { html += `<th>${h}</th>`; });
      html += '</tr></thead><tbody>';
      template.forEach(row => {
        html += '<tr>';
        headers.forEach(h => { html += `<td>${(row as any)[h] || ''}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_template.xls';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      setToast({ type: 'error', message: 'Template download failed' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Students</h1><p className="text-gray-500 text-sm">{filteredStudents.length} students found</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Upload className="w-4 h-4" /> Import Excel</button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" /> Export Excel</button>
          <button onClick={openAddForm} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Student</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {isAdmin && <select value={filterHouse} onChange={e => setFilterHouse(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="">All Houses</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select>}
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="">All Classes</option>{classes.map(c => <option key={c} value={c}>Class {c}</option>)}</select>
          <button onClick={() => { setSearch(''); setFilterHouse(isAdmin ? '' : assignedHouseId); setFilterClass(''); }} className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Photo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sr No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Adm No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Bed No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">House</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.slice(0, 50).map((student: Student) => {
                const house = houses.find((h: { id: string }) => h.id === student.house_id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200" />
                      ) : (
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{student.student_name.charAt(0)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{student.sr_no || '-'}</td>
                    <td className="px-4 py-3"><span className="font-medium">{student.student_name}</span></td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{student.admission_no}</td>
                    <td className="px-4 py-3">{student.class}-{student.section}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{student.bed_no || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{house?.house_name}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => openEditForm(student)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => setShowDeleteConfirm(student.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <div className="text-center py-10 text-gray-500">No students found</div>}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="text-lg font-bold">{editingStudent ? 'Edit Student' : 'Add Student'}</h2><button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-5">
              {/* Photo Upload */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
                <div className="relative">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="" className="w-20 h-20 rounded-full object-cover border-3 border-indigo-300" />
                  ) : (
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-indigo-400" /></div>
                  )}
                  <button onClick={() => photoInputRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Student Photo</p>
                  <p className="text-xs text-gray-500">Click camera icon to upload photo</p>
                  {formData.photo_url && <button onClick={() => setFormData({ ...formData, photo_url: '' })} className="text-xs text-red-500 hover:underline mt-1">Remove photo</button>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={formData.student_name} onChange={e => setFormData({ ...formData, student_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Admission No</label><input type="text" value={formData.admission_no} onChange={e => setFormData({ ...formData, admission_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sr No</label><input type="text" value={formData.sr_no} onChange={e => setFormData({ ...formData, sr_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Class *</label><select value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select</option>{classes.map(c => <option key={c} value={c}>Class {c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Section</label><select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">DOB</label><input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label><input type="text" value={formData.father_name} onChange={e => setFormData({ ...formData, father_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label><input type="text" value={formData.mother_name} onChange={e => setFormData({ ...formData, mother_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label><input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">House *</label><select value={formData.house_id} onChange={e => setFormData({ ...formData, house_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!isAdmin}><option value="">Select</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bed No</label><input type="text" value={formData.bed_no} onChange={e => setFormData({ ...formData, bed_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., B001" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Medical Remark</label><input type="text" value={formData.medical_remark} onChange={e => setFormData({ ...formData, medical_remark: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as StudentStatus })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{editingStudent ? 'Update' : 'Add'}</button></div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="text-lg font-bold">Import Students from Excel</h2><button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">📋 Excel Format Required:</p>
                <p className="text-xs text-blue-600">Columns: Sr No, Admission No, Student Name, Gender, Class, Section, DOB, Father Name, Mother Name, Mobile, House, Bed No, Medical Remark</p>
              </div>
              <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 text-sm font-medium">
                <Download className="w-4 h-4" /> Download Template File
              </button>
              <div className="relative">
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  <Upload className="w-4 h-4" /> Select Excel File to Import
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">Supported: .xlsx, .xls, .csv</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Delete Student?</h3><p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3"><button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={() => { deleteStudent(showDeleteConfirm); setShowDeleteConfirm(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
