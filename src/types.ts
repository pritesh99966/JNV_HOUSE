export type AttendanceStatus = 'Present' | 'Leave' | 'Sick' | 'OD' | 'Staff Ward';
export type AttendanceSession = 'Morning' | 'Night';
export type UserRole = 'admin' | 'warden' | 'master';

export interface House {
  id: string;
  house_name: string;
  category: string;
  gender: string;
  status: string;
  created_at: string;
}

export interface Warden {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  assigned_house_id: string;
  status: string;
  photo_url: string;
  created_at: string;
}

export interface Student {
  id: string;
  admission_no: string;
  student_name: string;
  gender: string;
  class: string;
  section: string;
  dob: string;
  father_name: string;
  mother_name: string;
  mobile: string;
  house_id: string;
  bed_no: string;
  sr_no: string;
  photo_url: string;
  medical_remark: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  house_id: string;
  attendance_date: string;
  session: AttendanceSession;
  status: AttendanceStatus;
  remark: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  admin_username: string;
  admin_password: string;
  admin_name: string;
  admin_email: string;
  created_at: string;
  status: string;
  licence_start_date?: string;
  licence_expiry_date?: string;
  licence_status?: string;
  last_login?: string;
  total_time_spent?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  assigned_house_id?: string;
  email?: string;
  school_id?: string;
  school_name?: string;
}
