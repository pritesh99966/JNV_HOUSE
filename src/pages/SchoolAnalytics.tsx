import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  updateSchoolLicence, 
  getLicenceDaysRemaining, 
  formatLastLogin, 
  formatTimeSpent 
} from '../utils/schoolManagement';
import { Calendar, Clock, Users, Activity, Edit2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SchoolAnalytics() {
  const { schools, students, wardens, houses } = useData();
  const [editingSchool, setEditingSchool] = useState<string | null>(null);
  const [licenceForm, setLicenceForm] = useState({
    start_date: '',
    expiry_date: '',
    status: 'Active' as 'Active' | 'Expired' | 'Suspended'
  });
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const schoolStats = useMemo(() => {
    return schools.map(school => {
      const schoolStudents = students.filter((s: any) => s.school_id === school.id || !s.school_id).length;
      const schoolWardens = wardens.filter((w: any) => w.school_id === school.id || !w.school_id).length;
      const schoolHouses = houses.filter((h: any) => h.school_id === school.id || !h.school_id).length;
      const daysRemaining = getLicenceDaysRemaining(school.id);
      
      return {
        ...school,
        studentCount: schoolStudents,
        wardenCount: schoolWardens,
        houseCount: schoolHouses,
        daysRemaining,
        licenceStatus: daysRemaining > 30 ? 'Active' : daysRemaining > 0 ? 'Expiring Soon' : 'Expired'
      };
    });
  }, [schools, students, wardens, houses]);

  const handleEditLicence = (schoolId: string) => {
    const school = schools.find((s: any) => s.id === schoolId);
    if (school) {
      setLicenceForm({
        start_date: school.licence_start_date || new Date().toISOString().split('T')[0],
        expiry_date: school.licence_expiry_date || '',
        status: school.licence_status || 'Active'
      });
      setEditingSchool(schoolId);
    }
  };

  const handleSaveLicence = () => {
    if (!editingSchool || !licenceForm.start_date || !licenceForm.expiry_date) {
      setToast({ type: 'error', message: 'Please fill all fields' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    updateSchoolLicence(editingSchool, licenceForm.start_date, licenceForm.expiry_date, licenceForm.status);
    setToast({ type: 'success', message: 'Licence updated successfully' });
    setEditingSchool(null);
    setTimeout(() => setToast(null), 3000);
    window.location.reload();
  };

  const getLicenceColor = (days: number) => {
    if (days < 0) return 'text-red-600 bg-red-50';
    if (days < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getLicenceIcon = (days: number) => {
    if (days < 0) return <XCircle className="w-4 h-4" />;
    if (days < 30) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
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

      <div>
        <h1 className="text-2xl font-bold text-gray-800">School Analytics</h1>
        <p className="text-gray-500 text-sm">Monitor all schools and their activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
              <p className="text-xs text-gray-500">Total Schools</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{schoolStats.filter(s => s.daysRemaining > 0).length}</p>
              <p className="text-xs text-gray-500">Active Licences</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{schoolStats.filter(s => s.daysRemaining >= 0 && s.daysRemaining < 30).length}</p>
              <p className="text-xs text-gray-500">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">All Schools</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">School Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Students</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Wardens</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Houses</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Licence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time Spent</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schoolStats.map(school => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{school.name}</td>
                  <td className="px-4 py-3 text-gray-600">{school.code}</td>
                  <td className="text-center px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {school.studentCount}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {school.wardenCount}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                      {school.houseCount}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLicenceColor(school.daysRemaining)}`}>
                      {getLicenceIcon(school.daysRemaining)}
                      {school.daysRemaining < 0 ? 'Expired' : `${school.daysRemaining} days`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatLastLogin(school.last_login)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {formatTimeSpent(school.total_time_spent || 0)}
                    </div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <button 
                      onClick={() => handleEditLicence(school.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Licence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Licence Modal */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Edit School Licence</h2>
              <button onClick={() => setEditingSchool(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={licenceForm.start_date}
                  onChange={e => setLicenceForm({ ...licenceForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={licenceForm.expiry_date}
                  onChange={e => setLicenceForm({ ...licenceForm, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={licenceForm.status}
                  onChange={e => setLicenceForm({ ...licenceForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setEditingSchool(null)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button onClick={handleSaveLicence} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
