import { House, Warden, Student, Attendance, AttendanceSession } from '../types';

export const seedHouses: House[] = [
  { id: 'h1', house_name: 'Aravalli Sr Boys', category: 'Senior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h2', house_name: 'Nilgiri Sr Boys', category: 'Senior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h3', house_name: 'Shivalik Sr Boys', category: 'Senior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h4', house_name: 'Udaygiri Sr Boys', category: 'Senior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h5', house_name: 'Aravalli Jr Boys', category: 'Junior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h6', house_name: 'Nilgiri Jr Boys', category: 'Junior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h7', house_name: 'Shivalik Jr Boys', category: 'Junior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h8', house_name: 'Udaygiri Jr Boys', category: 'Junior Boys', gender: 'Male', status: 'Active', created_at: '2024-01-01' },
  { id: 'h9', house_name: 'Aravalli Girls', category: 'Girls', gender: 'Female', status: 'Active', created_at: '2024-01-01' },
  { id: 'h10', house_name: 'Nilgiri Girls', category: 'Girls', gender: 'Female', status: 'Active', created_at: '2024-01-01' },
  { id: 'h11', house_name: 'Shivalik Girls', category: 'Girls', gender: 'Female', status: 'Active', created_at: '2024-01-01' },
  { id: 'h12', house_name: 'Udaygiri Girls', category: 'Girls', gender: 'Female', status: 'Active', created_at: '2024-01-01' },
];

export const seedWardens: Warden[] = [
  { id: 'w1', name: 'Rajesh Kumar', username: 'aravalli_sr', email: 'aravalli_sr@school.com', mobile: '9876543201', password: 'warden123', assigned_house_id: 'h1', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w2', name: 'Suresh Patel', username: 'nilgiri_sr', email: 'nilgiri_sr@school.com', mobile: '9876543202', password: 'warden123', assigned_house_id: 'h2', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w3', name: 'Mahesh Singh', username: 'shivalik_sr', email: 'shivalik_sr@school.com', mobile: '9876543203', password: 'warden123', assigned_house_id: 'h3', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w4', name: 'Dinesh Sharma', username: 'udaygiri_sr', email: 'udaygiri_sr@school.com', mobile: '9876543204', password: 'warden123', assigned_house_id: 'h4', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w5', name: 'Vikram Joshi', username: 'aravalli_jr', email: 'aravalli_jr@school.com', mobile: '9876543205', password: 'warden123', assigned_house_id: 'h5', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w6', name: 'Amit Verma', username: 'nilgiri_jr', email: 'nilgiri_jr@school.com', mobile: '9876543206', password: 'warden123', assigned_house_id: 'h6', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w7', name: 'Prakash Gupta', username: 'shivalik_jr', email: 'shivalik_jr@school.com', mobile: '9876543207', password: 'warden123', assigned_house_id: 'h7', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w8', name: 'Sanjay Reddy', username: 'udaygiri_jr', email: 'udaygiri_jr@school.com', mobile: '9876543208', password: 'warden123', assigned_house_id: 'h8', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w9', name: 'Priya Sharma', username: 'aravalli_girls', email: 'aravalli_girls@school.com', mobile: '9876543209', password: 'warden123', assigned_house_id: 'h9', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w10', name: 'Neha Patel', username: 'nilgiri_girls', email: 'nilgiri_girls@school.com', mobile: '9876543210', password: 'warden123', assigned_house_id: 'h10', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w11', name: 'Kavita Singh', username: 'shivalik_girls', email: 'shivalik_girls@school.com', mobile: '9876543211', password: 'warden123', assigned_house_id: 'h11', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w12', name: 'Anita Verma', username: 'udaygiri_girls', email: 'udaygiri_girls@school.com', mobile: '9876543212', password: 'warden123', assigned_house_id: 'h12', status: 'Active', photo_url: '', created_at: '2024-01-01' },
];

const firstNames = ['Rahul', 'Amit', 'Raj', 'Priya', 'Ankit', 'Neha', 'Vikram', 'Suresh', 'Pooja', 'Deepak', 'Ravi', 'Sneha', 'Arjun', 'Kiran', 'Manish', 'Divya', 'Rohit', 'Anjali', 'Gaurav', 'Swati', 'Nitin', 'Ritu', 'Akash', 'Pallavi', 'Vishal', 'Megha', 'Tarun', 'Shruti', 'Kunal', 'Nisha'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Joshi', 'Reddy', 'Shah', 'Mehta', 'Agarwal', 'Tiwari', 'Dubey', 'Mishra', 'Chauhan'];
const classes = ['6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C'];

function generateStudents(): Student[] {
  const students: Student[] = [];
  let id = 1;
  seedHouses.forEach((house) => {
    const count = 25 + Math.floor(Math.random() * 10); // Reduced from 40-55 to 25-35 per house
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const cls = house.category === 'Junior Boys' ? classes[Math.floor(Math.random() * 3)] : classes[Math.floor(Math.random() * classes.length)];
      const bedNo = `B${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`;
      students.push({
        id: `s${id}`, admission_no: `ADM${String(2024000 + id).slice(-5)}`,
        student_name: `${firstName} ${lastName}`, gender: house.gender,
        class: cls, section: sections[Math.floor(Math.random() * sections.length)],
        dob: `${2008 + Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        father_name: `Mr. ${firstName} ${lastName}`, mother_name: `Mrs. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        mobile: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        house_id: house.id, bed_no: bedNo, sr_no: String(i + 1).padStart(2, '0'),
        photo_url: '', medical_remark: Math.random() > 0.9 ? 'Asthma' : '',
        status: 'Active', created_at: '2024-01-01', updated_at: '2024-01-01',
      });
      id++;
    }
  });
  return students;
}

function generateAttendance(students: Student[]): Attendance[] {
  const attendance: Attendance[] = [];
  let id = 1;
  const dates: string[] = [];
  // Reduced from 7 days to 3 days to save storage
  for (let d = 2; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    dates.push(date.toISOString().split('T')[0]);
  }
  const sessions: AttendanceSession[] = ['Morning', 'Night'];
  
  students.forEach((student) => {
    dates.forEach((date) => {
      sessions.forEach((session) => {
        const rand = Math.random();
        let status: Attendance['status'];
        if (rand < 0.85) status = 'Present';
        else if (rand < 0.92) status = 'Absent';
        else if (rand < 0.96) status = 'Sick';
        else if (rand < 0.99) status = 'OD';
        else status = 'Staff Ward';
        
        attendance.push({
          id: `a${id}`, student_id: student.id, house_id: student.house_id,
          attendance_date: date, session, status, remark: '', marked_by: 'admin',
          created_at: date, updated_at: date,
        });
        id++;
      });
    });
  });
  return attendance;
}

export const seedStudents = generateStudents();
export const seedAttendance = generateAttendance(seedStudents);

function migrateData(data: any): { houses: House[], wardens: Warden[], students: Student[], attendance: Attendance[] } {
  // Migrate students: roll_no -> sr_no, room_no -> bed_no
  const students = (data.students || []).map((s: any) => ({
    ...s,
    sr_no: s.sr_no || s.roll_no || '',
    bed_no: s.bed_no || s.room_no || '',
    photo_url: s.photo_url || '',
  }));
  
  // Migrate attendance: add session field if missing
  const attendance = (data.attendance || []).map((a: any) => ({
    ...a,
    session: a.session || 'Morning',
  }));
  
  return {
    houses: data.houses || [],
    wardens: data.wardens || [],
    students,
    attendance,
  };
}

export function getInitialData() {
  const houses = localStorage.getItem('hms_houses');
  if (!houses) {
    localStorage.setItem('hms_houses', JSON.stringify(seedHouses));
    localStorage.setItem('hms_wardens', JSON.stringify(seedWardens));
    localStorage.setItem('hms_students', JSON.stringify(seedStudents));
    localStorage.setItem('hms_attendance', JSON.stringify(seedAttendance));
    return { houses: seedHouses, wardens: seedWardens, students: seedStudents, attendance: seedAttendance };
  }
  
  const rawData = {
    houses: JSON.parse(localStorage.getItem('hms_houses') || '[]'),
    wardens: JSON.parse(localStorage.getItem('hms_wardens') || '[]'),
    students: JSON.parse(localStorage.getItem('hms_students') || '[]'),
    attendance: JSON.parse(localStorage.getItem('hms_attendance') || '[]'),
  };
  
  const migratedData = migrateData(rawData);
  
  // Save migrated data back to localStorage with error handling
  try {
    localStorage.setItem('hms_students', JSON.stringify(migratedData.students));
    localStorage.setItem('hms_attendance', JSON.stringify(migratedData.attendance));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded during migration, clearing old data...');
      // Clear all data and reinitialize with fresh seed data
      localStorage.clear();
      localStorage.setItem('hms_houses', JSON.stringify(seedHouses));
      localStorage.setItem('hms_wardens', JSON.stringify(seedWardens));
      localStorage.setItem('hms_students', JSON.stringify(seedStudents));
      localStorage.setItem('hms_attendance', JSON.stringify(seedAttendance));
      return { houses: seedHouses, wardens: seedWardens, students: seedStudents, attendance: seedAttendance };
    }
    throw e;
  }
  
  return migratedData;
}

