import { School, ActivityLog } from '../types';

// Update school with licence details
export function updateSchoolLicence(
  schoolId: string, 
  startDate: string, 
  expiryDate: string,
  status: 'Active' | 'Expired' | 'Suspended' = 'Active'
): void {
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  const updatedSchools = schools.map(school => {
    if (school.id === schoolId) {
      return {
        ...school,
        licence_start_date: startDate,
        licence_expiry_date: expiryDate,
        licence_status: status,
        updated_at: new Date().toISOString()
      };
    }
    return school;
  });
  localStorage.setItem('hms_schools', JSON.stringify(updatedSchools));
}

// Get days remaining for licence
export function getLicenceDaysRemaining(schoolId: string): number {
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  const school = schools.find(s => s.id === schoolId);
  
  if (!school?.licence_expiry_date) return -1;
  
  const today = new Date();
  const expiry = new Date(school.licence_expiry_date);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Check if licence is valid
export function isLicenceValid(schoolId: string): boolean {
  const days = getLicenceDaysRemaining(schoolId);
  return days > 0;
}

// Update last login time
export function updateLastLogin(schoolId: string): void {
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  const updatedSchools = schools.map(school => {
    if (school.id === schoolId) {
      return {
        ...school,
        last_login: new Date().toISOString()
      };
    }
    return school;
  });
  localStorage.setItem('hms_schools', JSON.stringify(updatedSchools));
}

// Track time spent on portal
export function trackTimeSpent(schoolId: string, minutes: number): void {
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  const updatedSchools = schools.map(school => {
    if (school.id === schoolId) {
      return {
        ...school,
        total_time_spent: (school.total_time_spent || 0) + minutes
      };
    }
    return school;
  });
  localStorage.setItem('hms_schools', JSON.stringify(updatedSchools));
}

// Add activity log
export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  const logs = JSON.parse(localStorage.getItem('hms_activity_logs') || '[]') as ActivityLog[];
  const newLog: ActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // Add to beginning
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  
  localStorage.setItem('hms_activity_logs', JSON.stringify(logs));
}

// Get activity logs for a school
export function getSchoolActivityLogs(schoolId: string, limit: number = 100): ActivityLog[] {
  const logs = JSON.parse(localStorage.getItem('hms_activity_logs') || '[]') as ActivityLog[];
  return logs
    .filter(log => log.school_id === schoolId)
    .slice(0, limit);
}

// Get activity logs by user
export function getUserActivityLogs(userId: string, limit: number = 100): ActivityLog[] {
  const logs = JSON.parse(localStorage.getItem('hms_activity_logs') || '[]') as ActivityLog[];
  return logs
    .filter(log => log.user_id === userId)
    .slice(0, limit);
}

// Get all activity logs
export function getAllActivityLogs(limit: number = 100): ActivityLog[] {
  const logs = JSON.parse(localStorage.getItem('hms_activity_logs') || '[]') as ActivityLog[];
  return logs.slice(0, limit);
}

// Format time spent
export function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Format last login
export function formatLastLogin(dateString?: string): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
