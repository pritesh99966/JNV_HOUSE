import { House, Warden, Student, Attendance, AttendanceSession, School, Licence } from '../types';

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
    last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
    last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    total_time_spent: 890
  },
  {
    id: 'school3',
    name: 'Delhi Public School',
    code: 'DPS001',
    admin_username: 'dps001',
    admin_password: 'DPS@Secure#2024',
    admin_name: 'Amit Sharma',
    admin_email: 'dps001@school.com',
    created_at: '2024-01-15',
    status: 'Active',
    licence_start_date: '2024-01-15',
    licence_expiry_date: '2025-01-14',
    licence_status: 'Active',
    last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    total_time_spent: 2100
  },
  {
    id: 'school4',
    name: 'Ryan International School',
    code: 'RIS001',
    admin_username: 'ris001',
    admin_password: 'Ryan@Admin#2024',
    admin_name: 'Priya Singh',
    admin_email: 'ris001@school.com',
    created_at: '2024-02-01',
    status: 'Active',
    licence_start_date: '2024-02-01',
    licence_expiry_date: '2024-12-31',
    licence_status: 'Active',
    last_login: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    total_time_spent: 560
  },
  {
    id: 'school5',
    name: 'DAV Public School',
    code: 'DAV001',
    admin_username: 'dav001',
    admin_password: 'DAV@Secure#2024',
    admin_name: 'Vikram Patel',
    admin_email: 'dav001@school.com',
    created_at: '2024-02-15',
    status: 'Active',
    licence_start_date: '2024-02-15',
    licence_expiry_date: '2025-02-14',
    licence_status: 'Active',
    last_login: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    total_time_spent: 1680
  }
];

