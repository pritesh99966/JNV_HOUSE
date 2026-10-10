import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { House, Warden, Student, Attendance, AttendanceStatus, AttendanceSession, School } from '../types';
import { getInitialData, saveToStorage, getSchoolData, saveSchoolData } from '../data/seedData';
import { useAuth } from './AuthContext';

interface DataContextType {
  schools: School[];
  houses: House[]; wardens: Warden[]; students: Student[]; attendance: Attendance[];
  currentSchoolId: string | null;
  addSchool: (school: Omit<School, 'id' | 'created_at'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  addHouse: (house: Omit<House, 'id' | 'created_at'>) => void;
  updateHouse: (id: string, house: Partial<House>) => void;
  deleteHouse: (id: string) => void;
  addWarden: (warden: Omit<Warden, 'id' | 'created_at'>) => void;
  updateWarden: (id: string, warden: Partial<Warden>) => void;
  deleteWarden: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkImportStudents: (students: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]) => void;
  saveAttendance: (studentId: string, houseId: string, date: string, session: AttendanceSession, status: AttendanceStatus, remark: string, markedBy: string) => boolean;
  bulkSaveAttendance: (records: { student_id: string; house_id: string; status: AttendanceStatus; remark: string }[], date: string, session: AttendanceSession, markedBy: string) => void;
  getAttendanceForDate: (houseId: string, date: string, session: AttendanceSession) => Attendance[];
  getStudentsByHouse: (houseId: string) => Student[];
  getAttendanceSummary: (houseId: string, date: string, session: AttendanceSession) => { present: number; absent: number; sick: number; od: number; staffWard: number; total: number };
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => getInitialData());
  const currentSchoolId = user?.school_id || null;
  
  // Load school-specific data when school changes
  useEffect(() => {
    if (currentSchoolId && user?.role !== 'master') {
      const schoolData = getSchoolData(currentSchoolId);
      setData({
        ...data,
        houses: schoolData.houses,
        wardens: schoolData.wardens,
        students: schoolData.students,
        attendance: schoolData.attendance
      });
    }
  }, [currentSchoolId]);
  
  const refreshData = useCallback(() => { 
    const initialData = getInitialData();
    if (currentSchoolId && user?.role !== 'master') {
      const schoolData = getSchoolData(currentSchoolId);
      setData({
        ...initialData,
        houses: schoolData.houses,
        wardens: schoolData.wardens,
        students: schoolData.students,
        attendance: schoolData.attendance
      });
    } else {
      setData(initialData);
    }
  }, [currentSchoolId, user]);
  
  // School management functions (Master only)
  const addSchool = (school: Omit<School, 'id' | 'created_at'>) => {
    const newSchool: School = { ...school, id: `school${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...data.schools, newSchool];
    setData(d => ({ ...d, schools: updated }));
    localStorage.setItem('hms_schools', JSON.stringify(updated));
  };
  
  const updateSchool = (id: string, updates: Partial<School>) => {
    const updated = data.schools.map((s: School) => s.id === id ? { ...s, ...updates } : s);
    setData(d => ({ ...d, schools: updated }));
    localStorage.setItem('hms_schools', JSON.stringify(updated));
  };
  
  const deleteSchool = (id: string) => {
    const updated = data.schools.filter((s: School) => s.id !== id);
    setData(d => ({ ...d, schools: updated }));
    localStorage.setItem('hms_schools', JSON.stringify(updated));
    // Delete school-specific data
    localStorage.removeItem(`hms_${id}_houses`);
    localStorage.removeItem(`hms_${id}_wardens`);
    localStorage.removeItem(`hms_${id}_students`);
    localStorage.removeItem(`hms_${id}_attendance`);
  };

  // Helper function to save data based on user role
  const saveDataToStorage = (key: string, data: any) => {
    if (currentSchoolId && user?.role !== 'master') {
      // School admin - save to school-specific storage
      localStorage.setItem(`hms_${currentSchoolId}_${key}`, JSON.stringify(data));
    } else {
      // Master admin - save to general storage
      localStorage.setItem(`hms_${key}`, JSON.stringify(data));
    }
  };

  const addHouse = (house: Omit<House, 'id' | 'created_at'>) => {
    const newHouse: House = { ...house, id: `h${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...data.houses, newHouse]; 
    setData(d => ({ ...d, houses: updated })); 
    saveDataToStorage('houses', updated);
  };
  
  const updateHouse = (id: string, updates: Partial<House>) => {
    const updated = data.houses.map((h: House) => h.id === id ? { ...h, ...updates } : h); 
    setData(d => ({ ...d, houses: updated })); 
    saveDataToStorage('houses', updated);
  };
  
  const deleteHouse = (id: string) => {
    const updated = data.houses.filter((h: House) => h.id !== id); 
    setData(d => ({ ...d, houses: updated })); 
    saveDataToStorage('houses', updated);
  };
  
  const addWarden = (warden: Omit<Warden, 'id' | 'created_at'>) => {
    const newWarden: Warden = { ...warden, id: `w${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...data.wardens, newWarden]; 
    setData(d => ({ ...d, wardens: updated })); 
    saveDataToStorage('wardens', updated);
  };
  
  const updateWarden = (id: string, updates: Partial<Warden>) => {
    const updated = data.wardens.map((w: Warden) => w.id === id ? { ...w, ...updates } : w); 
    setData(d => ({ ...d, wardens: updated })); 
    saveDataToStorage('wardens', updated);
  };
  
  const deleteWarden = (id: string) => {
    const updated = data.wardens.filter((w: Warden) => w.id !== id); 
    setData(d => ({ ...d, wardens: updated })); 
    saveDataToStorage('wardens', updated);
  };
  
  const addStudent = (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newStudent: Student = { ...student, id: `s${Date.now()}`, created_at: now, updated_at: now };
    const updated = [...data.students, newStudent]; 
    setData(d => ({ ...d, students: updated })); 
    saveDataToStorage('students', updated);
  };
  
  const bulkImportStudents = (studentsList: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]) => {
    const now = new Date().toISOString();
    const newStudents: Student[] = studentsList.map((s, i) => ({ ...s, id: `s${Date.now()}_${i}`, created_at: now, updated_at: now }));
    const updated = [...data.students, ...newStudents]; 
    setData(d => ({ ...d, students: updated })); 
    saveDataToStorage('students', updated);
  };
  
  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = data.students.map((s: Student) => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s);
    setData(d => ({ ...d, students: updated })); 
    saveDataToStorage('students', updated);
  };
  
  const deleteStudent = (id: string) => {
    const updated = data.students.filter((s: Student) => s.id !== id); 
    setData(d => ({ ...d, students: updated })); 
    saveDataToStorage('students', updated);
  };
  const saveAttendance = (studentId: string, houseId: string, date: string, session: AttendanceSession, status: AttendanceStatus, remark: string, markedBy: string): boolean => {
    const existing = data.attendance.find((a: Attendance) => a.student_id === studentId && a.attendance_date === date && a.session === session);
    const now = new Date().toISOString();
    if (existing) {
      const updated = data.attendance.map((a: Attendance) => a.student_id === studentId && a.attendance_date === date && a.session === session ? { ...a, status, remark, marked_by: markedBy, updated_at: now } : a);
      setData(d => ({ ...d, attendance: updated })); 
      saveDataToStorage('attendance', updated);
    } else {
      const newRecord: Attendance = { id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, student_id: studentId, house_id: houseId, attendance_date: date, session, status, remark, marked_by: markedBy, created_at: now, updated_at: now };
      const updated = [...data.attendance, newRecord]; 
      setData(d => ({ ...d, attendance: updated })); 
      saveDataToStorage('attendance', updated);
    }
    return true;
  };
  
  const bulkSaveAttendance = (records: { student_id: string; house_id: string; status: AttendanceStatus; remark: string }[], date: string, session: AttendanceSession, markedBy: string) => {
    const now = new Date().toISOString();
    let updatedAttendance = [...data.attendance];
    records.forEach(record => {
      const existingIdx = updatedAttendance.findIndex((a: Attendance) => a.student_id === record.student_id && a.attendance_date === date && a.session === session);
      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = { ...updatedAttendance[existingIdx], status: record.status, remark: record.remark, marked_by: markedBy, updated_at: now };
      } else {
        updatedAttendance.push({ id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, student_id: record.student_id, house_id: record.house_id, attendance_date: date, session, status: record.status, remark: record.remark, marked_by: markedBy, created_at: now, updated_at: now });
      }
    });
    setData(d => ({ ...d, attendance: updatedAttendance })); 
    saveDataToStorage('attendance', updatedAttendance);
  };
  const getAttendanceForDate = (houseId: string, date: string, session: AttendanceSession): Attendance[] => data.attendance.filter((a: Attendance) => a.house_id === houseId && a.attendance_date === date && a.session === session);
  const getStudentsByHouse = (houseId: string): Student[] => data.students.filter((s: Student) => s.house_id === houseId && s.status === 'Active');
  const getAttendanceSummary = (houseId: string, date: string, session: AttendanceSession) => {
    const records = data.attendance.filter((a: Attendance) => a.house_id === houseId && a.attendance_date === date && a.session === session);
    const activeStudents = data.students.filter((s: Student) => s.house_id === houseId && s.status === 'Active');
    return {
      present: records.filter((r: Attendance) => r.status === 'Present').length,
      absent: records.filter((r: Attendance) => r.status === 'Absent').length,
      sick: records.filter((r: Attendance) => r.status === 'Sick').length,
      od: records.filter((r: Attendance) => r.status === 'OD').length,
      staffWard: records.filter((r: Attendance) => r.status === 'Staff Ward').length,
      total: activeStudents.length,
    };
  };

  return (
    <DataContext.Provider value={{ 
      schools: data.schools,
      houses: data.houses, 
      wardens: data.wardens, 
      students: data.students, 
      attendance: data.attendance,
      currentSchoolId,
      addSchool,
      updateSchool,
      deleteSchool,
      addHouse, 
      updateHouse, 
      deleteHouse, 
      addWarden, 
      updateWarden, 
      deleteWarden, 
      addStudent, 
      updateStudent, 
      deleteStudent, 
      bulkImportStudents, 
      saveAttendance, 
      bulkSaveAttendance, 
      getAttendanceForDate, 
      getStudentsByHouse, 
      getAttendanceSummary, 
      refreshData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