// Cleanup old attendance records (keep only last 30 days)
function cleanupOldAttendance(attendance: Attendance[]): Attendance[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  return attendance.filter(a => a.attendance_date >= cutoffDate);
}

export function saveToStorage(key: string, data: unknown) {
  try {
    // Cleanup old attendance records before saving
    if (key === 'attendance' && Array.isArray(data)) {
      data = cleanupOldAttendance(data as Attendance[]);
    }
    
    const serialized = JSON.stringify(data);
    localStorage.setItem(`hms_${key}`, serialized);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, attempting cleanup...');
      // Try to free up space by clearing old data
      if (key === 'attendance') {
        const current = JSON.parse(localStorage.getItem(`hms_${key}`) || '[]');
        const cleaned = cleanupOldAttendance(current);
        // Keep only last 7 days if still too large
        if (cleaned.length > 1000) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const cutoff = sevenDaysAgo.toISOString().split('T')[0];
          const minimal = cleaned.filter(a => a.attendance_date >= cutoff);
          localStorage.setItem(`hms_${key}`, JSON.stringify(minimal));
        } else {
          localStorage.setItem(`hms_${key}`, JSON.stringify(cleaned));
        }
      } else if (key === 'students') {
        // If students exceed quota, reduce photo data
        const current = JSON.parse(localStorage.getItem(`hms_${key}`) || '[]');
        const optimized = current.map((s: any) => ({ ...s, photo_url: '' }));
        localStorage.setItem(`hms_${key}`, JSON.stringify(optimized));
      }
    } else {
      throw e;
    }
  }
}
