import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Activity, Clock, Download, Search, Filter } from 'lucide-react';

export default function SchoolActivityLogs() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const { schools } = useData();
  
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const school = schools.find((s: any) => s.id === schoolId);

  // Mock activity logs for school admin (in real app, these would come from backend)
  const mockLogs = useMemo(() => {
    const actions = [
      'LOGIN', 'LOGOUT', 'STUDENT_ADDED', 'STUDENT_UPDATED', 'STUDENT_DELETED',
      'STUDENT_IMPORTED', 'HOUSE_ADDED', 'HOUSE_UPDATED', 'WARDEN_ADDED',
      'WARDEN_UPDATED', 'ATTENDANCE_MARKED', 'REPORT_GENERATED', 'DATA_EXPORTED'
    ];
    
    const logs = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      logs.push({
        id: `log_${i}`,
        timestamp: date.toISOString(),
        user_id: school?.admin_username || 'unknown',
        user_name: school?.admin_name || 'Unknown Admin',
        user_role: 'admin',
        school_id: schoolId || '',
        action: action,
        details: `${action.replace('_', ' ')} activity performed`,
        ip_address: '192.168.1.' + Math.floor(Math.random() * 255)
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [school, schoolId]);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      if (filterAction && log.action !== filterAction) return false;
      if (filterDate && !log.timestamp.startsWith(filterDate)) return false;
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          log.user_name.toLowerCase().includes(searchTerm) ||
          log.action.toLowerCase().includes(searchTerm) ||
          log.details.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [mockLogs, filterAction, filterDate, search]);

  const uniqueActions = useMemo(() => {
    return [...new Set(mockLogs.map(log => log.action))].sort();
  }, [mockLogs]);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      'LOGIN': 'bg-blue-100 text-blue-700',
      'LOGOUT': 'bg-gray-100 text-gray-700',
      'STUDENT_ADDED': 'bg-green-100 text-green-700',
      'STUDENT_UPDATED': 'bg-yellow-100 text-yellow-700',
      'STUDENT_DELETED': 'bg-red-100 text-red-700',
      'STUDENT_IMPORTED': 'bg-purple-100 text-purple-700',
      'HOUSE_ADDED': 'bg-teal-100 text-teal-700',
      'HOUSE_UPDATED': 'bg-cyan-100 text-cyan-700',
      'WARDEN_ADDED': 'bg-pink-100 text-pink-700',
      'WARDEN_UPDATED': 'bg-rose-100 text-rose-700',
      'ATTENDANCE_MARKED': 'bg-indigo-100 text-indigo-700',
      'REPORT_GENERATED': 'bg-orange-100 text-orange-700',
      'DATA_EXPORTED': 'bg-amber-100 text-amber-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Details', 'IP Address'];
    let csv = headers.join(',') + '\n';
    
    filteredLogs.forEach(log => {
      csv += [
        formatTimestamp(log.timestamp),
        `"${log.user_name}"`,
        log.user_role,
        log.action,
        `"${log.details}"`,
        log.ip_address || ''
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_admin_logs_${school?.code || schoolId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!school) {
    return <div className="text-center py-10 text-gray-500">School not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Admin Activity Logs</h1>
          <p className="text-gray-500 text-sm">{school.name} ({school.code})</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        {(filterAction || filterDate || search) && (
          <button
            onClick={() => { setFilterAction(''); setFilterDate(''); setSearch(''); }}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Recent Activities ({filteredLogs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.slice(0, 100).map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {log.user_name.charAt(0)}
                      </div>
                      <span className="font-medium">{log.user_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium capitalize">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {log.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        )}
        {filteredLogs.length > 100 && (
          <div className="p-3 text-center text-sm text-gray-500 border-t">
            Showing 100 of {filteredLogs.length} logs. Export to CSV to view all.
          </div>
        )}
      </div>
    </div>
  );
}
