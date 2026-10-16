import { House, Warden, Student, Attendance, AttendanceSession, School } from '../types';

export const seedSchools: School[] = [
  {
    id: 'school1',
    name: 'Kendriya Vidyalaya No. 1',
    code: 'KV001',
    admin_username: 'kv001',
    admin_password: 'KV@2024#Secure!',
    admin_name: 'Rajesh Kumar',
    admin_email: 'kv001@school.com',
    created_at: '2024-01-01',
    status: 'Active',
    licence_start_date: '2024-01-01',
    licence_expiry_date: '2025-12-31',
    licence_status: 'Active',
    last_login: new Date().toISOString(),
    total_time_spent: 1250
  },
  {
    id: 'school2',
    name: 'Kendriya Vidyalaya No. 2',
    code: 'KV002',
    admin_username: 'kv002',
    admin_password: 'KV2@Admin#2024',
    admin_name: 'Suresh Patel',
    admin_email: 'kv002@school.com',
    created_at: '2024-01-01',
    status: 'Active',
    licence_start_date: '2024-01-01',
    licence_expiry_date: '2025-06-30',
    licence_status: 'Active',
    last_login: new Date().toISOString(),
    total_time_spent: 890
  }
];

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
  { id: 'w1', name: 'Rajesh Kumar', username: 'kv001_w1', email: 'kv001_w1@school.com', mobile: '9876543201', password: 'wardenKV001', assigned_house_id: 'h1', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w2', name: 'Suresh Patel', username: 'kv001_w2', email: 'kv001_w2@school.com', mobile: '9876543202', password: 'wardenKV001', assigned_house_id: 'h2', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w3', name: 'Mahesh Singh', username: 'kv001_w3', email: 'kv001_w3@school.com', mobile: '9876543203', password: 'wardenKV001', assigned_house_id: 'h3', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w4', name: 'Dinesh Sharma', username: 'kv001_w4', email: 'kv001_w4@school.com', mobile: '9876543204', password: 'wardenKV001', assigned_house_id: 'h4', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w5', name: 'Vikram Joshi', username: 'kv001_w5', email: 'kv001_w5@school.com', mobile: '9876543205', password: 'wardenKV001', assigned_house_id: 'h5', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w6', name: 'Amit Verma', username: 'kv001_w6', email: 'kv001_w6@school.com', mobile: '9876543206', password: 'wardenKV001', assigned_house_id: 'h6', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w7', name: 'Prakash Gupta', username: 'kv001_w7', email: 'kv001_w7@school.com', mobile: '9876543207', password: 'wardenKV001', assigned_house_id: 'h7', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w8', name: 'Sanjay Reddy', username: 'kv001_w8', email: 'kv001_w8@school.com', mobile: '9876543208', password: 'wardenKV001', assigned_house_id: 'h8', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w9', name: 'Priya Sharma', username: 'kv001_w9', email: 'kv001_w9@school.com', mobile: '9876543209', password: 'wardenKV001', assigned_house_id: 'h9', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w10', name: 'Neha Patel', username: 'kv001_w10', email: 'kv001_w10@school.com', mobile: '9876543210', password: 'wardenKV001', assigned_house_id: 'h10', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w11', name: 'Kavita Singh', username: 'kv001_w11', email: 'kv001_w11@school.com', mobile: '9876543211', password: 'wardenKV001', assigned_house_id: 'h11', status: 'Active', photo_url: '', created_at: '2024-01-01' },
  { id: 'w12', name: 'Anita Verma', username: 'kv001_w12', email: 'kv001_w12@school.com', mobile: '9876543212', password: 'wardenKV001', assigned_house_id: 'h12', status: 'Active', photo_url: '', created_at: '2024-01-01' },
];

