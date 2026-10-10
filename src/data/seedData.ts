import { House, Warden, Student, Attendance, AttendanceSession, School } from '../types';

export const seedSchools: School[] = [
  {
    id: 'school1',
    name: 'Kendriya Vidyalaya No. 1',
    code: 'KV001',
    admin_username: 'kv001',
    admin_password: 'kv001@123',
    admin_name: 'Rajesh Kumar',
    admin_email: 'kv001@school.com',
    created_at: '2024-01-01',
    status: 'Active'
  },
  {
    id: 'school2',
    name: 'Kendriya Vidyalaya No. 2',
    code: 'KV002',
    admin_username: 'kv002',
    admin_password: 'kv002@123',
    admin_name: 'Suresh Patel',
    admin_email: 'kv002@school.com',
    created_at: '2024-01-01',
    status: 'Active'
  },
  {
    id: 'school3',
    name: 'Delhi Public School',
    code: 'DPS001',
    admin_username: 'dps001',
    admin_password: 'dps001@123',
    admin_name: 'Amit Sharma',
    admin_email: 'dps001@school.com',
    created_at: '2024-01-15',
    status: 'Active'
  },
  {
    id: 'school4',
    name: 'Ryan International School',
    code: 'RIS001',
    admin_username: 'ris001',
    admin_password: 'ris001@123',
    admin_name: 'Priya Singh',
    admin_email: 'ris001@school.com',
    created_at: '2024-02-01',
    status: 'Active'
  },
  {
    id: 'school5',
    name: 'DAV Public School',
    code: 'DAV001',
    admin_username: 'dav001',
    admin_password: 'dav001@123',
    admin_name: 'Vikram Patel',
    admin_email: 'dav001@school.com',
    created_at: '2024-02-15',
    status: 'Active'
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

const firstNames = ['Rahul', 'Amit', 'Raj', 'Priya', 'Ankit', 'Neha', 'Vikram', 'Suresh', 'Pooja', 'Deepak', 'Ravi', 'Sneha', 'Arjun', 'Kiran', 'Manish', 'Divya', 'Rohit', 'Anjali', 'Gaurav', 'Swati', 'Karan', 'Ritika', 'Aditya', 'Shruti', 'Vishal', 'Megha', 'Akash', 'Pallavi', 'Nitin', 'Kavita', 'Sachin', 'Poonam', 'Harsh', 'Nidhi', 'Varun', 'Tanya', 'Abhishek', 'Simran', 'Rohan', 'Isha'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Joshi', 'Reddy', 'Shah', 'Mehta', 'Agarwal', 'Tiwari', 'Dubey', 'Mishra', 'Chauhan', 'Yadav', 'Pandey', 'Saxena', 'Srivastava', 'Malhotra'];
const classes = ['6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C'];
const medicalConditions = ['', '', '', '', '', 'Asthma', 'Allergies', 'Diabetes', '', ''];

function generateStudents(): Student[] {
  const students: Student[] = [];
  let id = 1;
  seedHouses.forEach((house) => {
    const count = 35; // Increased from 20 to 35 students per house
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const cls = house.category === 'Junior Boys' ? classes[Math.floor(Math.random() * 3)] : classes[Math.floor(Math.random() * classes.length)];
      const bedNo = `B${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`;
      const medical = medicalConditions[Math.floor(Math.random() * medicalConditions.length)];
      students.push({
        id: `s${id}`, admission_no: `ADM${String(2024000 + id).slice(-5)}`,
        student_name: `${firstName} ${lastName}`, gender: house.gender,
        class: cls, section: sections[Math.floor(Math.random() * sections.length)],
        dob: `${2008 + Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        father_name: `Mr. ${firstName} ${lastName}`, mother_name: `Mrs. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        mobile: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        house_id: house.id, bed_no: bedNo, sr_no: String(i + 1).padStart(2, '0'),
        photo_url: '', medical_remark: medical,
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
  // Generate attendance for last 7 days
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
        
        // More realistic attendance distribution
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

export const seedStudents = generateStudents();
export const seedAttendance = generateAttendance(seedStudents);

export function getInitialData() {
  const schools = localStorage.getItem('hms_schools');
  if (!schools) {
    // First time initialization
    localStorage.setItem('hms_schools', JSON.stringify(seedSchools));
    localStorage.setItem('hms_houses', JSON.stringify(seedHouses));
    localStorage.setItem('hms_wardens', JSON.stringify(seedWardens));
    localStorage.setItem('hms_students', JSON.stringify(seedStudents));
    localStorage.setItem('hms_attendance', JSON.stringify(seedAttendance));
    
    // Initialize school-specific data for each school
    seedSchools.forEach(school => {
      localStorage.setItem(`hms_${school.id}_houses`, JSON.stringify(seedHouses));
      localStorage.setItem(`hms_${school.id}_wardens`, JSON.stringify(seedWardens));
      localStorage.setItem(`hms_${school.id}_students`, JSON.stringify(seedStudents));
      localStorage.setItem(`hms_${school.id}_attendance`, JSON.stringify(seedAttendance));
    });
    
    return { 
      schools: seedSchools,
      houses: seedHouses, 
      wardens: seedWardens, 
      students: seedStudents, 
      attendance: seedAttendance 
    };
  }
  
  // Check if school-specific data exists, if not initialize it
  const schoolsList = JSON.parse(localStorage.getItem('hms_schools') || '[]') as School[];
  schoolsList.forEach(school => {
    if (!localStorage.getItem(`hms_${school.id}_houses`)) {
      localStorage.setItem(`hms_${school.id}_houses`, JSON.stringify(seedHouses));
      localStorage.setItem(`hms_${school.id}_wardens`, JSON.stringify(seedWardens));
      localStorage.setItem(`hms_${school.id}_students`, JSON.stringify(seedStudents));
      localStorage.setItem(`hms_${school.id}_attendance`, JSON.stringify(seedAttendance));
    }
  });
  
  return {
    schools: schoolsList,
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
  
  // Fallback: If school-specific data is empty, use default seed data
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

export function saveSchoolData(schoolId: string, data: any) {
  if (data.houses) localStorage.setItem(`hms_${schoolId}_houses`, JSON.stringify(data.houses));
  if (data.wardens) localStorage.setItem(`hms_${schoolId}_wardens`, JSON.stringify(data.wardens));
  if (data.students) localStorage.setItem(`hms_${schoolId}_students`, JSON.stringify(data.students));
  if (data.attendance) localStorage.setItem(`hms_${schoolId}_attendance`, JSON.stringify(data.attendance));
}

export function saveToStorage(key: string, data: any) {
  localStorage.setItem(`hms_${key}`, JSON.stringify(data));
}
