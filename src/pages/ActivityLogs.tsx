import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getSchoolActivityLogs } from '../utils/schoolManagement';
import { Activity, User, Clock, Filter, Download } from 'lucide-react';

export default function ActivityLogs() {
  const { user } = useAuth();
  const { wardens } = useData();
  const schoolId = user?.school_id || '';
  
  const [filterWarden, setFilterWarden] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const logs = useMemo(() => {
    let schoolLogs = getSchoolActivityLogs(schoolId, 500);
    
    if (filterWarden) {
      schoolLogs = schoolLogs.filter(log => log.user_id === filterWarden);
    }
    
    if (filterAction) {
      schoolLogs = schoolLogs.filter(log => log.action === filterAction);
    }
    
    if (filterDate) {
      schoolLogs = schoolLogs.filter(log => log.timestamp.startsWith(filterDate));
    }
    
    return schoolLogs;
  }, [schoolId, filterWarden, filterAction, filterDate]);

  const uniqueActions = useMemo(() => {
    const allLogs = getSchoolActivityLogs(schoolId, 1000);
    const actions = [...new Set(allLogs.map(log => log.action))];
    return actions.sort();
  }, [schoolId]);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      'LOGIN': 'bg-blue-100 text-blue-700',
      'LOGOUT': 'bg-gray-100 text-gray-700',
      'ATTENDANCE_MARKED': 'bg-green-100 text-green-700',
      'STUDENT_ADDED': 'bg-purple-100 text-purple-700',
      'STUDENT_UPDATED': 'bg-indigo-100 text-indigo-700',
      'STUDENT_DELETED': 'bg-red-100 text-red-700',
      'STUDENT_IMPORTED': 'bg-yellow-100 text-yellow-700',
      'HOUSE_ADDED': 'bg-teal-100 text-teal-700',
      'WARDEN_ADDED': 'bg-pink-100 text-pink-700',
      'REPORT_GENERATED': 'bg-orange-100 text-orange-700'
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

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Details'].join(','),
      ...logs.map(log => [
        formatTimestamp(log.timestamp),
        log.user_name,
        log.user_role,
        log.action,
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-gray-500 text-sm">Track all warden activities and system events</p>
        </div>
        <button 
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Warden</label>
            <select 
              value={filterWarden}
              onChange={e => setFilterWarden(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Wardens</option>
              {wardens.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Action</label>
            <select 
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Date</label>
            <input 
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
        {(filterWarden || filterAction || filterDate) && (
          <button 
            onClick={() => { setFilterWarden(''); setFilterAction(''); setFilterDate(''); }}
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
            Recent Activities ({logs.length})
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
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
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
