import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Simple test component
function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>React is Working!</h1>
      <p>If you can see this page, React is properly configured.</p>
      <button onClick={() => alert('Button works!')}>Click Me</button>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(username, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('hms_current_user') || '{}');
      if (user.role === 'master') window.location.href = '/master';
      else if (user.role === 'admin') window.location.href = '/admin';
      else window.location.href = '/warden';
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Hostel Management System</h1>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: '#fee', color: '#c33', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' }}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' }}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px', fontSize: '12px' }}>
          <strong>Demo Credentials:</strong><br/>
          Master: master / master123<br/>
          Admin: kv001 / KV@2024#Secure!<br/>
          Warden: kv001_w1 / wardenKV001
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Welcome, {user?.name}!</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Role: {user?.role} | School: {user?.school_name || 'N/A'}</p>
        </div>
        <button onClick={() => { logout(); window.location.href = '/login'; }} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>Total Students</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#333' }}>120</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>Total Houses</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#333' }}>12</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>Total Wardens</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#333' }}>12</p>
        </div>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '10px', color: 'white' }}>
          <h3 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Attendance</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>85%</p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Navigation Menu</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>📊 Dashboard</a>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>🏠 Houses</a>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>👨‍🎓 Students</a>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>👨‍💼 Wardens</a>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>✅ Attendance</a>
          <a href="#" style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', textDecoration: 'none', color: '#333', textAlign: 'center', border: '1px solid #dee2e6' }}>📈 Reports</a>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
      <Route path="/test" element={<TestPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Login />} />
      <Route path="/master" element={<ProtectedRoute requiredRole="master"><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
      <Route path="/warden" element={<ProtectedRoute requiredRole="warden"><Dashboard /></ProtectedRoute>} />
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
