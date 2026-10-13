import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import MasterDashboard from './pages/MasterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WardenDashboard from './pages/WardenDashboard';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Students from './pages/Students';
import Houses from './pages/Houses';
import Wardens from './pages/Wardens';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">This page is under construction. Please check back later.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getRedirectPath = () => {
    if (!user) return '/login';
    if (user.role === 'master') return '/master';
    if (user.role === 'admin') return '/admin';
    return '/warden';
  };

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Login />} />
      
      <Route path="/master" element={<ProtectedRoute requiredRole="master"><MasterDashboard /></ProtectedRoute>} />
      <Route path="/master/school-analytics" element={<ProtectedRoute requiredRole="master"><PlaceholderPage title="School Analytics" /></ProtectedRoute>} />
      <Route path="/master/settings" element={<ProtectedRoute requiredRole="master"><Settings /></ProtectedRoute>} />
      
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/houses" element={<ProtectedRoute requiredRole="admin"><Houses /></ProtectedRoute>} />
      <Route path="/admin/house/:id" element={<ProtectedRoute requiredRole="admin"><PlaceholderPage title="House Details" /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><Students /></ProtectedRoute>} />
      <Route path="/admin/wardens" element={<ProtectedRoute requiredRole="admin"><Wardens /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute>} />
      <Route path="/admin/attendance-history" element={<ProtectedRoute requiredRole="admin"><AttendanceHistory /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><PlaceholderPage title="Reports" /></ProtectedRoute>} />
      <Route path="/admin/student-report" element={<ProtectedRoute requiredRole="admin"><PlaceholderPage title="Student Report" /></ProtectedRoute>} />
      <Route path="/admin/activity-logs" element={<ProtectedRoute requiredRole="admin"><PlaceholderPage title="Activity Logs" /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
      
      <Route path="/warden" element={<ProtectedRoute requiredRole="warden"><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/students" element={<ProtectedRoute requiredRole="warden"><Students /></ProtectedRoute>} />
      <Route path="/warden/attendance" element={<ProtectedRoute requiredRole="warden"><Attendance /></ProtectedRoute>} />
      <Route path="/warden/attendance-history" element={<ProtectedRoute requiredRole="warden"><AttendanceHistory /></ProtectedRoute>} />
      <Route path="/warden/reports" element={<ProtectedRoute requiredRole="warden"><PlaceholderPage title="Reports" /></ProtectedRoute>} />
      <Route path="/warden/student-report" element={<ProtectedRoute requiredRole="warden"><PlaceholderPage title="Student Report" /></ProtectedRoute>} />
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