const firstNames = ['Rahul', 'Amit', 'Raj', 'Priya', 'Ankit', 'Neha', 'Vikram', 'Suresh', 'Pooja', 'Deepak'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Verma'];
const classes = ['6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B'];

function generateStudents(): Student[] {
  const students: Student[] = [];
  let id = 1;
  seedHouses.forEach((house) => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const cls = classes[Math.floor(Math.random() * classes.length)];
      students.push({
        id: `s${id}`,
        admission_no: `ADM${String(2024000 + id).slice(-5)}`,
        student_name: `${firstName} ${lastName}`,
        gender: house.gender,
        class: cls,
        section: sections[Math.floor(Math.random() * sections.length)],
        dob: `2008-01-${String(i + 1).padStart(2, '0')}`,
        father_name: `Mr. ${firstName} ${lastName}`,
        mother_name: `Mrs. ${firstName} ${lastName}`,
        mobile: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        house_id: house.id,
        bed_no: `B${String(i + 1).padStart(3, '0')}`,
        sr_no: String(i + 1).padStart(2, '0'),
        photo_url: '',
        medical_remark: '',
        status: 'Active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      id++;
    }
  });
  return students;
}

function generateAttendance(students: Student[]): Attendance[] {
  const attendance: Attendance[] = [];
  let id = 1;
  const today = new Date().toISOString().split('T')[0];
  const sessions: AttendanceSession[] = ['Morning', 'Night'];
  
  students.forEach((student) => {
    sessions.forEach((session) => {
      const rand = Math.random();
      let status: Attendance['status'];
      
      if (rand < 0.85) status = 'Present';
      else if (rand < 0.92) status = 'Leave';
      else if (rand < 0.96) status = 'Sick';
      else if (rand < 0.98) status = 'OD';
      else status = 'Staff Ward';
      
      attendance.push({
        id: `a${id}`,
        student_id: student.id,
        house_id: student.house_id,
        attendance_date: today,
        session,
        status,
        remark: '',
        marked_by: 'admin',
        created_at: today,
        updated_at: today,
      });
      id++;
    });
  });
  return attendance;
}

export const seedStudents = generateStudents();
export const seedAttendance = generateAttendance(seedStudents);

export function getInitialData() {
  const schools = localStorage.getItem('hms_schools');
  if (!schools) {
    localStorage.setItem('hms_schools', JSON.stringify(seedSchools));
    localStorage.setItem('hms_school1_houses', JSON.stringify(seedHouses));
    localStorage.setItem('hms_school1_wardens', JSON.stringify(seedWardens));
    localStorage.setItem('hms_school1_students', JSON.stringify(seedStudents));
    localStorage.setItem('hms_school1_attendance', JSON.stringify(seedAttendance));
    localStorage.setItem('hms_school2_houses', JSON.stringify(seedHouses));
    localStorage.setItem('hms_school2_wardens', JSON.stringify(seedWardens));
    localStorage.setItem('hms_school2_students', JSON.stringify(seedStudents));
    localStorage.setItem('hms_school2_attendance', JSON.stringify(seedAttendance));
  }
  
  return {
    schools: JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[],
    houses: JSON.parse(localStorage.getItem('hms_school1_houses') || '[]') as House[],
    wardens: JSON.parse(localStorage.getItem('hms_school1_wardens') || '[]') as Warden[],
    students: JSON.parse(localStorage.getItem('hms_school1_students') || '[]') as Student[],
    attendance: JSON.parse(localStorage.getItem('hms_school1_attendance') || '[]') as Attendance[],
  };
}

export function getSchoolData(schoolId: string) {
  return {
    houses: JSON.parse(localStorage.getItem(`hms_${schoolId}_houses`) || '[]') as House[],
    wardens: JSON.parse(localStorage.getItem(`hms_${schoolId}_wardens`) || '[]') as Warden[],
    students: JSON.parse(localStorage.getItem(`hms_${schoolId}_students`) || '[]') as Student[],
    attendance: JSON.parse(localStorage.getItem(`hms_${schoolId}_attendance`) || '[]') as Attendance[],
  };
}

export function saveToStorage(key: string, data: any) {
  localStorage.setItem(`hms_${key}`, JSON.stringify(data));
}
