import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Users, Building2, Activity, School as SchoolIcon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SchoolAnalytics() {
  const { schools, students, wardens, houses, attendance } = useData();

  const schoolStats = useMemo(() => {
    return schools.map((school: any) => {
      const schoolStudents = students.filter((s: any) => s.school_id === school.id || !s.school_id).length;
      const schoolWardens = wardens.filter((w: any) => w.school_id === school.id || !w.school_id).length;
      const schoolHouses = houses.filter((h: any) => h.school_id === school.id || !h.school_id).length;
      const schoolAttendance = attendance.filter((a: any) => a.school_id === school.id || !a.school_id).length;
      
      // Calculate licence days remaining
      let daysRemaining = 0;
      if (school.licence_expiry_date) {
        const today = new Date();
        const expiry = new Date(school.licence_expiry_date);
        const diffTime = expiry.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      return {
        ...school,
        studentCount: schoolStudents,
        wardenCount: schoolWardens,
        houseCount: schoolHouses,
        attendanceCount: schoolAttendance,
        daysRemaining,
        licenceStatus: daysRemaining > 30 ? 'Active' : daysRemaining > 0 ? 'Expiring Soon' : 'Expired'
      };
    });
  }, [schools, students, wardens, houses, attendance]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">School Analytics</h1>
        <p className="text-gray-500 text-sm">Monitor all schools and their activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SchoolIcon className="w-6 h-6 text-purple-600" />
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
                <th className="text-center px-4 py-3 font-medium text-gray-600">House Masters</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Houses</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Licence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time Spent</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
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
                      <Building2 className="w-3 h-3" />
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
                    {school.last_login ? new Date(school.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {school.total_time_spent ? `${Math.floor(school.total_time_spent / 60)}h ${school.total_time_spent % 60}m` : '0h 0m'}
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      school.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {school.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
