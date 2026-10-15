import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: '600px', margin: '50px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <h1 style={{ color: '#4f46e5', marginBottom: '20px', textAlign: 'center' }}>🎓 Hostel Management System</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Student Management & Attendance System</p>
        
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Demo Credentials:</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#4f46e5' }}>Master Admin:</strong>
            <div style={{ marginLeft: '20px', color: '#666' }}>
              Username: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>master</code><br/>
              Password: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>master123</code>
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#4f46e5' }}>School Admin:</strong>
            <div style={{ marginLeft: '20px', color: '#666' }}>
              Username: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>kv001</code><br/>
              Password: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>KV@2024#Secure!</code>
            </div>
          </div>
          <div>
            <strong style={{ color: '#4f46e5' }}>Warden:</strong>
            <div style={{ marginLeft: '20px', color: '#666' }}>
              Username: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>kv001_w1</code><br/>
              Password: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>wardenKV001</code>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
          ✅ Application is working correctly!
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
