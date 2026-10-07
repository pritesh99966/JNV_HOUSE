import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WardenDashboard from './pages/WardenDashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Wardens from './pages/Wardens';
import Houses from './pages/Houses';
import Reports from './pages/Reports';
import StudentMonthlyReport from './pages/StudentMonthlyReport';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function HouseDetailsPage() {
  const { houses, students, attendance, wardens, getAttendanceSummary } = useData();
  const params = useParams();
  const houseId = params.id || '';
  const house = houses.find((h: { id: string }) => h.id === houseId);
  const today = new Date().toISOString().split('T')[0];
  const summary = getAttendanceSummary(houseId, today, 'Morning');
  const houseStudents = students.filter((s: { house_id: string; status: string }) => s.house_id === houseId && s.status === 'Active');
  const warden = wardens.find((w: { assigned_house_id: string }) => w.assigned_house_id === houseId);
  const todayAttendance = attendance.filter((a: { house_id: string; attendance_date: string }) => a.house_id === houseId && a.attendance_date === today);

  if (!house) return <div className="text-center py-10 text-gray-500">House not found</div>;

  const statusColors: Record<string, string> = {
    Present: 'bg-green-100 text-green-700',
    Absent: 'bg-red-100 text-red-700',
    Sick: 'bg-yellow-100 text-yellow-700',
    OD: 'bg-blue-100 text-blue-700',
    'Staff Ward': 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{house.house_name}</h1>
        <p className="text-gray-500 text-sm">Warden: {warden?.name || 'Not Assigned'} | {house.category} | {house.gender}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-gray-800">{summary.total}</p><p className="text-xs text-gray-500">Total</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-green-600">{summary.present}</p><p className="text-xs text-gray-500">Present</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-red-600">{summary.absent}</p><p className="text-xs text-gray-500">Absent</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-yellow-600">{summary.sick}</p><p className="text-xs text-gray-500">Sick</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-blue-600">{summary.od}</p><p className="text-xs text-gray-500">OD</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-2xl font-bold text-purple-600">{summary.staffWard}</p><p className="text-xs text-gray-500">Staff Ward</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Students ({houseStudents.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sr No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Bed No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Today's Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houseStudents.map(student => {
                const att = todayAttendance.find((a: { student_id: string }) => a.student_id === student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{student.sr_no || '-'}</td>
                    <td className="px-4 py-3 font-medium">{student.student_name}</td>
                    <td className="px-4 py-3">{student.class}-{student.section}</td>
                    <td className="px-4 py-3">{student.bed_no || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${att ? statusColors[att.status] : 'bg-gray-100 text-gray-500'}`}>
                        {att?.status || 'Not Marked'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/warden'} replace /> : <Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/houses" element={<ProtectedRoute requiredRole="admin"><Houses /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><Students /></ProtectedRoute>} />
      <Route path="/admin/wardens" element={<ProtectedRoute requiredRole="admin"><Wardens /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute>} />
      <Route path="/admin/attendance-history" element={<ProtectedRoute requiredRole="admin"><AttendanceHistory /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/student-report" element={<ProtectedRoute requiredRole="admin"><StudentMonthlyReport /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
      <Route path="/admin/house/:id" element={<ProtectedRoute requiredRole="admin"><HouseDetailsPage /></ProtectedRoute>} />
      
      {/* Warden Routes */}
      <Route path="/warden" element={<ProtectedRoute requiredRole="warden"><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/students" element={<ProtectedRoute requiredRole="warden"><Students /></ProtectedRoute>} />
      <Route path="/warden/attendance" element={<ProtectedRoute requiredRole="warden"><Attendance /></ProtectedRoute>} />
      <Route path="/warden/attendance-history" element={<ProtectedRoute requiredRole="warden"><AttendanceHistory /></ProtectedRoute>} />
      <Route path="/warden/reports" element={<ProtectedRoute requiredRole="warden"><Reports /></ProtectedRoute>} />
      <Route path="/warden/student-report" element={<ProtectedRoute requiredRole="warden"><StudentMonthlyReport /></ProtectedRoute>} />
      <Route path="/warden/profile" element={<ProtectedRoute requiredRole="warden"><Profile /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
