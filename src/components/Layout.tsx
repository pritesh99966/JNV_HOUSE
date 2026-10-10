import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ClipboardList, History, FileText, Settings, LogOut, Menu, X, ChevronDown, Building2, Shield, GraduationCap, Home, BarChart3 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { houses } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const assignedHouse = houses.find((h: { id: string }) => h.id === user?.assigned_house_id);
  
  const adminMenu = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/houses', icon: Building2, label: 'Houses' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/wardens', icon: UserCheck, label: 'Wardens' },
    { path: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/admin/attendance-history', icon: History, label: 'Attendance History' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/student-report', icon: BarChart3, label: 'Student Report' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];
  
  const wardenMenu = [
    { path: '/warden', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/warden/students', icon: Users, label: 'My Students' },
    { path: '/warden/attendance', icon: ClipboardList, label: 'Daily Attendance' },
    { path: '/warden/attendance-history', icon: History, label: 'Attendance History' },
    { path: '/warden/reports', icon: FileText, label: 'Reports' },
    { path: '/warden/student-report', icon: BarChart3, label: 'Student Report' },
    { path: '/warden/profile', icon: Shield, label: 'My Profile' },
  ];
  
  const menu = isAdmin ? adminMenu : wardenMenu;
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-sm font-bold">Hostel Management</h1>
              {user?.school_name && <p className="text-xs text-yellow-300">{user.school_name}</p>}
              <p className="text-xs text-indigo-300">Attendance System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white"><X className="w-5 h-5" /></button>
        </div>
        {assignedHouse && (
          <div className="px-4 py-3 bg-indigo-800/50 border-b border-indigo-700">
            <p className="text-xs text-indigo-300">Assigned House</p>
            <p className="text-sm font-semibold text-yellow-400">{assignedHouse.house_name}</p>
          </div>
        )}
        <nav className="mt-4 px-2 space-y-1">
          {menu.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === item.path ? 'bg-white/20 text-white font-medium' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-indigo-200 hover:bg-red-500/20 hover:text-red-200 transition-colors">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu className="w-6 h-6" /></button>
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.school_name ? `${user.school_name} - ` : ''}
                {isAdmin ? 'School Admin Panel' : `${assignedHouse?.house_name || 'Warden'} Panel`}
              </span>
            </div>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{user?.name?.charAt(0) || 'A'}</div>
                <div className="hidden sm:block text-left"><p className="text-sm font-medium text-gray-700">{user?.name}</p><p className="text-xs text-gray-500 capitalize">{user?.role}</p></div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email || user?.username}</p>
                    {user?.school_name && <p className="text-xs text-purple-600 mt-1">{user.school_name}</p>}
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
