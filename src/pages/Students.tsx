import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { Search, Plus, Edit2, Trash2, X, CheckSquare, Square } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const { houses, students, addStudent, updateStudent, deleteStudent } = useData();
  const isAdmin = user?.role === 'admin';
  const assignedHouseId = user?.assigned_house_id || '';
  
  const [search, setSearch] = useState('');
  const [filterHouse, setFilterHouse] = useState(isAdmin ? '' : assignedHouseId);
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('Active');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const filteredStudents = students.filter((s: Student) => {
    if (!isAdmin && s.house_id !== assignedHouseId) return false;
    if (filterHouse && s.house_id !== filterHouse) return false;
    if (filterClass && s.class !== filterClass) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.student_name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q) || s.sr_no.includes(q);
    }
    return true;
  });

  const [formData, setFormData] = useState({
    admission_no: '', student_name: '', gender: 'Male' as 'Male' | 'Female',
    class: '', section: 'A', dob: '', father_name: '', mother_name: '', mobile: '',
    house_id: isAdmin ? '' : assignedHouseId, bed_no: '', sr_no: '',
    medical_remark: '', status: 'Active' as 'Active' | 'Inactive'
  });

  const openAddForm = () => {
    setEditingStudent(null);
    setFormData({
      admission_no: `ADM${String(Date.now()).slice(-5)}`, student_name: '', gender: 'Male',
      class: '', section: 'A', dob: '', father_name: '', mother_name: '', mobile: '',
      house_id: isAdmin ? '' : assignedHouseId, bed_no: '', sr_no: '',
      medical_remark: '', status: 'Active'
    });
    setShowForm(true);
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admission_no: student.admission_no, student_name: student.student_name, gender: student.gender,
      class: student.class, section: student.section, dob: student.dob, father_name: student.father_name,
      mother_name: student.mother_name, mobile: student.mobile, house_id: student.house_id,
      bed_no: student.bed_no, sr_no: student.sr_no,
      medical_remark: student.medical_remark, status: student.status
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.student_name || !formData.house_id || !formData.class) {
      setToast({ type: 'error', message: 'Please fill required fields' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const studentData = { ...formData, photo_url: '' };
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      setToast({ type: 'success', message: 'Student updated' });
    } else {
      addStudent(studentData);
      setToast({ type: 'success', message: 'Student added' });
    }
    setShowForm(false);
    setTimeout(() => setToast(null), 3000);
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleBulkActivate = () => {
    if (selectedStudents.length === 0) {
      setToast({ type: 'error', message: 'No students selected' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const count = selectedStudents.length;
    selectedStudents.forEach(id => {
      updateStudent(id, { status: 'Active' });
    });
    setSelectedStudents([]);
    setShowBulkActions(false);
    setToast({ type: 'success', message: `${count} students activated` });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBulkDeactivate = () => {
    if (selectedStudents.length === 0) {
      setToast({ type: 'error', message: 'No students selected' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const count = selectedStudents.length;
    selectedStudents.forEach(id => {
      updateStudent(id, { status: 'Inactive' });
    });
    setSelectedStudents([]);
    setShowBulkActions(false);
    setToast({ type: 'success', message: `${count} students deactivated` });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) {
      setToast({ type: 'error', message: 'No students selected' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedStudents.length} students? This cannot be undone.`)) {
      const count = selectedStudents.length;
      selectedStudents.forEach(id => {
        deleteStudent(id);
      });
      setSelectedStudents([]);
      setShowBulkActions(false);
      setToast({ type: 'success', message: `${count} students deleted` });
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
          {selectedStudents.length > 0 && (
            <button onClick={() => setShowBulkActions(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
              Bulk Actions ({selectedStudents.length})
            </button>
          )}
          <button onClick={openAddForm} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Student</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          {isAdmin && <select value={filterHouse} onChange={e => setFilterHouse(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="">All Houses</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select>}
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="">All Classes</option>{classes.map(c => <option key={c} value={c}>Class {c}</option>)}</select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button onClick={() => { setSearch(''); setFilterHouse(isAdmin ? '' : assignedHouseId); setFilterClass(''); setFilterStatus('Active'); }} className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-center px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sr No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Adm No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Bed No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">House</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.slice(0, 50).map((student: Student) => {
                const house = houses.find((h: { id: string }) => h.id === student.house_id);
                return (
                  <tr key={student.id} className={`hover:bg-gray-50 ${student.status === 'Inactive' ? 'opacity-60' : ''}`}>
                    <td className="text-center px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{student.sr_no}</td>
                    <td className="px-4 py-3"><span className="font-medium">{student.student_name}</span></td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{student.admission_no}</td>
                    <td className="px-4 py-3">{student.class}-{student.section}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{student.bed_no}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{house?.house_name}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><button onClick={() => openEditForm(student)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => setShowDeleteConfirm(student.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <div className="text-center py-10 text-gray-500">No students found</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b"><h2 className="text-lg font-bold">{editingStudent ? 'Edit Student' : 'Add Student'}</h2><button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={formData.student_name} onChange={e => setFormData({ ...formData, student_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Admission No</label><input type="text" value={formData.admission_no} onChange={e => setFormData({ ...formData, admission_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sr No</label><input type="text" value={formData.sr_no} onChange={e => setFormData({ ...formData, sr_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Class *</label><select value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select</option>{classes.map(c => <option key={c} value={c}>Class {c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Section</label><select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">DOB</label><input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label><input type="text" value={formData.father_name} onChange={e => setFormData({ ...formData, father_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label><input type="text" value={formData.mother_name} onChange={e => setFormData({ ...formData, mother_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label><input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">House *</label><select value={formData.house_id} onChange={e => setFormData({ ...formData, house_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!isAdmin}><option value="">Select</option>{houses.map((h: { id: string; house_name: string }) => <option key={h.id} value={h.id}>{h.house_name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bed No</label><input type="text" value={formData.bed_no} onChange={e => setFormData({ ...formData, bed_no: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., B001" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Medical Remark</label><input type="text" value={formData.medical_remark} onChange={e => setFormData({ ...formData, medical_remark: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{editingStudent ? 'Update' : 'Add'}</button></div>
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

      {showBulkActions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Bulk Actions</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedStudents.length} students selected</p>
            <div className="space-y-2">
              <button onClick={handleBulkActivate} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Activate All</button>
              <button onClick={handleBulkDeactivate} className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">Deactivate All</button>
              <button onClick={handleBulkDelete} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete All</button>
              <button onClick={() => setShowBulkActions(false)} className="w-full px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
