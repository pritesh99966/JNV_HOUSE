import { School, Student, House, Warden, Attendance } from '../types';

// Backup school data
export function backupSchoolData(schoolId: string): any {
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]');
  const school = schools.find((s: any) => s.id === schoolId);
  
  if (!school) {
    throw new Error('School not found');
  }

  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    school: school,
    houses: JSON.parse(localStorage.getItem(`hms_${schoolId}_houses`) || '[]'),
    wardens: JSON.parse(localStorage.getItem(`hms_${schoolId}_wardens`) || '[]'),
    students: JSON.parse(localStorage.getItem(`hms_${schoolId}_students`) || '[]'),
    attendance: JSON.parse(localStorage.getItem(`hms_${schoolId}_attendance`) || '[]')
  };

  return backup;
}

// Download backup as JSON file
export function downloadBackup(backup: any, filename: string): void {
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Upload and restore backup
export function uploadBackup(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        resolve(backup);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Restore school data from backup
export function restoreSchoolData(backup: any): void {
  if (!backup.version || !backup.school || !backup.school.id) {
    throw new Error('Invalid backup file');
  }

  const schoolId = backup.school.id;

  // Restore school
  const schools = JSON.parse(localStorage.getItem('hms_schools') || '[]');
  const existingIndex = schools.findIndex((s: any) => s.id === schoolId);
  
  if (existingIndex >= 0) {
    schools[existingIndex] = backup.school;
  } else {
    schools.push(backup.school);
  }
  localStorage.setItem('hms_schools', JSON.stringify(schools));

  // Restore school-specific data
  localStorage.setItem(`hms_${schoolId}_houses`, JSON.stringify(backup.houses || []));
  localStorage.setItem(`hms_${schoolId}_wardens`, JSON.stringify(backup.wardens || []));
  localStorage.setItem(`hms_${schoolId}_students`, JSON.stringify(backup.students || []));
  localStorage.setItem(`hms_${schoolId}_attendance`, JSON.stringify(backup.attendance || []));
}

// Backup house data (for warden)
export function backupHouseData(schoolId: string, houseId: string): any {
  const houses = JSON.parse(localStorage.getItem(`hms_${schoolId}_houses`) || '[]');
  const students = JSON.parse(localStorage.getItem(`hms_${schoolId}_students`) || '[]');
  const attendance = JSON.parse(localStorage.getItem(`hms_${schoolId}_attendance`) || '[]');
  
  const house = houses.find((h: any) => h.id === houseId);
  const houseStudents = students.filter((s: any) => s.house_id === houseId);
  const houseAttendance = attendance.filter((a: any) => a.house_id === houseId);

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    type: 'house',
    house: house,
    students: houseStudents,
    attendance: houseAttendance
  };
}

// Restore house data
export function restoreHouseData(schoolId: string, backup: any): void {
  if (!backup.house || !backup.house.id) {
    throw new Error('Invalid house backup file');
  }

  const houseId = backup.house.id;

  // Restore house
  const houses = JSON.parse(localStorage.getItem(`hms_${schoolId}_houses`) || '[]');
  const existingIndex = houses.findIndex((h: any) => h.id === houseId);
  
  if (existingIndex >= 0) {
    houses[existingIndex] = backup.house;
  } else {
    houses.push(backup.house);
  }
  localStorage.setItem(`hms_${schoolId}_houses`, JSON.stringify(houses));

  // Restore students for this house
  const students = JSON.parse(localStorage.getItem(`hms_${schoolId}_students`) || '[]');
  const filteredStudents = students.filter((s: any) => s.house_id !== houseId);
  const restoredStudents = [...filteredStudents, ...(backup.students || [])];
  localStorage.setItem(`hms_${schoolId}_students`, JSON.stringify(restoredStudents));

  // Restore attendance for this house
  const attendance = JSON.parse(localStorage.getItem(`hms_${schoolId}_attendance`) || '[]');
  const filteredAttendance = attendance.filter((a: any) => a.house_id !== houseId);
  const restoredAttendance = [...filteredAttendance, ...(backup.attendance || [])];
  localStorage.setItem(`hms_${schoolId}_attendance`, JSON.stringify(restoredAttendance));
}
