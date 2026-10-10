import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditLog } from '../types';
import { getAuditLogs, exportAuditLogsToCSV, clearOldAuditLogs } from '../utils/audit';
import { Download, Filter, Trash2, Search } from 'lucide-react';

export default function AuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    school_id: '',
    user_role: '',
    action: '',
    start_date: '',
    end_date: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = () => {
    const filteredLogs = getAuditLogs({
      school_id: filters.school_id || undefined,
      action: filters.action || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined
    });

    // Filter by role if specified
    let result = filteredLogs;
    if (filters.user_role) {
      result = result.filter(log => log.user_role === filters.user_role);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(log => 
        log.user_name.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.resource_type.toLowerCase().includes(searchTerm)
      );
    }

    setLogs(result);
  };

  const handleExport = () => {
    const csv = exportAuditLogsToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearOld = () => {
    if (confirm('Are you sure you want to clear audit logs older than 90 days? This action cannot be undone.')) {
      const removed = clearOldAuditLogs(90);
      alert(`${removed} old audit logs cleared successfully.`);
      loadLogs();
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN_SUCCESS: 'bg-green-100 text-green-700',
      LOGIN_FAILED: 'bg-red-100 text-red-700',
      LOGOUT: 'bg-gray-100 text-gray-700',
      SCHOOL_CREATE: 'bg-blue-100 text-blue-700',
      SCHOOL_UPDATE: 'bg-blue-100 text-blue-700',
      SCHOOL_DELETE: 'bg-red-100 text-red-700',
      LICENCE_CREATE: 'bg-purple-100 text-purple-700',
      LICENCE_UPDATE: 'bg-purple-100 text-purple-700',
      HOUSE_CREATE: 'bg-indigo-100 text-indigo-700',
      HOUSE_UPDATE: 'bg-indigo-100 text-indigo-700',
      HOUSE_DELETE: 'bg-red-100 text-red-700',
      WARDEN_CREATE: 'bg-yellow-100 text-yellow-700',
      WARDEN_UPDATE: 'bg-yellow-100 text-yellow-700',
      WARDEN_DELETE: 'bg-red-100 text-red-700',
      STUDENT_CREATE: 'bg-teal-100 text-teal-700',
      STUDENT_UPDATE: 'bg-teal-100 text-teal-700',
      STUDENT_DELETE: 'bg-red-100 text-red-700',
      ATTENDANCE_MARK: 'bg-orange-100 text-orange-700',
      ATTENDANCE_UPDATE: 'bg-orange-100 text-orange-700',
    };

    const color = colors[action] || 'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{action}</span>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      master: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      warden: 'bg-green-100 text-green-700'
    };
    const color = colors[role] || 'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{role}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Track all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleClearOld} 
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" /> Clear Old Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select 
            value={filters.user_role} 
            onChange={e => setFilters({ ...filters, user_role: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            <option value="master">Master</option>
            <option value="admin">School Admin</option>
            <option value="warden">Warden</option>
          </select>
          <input 
            type="date" 
            value={filters.start_date} 
            onChange={e => setFilters({ ...filters, start_date: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="Start Date"
          />
          <input 
            type="date" 
            value={filters.end_date} 
            onChange={e => setFilters({ ...filters, end_date: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="End Date"
          />
          <button 
            onClick={() => setFilters({ school_id: '', user_role: '', action: '', start_date: '', end_date: '' })}
            className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Activity Log ({logs.length} entries)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">School</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.slice(0, 100).map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.user_name}</td>
                  <td className="px-4 py-3">{getRoleBadge(log.user_role)}</td>
                  <td className="px-4 py-3 text-gray-600">{log.school_name || 'System'}</td>
                  <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{log.resource_type}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-10 text-gray-500">No audit logs found</div>
        )}
        {logs.length > 100 && (
          <div className="p-3 text-center text-sm text-gray-500 border-t">
            Showing 100 of {logs.length} logs. Export to CSV to view all.
          </div>
        )}
      </div>
    </div>
  );
}
