export type AttendanceStatus = 'Present' | 'Absent' | 'Sick' | 'OD' | 'Staff Ward';
export type UserRole = 'admin' | 'warden';
export type HouseCategory = 'Senior Boys' | 'Junior Boys' | 'Girls';
export type Gender = 'Male' | 'Female';
export type HouseStatus = 'Active' | 'Inactive';
export type WardenStatus = 'Active' | 'Inactive';
export type StudentStatus = 'Active' | 'Inactive';

export interface House {
  id: string;
  house_name: string;
  category: HouseCategory;
  gender: Gender;
  status: HouseStatus;
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
  status: WardenStatus;
  photo_url: string;
  created_at: string;
}

export interface Student {
  id: string;
  admission_no: string;
  student_name: string;
  gender: Gender;
  class: string;
  section: string;
  dob: string;
  father_name: string;
  mother_name: string;
  mobile: string;
  house_id: string;
  room_no: string;
  roll_no: string;
  photo_url: string;
  medical_remark: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  house_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  remark: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  assigned_house_id?: string;
  email?: string;
}