export const seedLicences: Licence[] = [
  {
    id: 'lic_school1',
    school_id: 'school1',
    plan: 'Premium',
    start_date: '2024-01-01',
    expiry_date: '2025-12-31',
    student_limit: 1000,
    status: 'Active',
    amount: 20000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'lic_school2',
    school_id: 'school2',
    plan: 'Standard',
    start_date: '2024-01-01',
    expiry_date: '2025-06-30',
    student_limit: 500,
    status: 'Active',
    amount: 10000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
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

// Generate unique wardens for each school
function generateWardensForSchool(schoolId: string, schoolCode: string): Warden[] {
  const wardenNames = [
    { name: 'Rajesh Kumar', house: 'h1' },
    { name: 'Suresh Patel', house: 'h2' },
    { name: 'Mahesh Singh', house: 'h3' },
    { name: 'Dinesh Sharma', house: 'h4' },
    { name: 'Vikram Joshi', house: 'h5' },
    { name: 'Amit Verma', house: 'h6' },
    { name: 'Prakash Gupta', house: 'h7' },
    { name: 'Sanjay Reddy', house: 'h8' },
    { name: 'Priya Sharma', house: 'h9' },
    { name: 'Neha Patel', house: 'h10' },
    { name: 'Kavita Singh', house: 'h11' },
    { name: 'Anita Verma', house: 'h12' }
  ];

  return wardenNames.map((w, index) => ({
    id: `w_${schoolId}_${index + 1}`,
    name: w.name,
    username: `${schoolCode.toLowerCase()}_w${index + 1}`,
    email: `${schoolCode.toLowerCase()}_w${index + 1}@school.com`,
    mobile: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    password: `${schoolCode}@Warden#2024`,
    assigned_house_id: w.house,
    status: 'Active' as const,
    photo_url: '',
    created_at: '2024-01-01'
  }));
}

// Generate wardens for all schools
export const seedWardens: Warden[] = [
  ...generateWardensForSchool('school1', 'KV001'),
  ...generateWardensForSchool('school2', 'KV002'),
  ...generateWardensForSchool('school3', 'DPS001'),
  ...generateWardensForSchool('school4', 'RIS001'),
  ...generateWardensForSchool('school5', 'DAV001')
];

const firstNames = ['Rahul', 'Amit', 'Raj', 'Priya', 'Ankit', 'Neha', 'Vikram', 'Suresh', 'Pooja', 'Deepak', 'Ravi', 'Sneha', 'Arjun', 'Kiran', 'Manish', 'Divya', 'Rohit', 'Anjali', 'Gaurav', 'Swati'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Joshi', 'Reddy', 'Shah', 'Mehta'];
const classes = ['6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C'];

function generateStudentsForSchool(schoolId: string): Student[] {
  const students: Student[] = [];
  let id = 1;
  seedHouses.forEach((house) => {
    const count = 35;
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const cls = house.category === 'Junior Boys' ? classes[Math.floor(Math.random() * 3)] : classes[Math.floor(Math.random() * classes.length)];
      const bedNo = `B${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`;
      students.push({
        id: `s_${schoolId}_${id}`, 
        admission_no: `${schoolId.toUpperCase()}_ADM${String(2024000 + id).slice(-5)}`,
        student_name: `${firstName} ${lastName}`, 
        gender: house.gender,
        class: cls, 
        section: sections[Math.floor(Math.random() * sections.length)],
        dob: `${2008 + Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        father_name: `Mr. ${firstName} ${lastName}`, 
        mother_name: `Mrs. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        mobile: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        house_id: house.id, 
        bed_no: bedNo, 
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

// Generate students for all schools
export const seedStudents: Student[] = [
  ...generateStudentsForSchool('school1'),
  ...generateStudentsForSchool('school2'),
  ...generateStudentsForSchool('school3'),
  ...generateStudentsForSchool('school4'),
  ...generateStudentsForSchool('school5')
];

function generateAttendance(students: Student[]): Attendance[] {
  const attendance: Attendance[] = [];
  let id = 1;
  const dates: string[] = [];
  for (let d = 6; d >= 0; d--) {
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
        let remark = '';
        
        if (rand < 0.82) {
          status = 'Present';
        } else if (rand < 0.90) {
          status = 'Absent';
          remark = 'Absent without leave';
        } else if (rand < 0.95) {
          status = 'Sick';
          remark = 'Medical leave';
        } else if (rand < 0.98) {
          status = 'OD';
          remark = 'On duty - Sports/Competition';
        } else {
          status = 'Staff Ward';
          remark = 'Under medical supervision';
        }
        
        attendance.push({
          id: `a${id}`, student_id: student.id, house_id: student.house_id,
          attendance_date: date, session, status, remark, marked_by: 'admin',
          created_at: date, updated_at: date,
        });
        id++;
      });
    });
  });
  return attendance;
}

export const seedAttendance = generateAttendance(seedStudents);

// Generate dummy activity logs
function generateActivityLogs(): any[] {
  const logs: any[] = [];
  const actions = [
    { action: 'LOGIN', details: 'Warden logged in to the system' },
    { action: 'ATTENDANCE_MARKED', details: 'Morning attendance marked for 35 students' },
    { action: 'ATTENDANCE_MARKED', details: 'Night attendance marked for 35 students' },
    { action: 'STUDENT_ADDED', details: 'New student added: Rahul Kumar' },
    { action: 'STUDENT_UPDATED', details: 'Student details updated: Amit Sharma' },
    { action: 'STUDENT_IMPORTED', details: 'Imported 25 students from Excel file' },
    { action: 'REPORT_GENERATED', details: 'Monthly attendance report generated' },
    { action: 'LOGOUT', details: 'Warden logged out' }
  ];

  // Generate logs for each warden
  seedWardens.forEach((warden, index) => {
    const numLogs = 5 + Math.floor(Math.random() * 10); // 5-15 logs per warden
    
    for (let i = 0; i < numLogs; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
      
      logs.push({
        id: `log_${Date.now()}_${index}_${i}`,
        timestamp: timestamp.toISOString(),
        user_id: warden.id,
        user_name: warden.name,
        user_role: 'warden',
        school_id: 'school1', // All wardens belong to school1 for now
        action: randomAction.action,
        details: randomAction.details,
        ip_address: '192.168.1.' + (100 + index)
      });
    }
  });

  // Sort by timestamp descending
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const seedActivityLogs = generateActivityLogs();

export function getInitialData() {
  const schools = localStorage.getItem('hms_schools');
  if (!schools) {
    localStorage.setItem('hms_schools', JSON.stringify(seedSchools));
    localStorage.setItem('hms_licences', JSON.stringify(seedLicences));
    localStorage.setItem('hms_houses', JSON.stringify(seedHouses));
    localStorage.setItem('hms_wardens', JSON.stringify(seedWardens));
    localStorage.setItem('hms_students', JSON.stringify(seedStudents));
    localStorage.setItem('hms_attendance', JSON.stringify(seedAttendance));
    localStorage.setItem('hms_activity_logs', JSON.stringify(seedActivityLogs));
    
    seedSchools.forEach(school => {
      localStorage.setItem(`hms_${school.id}_houses`, JSON.stringify(seedHouses));
      localStorage.setItem(`hms_${school.id}_wardens`, JSON.stringify(seedWardens));
      localStorage.setItem(`hms_${school.id}_students`, JSON.stringify(seedStudents));
      localStorage.setItem(`hms_${school.id}_attendance`, JSON.stringify(seedAttendance));
    });
    
    return { 
      schools: seedSchools,
      licences: seedLicences,
      houses: seedHouses, 
      wardens: seedWardens, 
      students: seedStudents, 
      attendance: seedAttendance 
    };
  }
  
  const schoolsList = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  schoolsList.forEach(school => {
    if (!localStorage.getItem(`hms_${school.id}_houses`)) {
      localStorage.setItem(`hms_${school.id}_houses`, JSON.stringify(seedHouses));
      localStorage.setItem(`hms_${school.id}_wardens`, JSON.stringify(seedWardens));
      localStorage.setItem(`hms_${school.id}_students`, JSON.stringify(seedStudents));
      localStorage.setItem(`hms_${school.id}_attendance`, JSON.stringify(seedAttendance));
    }
  });
  
  if (!localStorage.getItem('hms_licences')) {
    localStorage.setItem('hms_licences', JSON.stringify(seedLicences));
  }
  
  return {
    schools: schoolsList,
    licences: JSON.parse(localStorage.getItem('hms_licences') || '[]') as Licence[],
    houses: JSON.parse(localStorage.getItem('hms_houses') || '[]') as House[],
    wardens: JSON.parse(localStorage.getItem('hms_wardens') || '[]') as Warden[],
    students: JSON.parse(localStorage.getItem('hms_students') || '[]') as Student[],
    attendance: JSON.parse(localStorage.getItem('hms_attendance') || '[]') as Attendance[],
  };
}

export function getSchoolData(schoolId: string) {
  const allSchools = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  const school = allSchools.find(s => s.id === schoolId);
  
  let schoolHouses = JSON.parse(localStorage.getItem(`hms_${schoolId}_houses`) || '[]') as House[];
  let schoolWardens = JSON.parse(localStorage.getItem(`hms_${schoolId}_wardens`) || '[]') as Warden[];
  let schoolStudents = JSON.parse(localStorage.getItem(`hms_${schoolId}_students`) || '[]') as Student[];
  let schoolAttendance = JSON.parse(localStorage.getItem(`hms_${schoolId}_attendance`) || '[]') as Attendance[];
  
  if (schoolHouses.length === 0) {
    schoolHouses = seedHouses;
    localStorage.setItem(`hms_${schoolId}_houses`, JSON.stringify(seedHouses));
  }
  if (schoolWardens.length === 0) {
    schoolWardens = seedWardens;
    localStorage.setItem(`hms_${schoolId}_wardens`, JSON.stringify(seedWardens));
  }
  if (schoolStudents.length === 0) {
    schoolStudents = seedStudents;
    localStorage.setItem(`hms_${schoolId}_students`, JSON.stringify(seedStudents));
  }
  if (schoolAttendance.length === 0) {
    schoolAttendance = seedAttendance;
    localStorage.setItem(`hms_${schoolId}_attendance`, JSON.stringify(seedAttendance));
  }
  
  return {
    school,
    houses: schoolHouses,
    wardens: schoolWardens,
    students: schoolStudents,
    attendance: schoolAttendance
  };
}

export function saveToStorage(key: string, data: any) {
  localStorage.setItem(`hms_${key}`, JSON.stringify(data));
}
