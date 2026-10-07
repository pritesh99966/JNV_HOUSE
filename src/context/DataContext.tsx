import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { House, Warden, Student, Attendance, AttendanceStatus } from '../types';
import { getInitialData, saveToStorage } from '../data/seedData';

interface DataContextType {
  houses: House[]; wardens: Warden[]; students: Student[]; attendance: Attendance[];
  addHouse: (house: Omit<House, 'id' | 'created_at'>) => void;
  updateHouse: (id: string, house: Partial<House>) => void;
  deleteHouse: (id: string) => void;
  addWarden: (warden: Omit<Warden, 'id' | 'created_at'>) => void;
  updateWarden: (id: string, warden: Partial<Warden>) => void;
  deleteWarden: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  saveAttendance: (studentId: string, houseId: string, date: string, status: AttendanceStatus, remark: string, markedBy: string) => boolean;
  bulkSaveAttendance: (records: { student_id: string; house_id: string; status: AttendanceStatus; remark: string }[], date: string, markedBy: string) => void;
  getAttendanceForDate: (houseId: string, date: string) => Attendance[];
  getStudentsByHouse: (houseId: string) => Student[];
  getAttendanceSummary: (houseId: string, date: string) => { present: number; absent: number; sick: number; od: number; staffWard: number; total: number };
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => getInitialData());
  const refreshData = useCallback(() => { setData(getInitialData()); }, []);

  const addHouse = (house: Omit<House, 'id' | 'created_at'>) => {
    const newHouse: House = { ...house, id: `h${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...data.houses, newHouse]; setData(d => ({ ...d, houses: updated })); saveToStorage('houses', updated);
  };
  const updateHouse = (id: string, updates: Partial<House>) => {
    const updated = data.houses.map((h: House) => h.id === id ? { ...h, ...updates } : h); setData(d => ({ ...d, houses: updated })); saveToStorage('houses', updated);
  };
  const deleteHouse = (id: string) => {
    const updated = data.houses.filter((h: House) => h.id !== id); setData(d => ({ ...d, houses: updated })); saveToStorage('houses', updated);
  };
  const addWarden = (warden: Omit<Warden, 'id' | 'created_at'>) => {
    const newWarden: Warden = { ...warden, id: `w${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...data.wardens, newWarden]; setData(d => ({ ...d, wardens: updated })); saveToStorage('wardens', updated);
  };
  const updateWarden = (id: string, updates: Partial<Warden>) => {
    const updated = data.wardens.map((w: Warden) => w.id === id ? { ...w, ...updates } : w); setData(d => ({ ...d, wardens: updated })); saveToStorage('wardens', updated);
  };
  const deleteWarden = (id: string) => {
    const updated = data.wardens.filter((w: Warden) => w.id !== id); setData(d => ({ ...d, wardens: updated })); saveToStorage('wardens', updated);
  };
  const addStudent = (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newStudent: Student = { ...student, id: `s${Date.now()}`, created_at: now, updated_at: now };
    const updated = [...data.students, newStudent]; setData(d => ({ ...d, students: updated })); saveToStorage('students', updated);
  };
  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = data.students.map((s: Student) => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s);
    setData(d => ({ ...d, students: updated })); saveToStorage('students', updated);
  };
  const deleteStudent = (id: string) => {
    const updated = data.students.filter((s: Student) => s.id !== id); setData(d => ({ ...d, students: updated })); saveToStorage('students', updated);
  };
  const saveAttendance = (studentId: string, houseId: string, date: string, status: AttendanceStatus, remark: string, markedBy: string): boolean => {
    const existing = data.attendance.find((a: Attendance) => a.student_id === studentId && a.attendance_date === date);
    const now = new Date().toISOString();
    if (existing) {
      const updated = data.attendance.map((a: Attendance) => a.student_id === studentId && a.attendance_date === date ? { ...a, status, remark, marked_by: markedBy, updated_at: now } : a);
      setData(d => ({ ...d, attendance: updated })); saveToStorage('attendance', updated);
    } else {
      const newRecord: Attendance = { id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, student_id: studentId, house_id: houseId, attendance_date: date, status, remark, marked_by: markedBy, created_at: now, updated_at: now };
      const updated = [...data.attendance, newRecord]; setData(d => ({ ...d, attendance: updated })); saveToStorage('attendance', updated);
    }
    return true;
  };
  const bulkSaveAttendance = (records: { student_id: string; house_id: string; status: AttendanceStatus; remark: string }[], date: string, markedBy: string) => {
    const now = new Date().toISOString();
    let updatedAttendance = [...data.attendance];
    records.forEach(record => {
      const existingIdx = updatedAttendance.findIndex((a: Attendance) => a.student_id === record.student_id && a.attendance_date === date);
      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = { ...updatedAttendance[existingIdx], status: record.status, remark: record.remark, marked_by: markedBy, updated_at: now };
      } else {
        updatedAttendance.push({ id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, student_id: record.student_id, house_id: record.house_id, attendance_date: date, status: record.status, remark: record.remark, marked_by: markedBy, created_at: now, updated_at: now });
      }
    });
    setData(d => ({ ...d, attendance: updatedAttendance })); saveToStorage('attendance', updatedAttendance);
  };
  const getAttendanceForDate = (houseId: string, date: string): Attendance[] => data.attendance.filter((a: Attendance) => a.house_id === houseId && a.attendance_date === date);
  const getStudentsByHouse = (houseId: string): Student[] => data.students.filter((s: Student) => s.house_id === houseId && s.status === 'Active');
  const getAttendanceSummary = (houseId: string, date: string) => {
    const records = data.attendance.filter((a: Attendance) => a.house_id === houseId && a.attendance_date === date);
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
    <DataContext.Provider value={{ houses: data.houses, wardens: data.wardens, students: data.students, attendance: data.attendance, addHouse, updateHouse, deleteHouse, addWarden, updateWarden, deleteWarden, addStudent, updateStudent, deleteStudent, saveAttendance, bulkSaveAttendance, getAttendanceForDate, getStudentsByHouse, getAttendanceSummary, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
