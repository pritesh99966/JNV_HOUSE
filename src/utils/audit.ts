/**
 * Audit Logging System
 * Tracks all important actions for security and compliance
 */

import { AuditLog } from '../types';

// Get current user info for audit
function getCurrentUserInfo(): { user_id: string; user_name: string; user_role: string; school_id?: string; school_name?: string } {
  const userStr = localStorage.getItem('hms_current_user');
  if (!userStr) {
    return { user_id: 'anonymous', user_name: 'Anonymous', user_role: 'unknown' };
  }
  
  const user = JSON.parse(userStr);
  return {
    user_id: user.id || 'unknown',
    user_name: user.name || 'Unknown',
    user_role: user.role || 'unknown',
    school_id: user.school_id,
    school_name: user.school_name
  };
}

// Create audit log entry
export function createAuditLog(
  action: string,
  resource_type: string,
  resource_id: string | undefined,
  details: string
): void {
  const userInfo = getCurrentUserInfo();
  
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    user_id: userInfo.user_id,
    user_name: userInfo.user_name,
    user_role: userInfo.user_role,
    school_id: userInfo.school_id,
    school_name: userInfo.school_name,
    action,
    resource_type,
    resource_id,
    details
  };
  
  // Store audit logs
  const logs = JSON.parse(localStorage.getItem('hms_audit_logs') || '[]');
  logs.push(log);
  
  // Keep only last 5000 logs to prevent storage overflow
  if (logs.length > 5000) {
    logs.splice(0, logs.length - 5000);
  }
  
  localStorage.setItem('hms_audit_logs', JSON.stringify(logs));
}

// Get audit logs with filters
export function getAuditLogs(filters?: {
  school_id?: string;
  user_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}): AuditLog[] {
  const logs = JSON.parse(localStorage.getItem('hms_audit_logs') || '[]') as AuditLog[];
  
  let filtered = logs;
  
  if (filters?.school_id) {
    filtered = filtered.filter(log => log.school_id === filters.school_id);
  }
  
  if (filters?.user_id) {
    filtered = filtered.filter(log => log.user_id === filters.user_id);
  }
  
  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }
  
  if (filters?.resource_type) {
    filtered = filtered.filter(log => log.resource_type === filters.resource_type);
  }
  
  if (filters?.start_date) {
    filtered = filtered.filter(log => log.timestamp >= filters.start_date!);
  }
  
  if (filters?.end_date) {
    filtered = filtered.filter(log => log.timestamp <= filters.end_date!);
  }
  
  // Sort by timestamp descending (newest first)
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Export audit logs to CSV
export function exportAuditLogsToCSV(logs: AuditLog[]): string {
  const headers = ['Timestamp', 'User', 'Role', 'School', 'Action', 'Resource Type', 'Resource ID', 'Details'];
  const rows = logs.map(log => [
    log.timestamp,
    log.user_name,
    log.user_role,
    log.school_name || 'N/A',
    log.action,
    log.resource_type,
    log.resource_id || '',
    log.details
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csv;
}

// Clear old audit logs (keep last N days)
export function clearOldAuditLogs(daysToKeep: number = 90): number {
  const logs = JSON.parse(localStorage.getItem('hms_audit_logs') || '[]') as AuditLog[];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoff = cutoffDate.toISOString();
  
  const filtered = logs.filter(log => log.timestamp >= cutoff);
  const removed = logs.length - filtered.length;
  
  localStorage.setItem('hms_audit_logs', JSON.stringify(filtered));
  
  return removed;
}

// Audit log action constants
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  
  // School Management
  SCHOOL_CREATE: 'SCHOOL_CREATE',
  SCHOOL_UPDATE: 'SCHOOL_UPDATE',
  SCHOOL_DELETE: 'SCHOOL_DELETE',
  SCHOOL_ACTIVATE: 'SCHOOL_ACTIVATE',
  SCHOOL_SUSPEND: 'SCHOOL_SUSPEND',
  
  // Licence Management
  LICENCE_CREATE: 'LICENCE_CREATE',
  LICENCE_UPDATE: 'LICENCE_UPDATE',
  LICENCE_RENEW: 'LICENCE_RENEW',
  LICENCE_SUSPEND: 'LICENCE_SUSPEND',
  
  // House Management
  HOUSE_CREATE: 'HOUSE_CREATE',
  HOUSE_UPDATE: 'HOUSE_UPDATE',
  HOUSE_DELETE: 'HOUSE_DELETE',
  
  // Warden Management
  WARDEN_CREATE: 'WARDEN_CREATE',
  WARDEN_UPDATE: 'WARDEN_UPDATE',
  WARDEN_DELETE: 'WARDEN_DELETE',
  WARDEN_ASSIGN: 'WARDEN_ASSIGN',
  
  // Student Management
  STUDENT_CREATE: 'STUDENT_CREATE',
  STUDENT_UPDATE: 'STUDENT_UPDATE',
  STUDENT_DELETE: 'STUDENT_DELETE',
  STUDENT_IMPORT: 'STUDENT_IMPORT',
  STUDENT_EXPORT: 'STUDENT_EXPORT',
  
  // Attendance
  ATTENDANCE_MARK: 'ATTENDANCE_MARK',
  ATTENDANCE_UPDATE: 'ATTENDANCE_UPDATE',
  ATTENDANCE_EXPORT: 'ATTENDANCE_EXPORT',
  
  // Reports
  REPORT_GENERATE: 'REPORT_GENERATE',
  REPORT_EXPORT: 'REPORT_EXPORT',
  
  // System
  DATA_RESET: 'DATA_RESET',
  BACKUP_CREATE: 'BACKUP_CREATE',
  BACKUP_RESTORE: 'BACKUP_RESTORE'
} as const;

// Resource type constants
export const RESOURCE_TYPES = {
  SCHOOL: 'school',
  LICENCE: 'licence',
  HOUSE: 'house',
  WARDEN: 'warden',
  STUDENT: 'student',
  ATTENDANCE: 'attendance',
  USER: 'user',
  REPORT: 'report',
  SYSTEM: 'system'
} as const;
