# Multi-School Master Login System

## 🎯 Overview

The system now supports **multi-school architecture** with a master admin who can manage multiple schools, and each school has its own isolated data.

---

## 🔐 Login Credentials

### Master Admin (Super Admin)
- **URL**: `/master-login`
- **Username**: `master`
- **Password**: `master123`
- **Access**: Can manage all schools, create new schools, view all data

### School Admin
- **URL**: `/login`
- **Example Credentials**:
  - School 1: `kv001` / `kv001@123`
  - School 2: `kv002` / `kv002@123`
- **Access**: Can manage their school's houses, wardens, students, attendance

### Warden
- **URL**: `/login`
- **Example Credentials**:
  - `aravalli_sr` / `warden123`
  - `nilgiri_sr` / `warden123`
- **Access**: Can manage attendance for their assigned house only

---

## 🏗️ Architecture

### Data Structure

```
localStorage/
├── hms_schools              # All schools list
├── hms_current_user         # Current logged-in user
├── hms_{schoolId}_houses    # School-specific houses
├── hms_{schoolId}_wardens   # School-specific wardens
├── hms_{schoolId}_students  # School-specific students
└── hms_{schoolId}_attendance # School-specific attendance
```

### User Roles

1. **Master Admin** (`role: 'master'`)
   - Can create/edit/delete schools
   - Can view all schools' data
   - Cannot manage individual school data directly

2. **School Admin** (`role: 'admin'`)
   - Can manage houses, wardens, students
   - Can view all attendance reports
   - Data is scoped to their school only

3. **Warden** (`role: 'warden'`)
   - Can mark attendance for assigned house
   - Can view their house's reports
   - Data is scoped to their house and school

---

## 📋 Features

### Master Dashboard

1. **School Management**
   - Add new school with admin credentials
   - Edit school details
   - Delete school (removes all data)
   - Activate/Deactivate school

2. **Overview Statistics**
   - Total schools count
   - Total houses across all schools
   - Total students across all schools
   - Total attendance records

3. **School Cards**
   - School name and code
   - Admin details (name, username, email)
   - Statistics (houses, students count)
   - Quick actions (Edit, Delete)

### School Admin Dashboard

1. **House Management**
   - Create houses for their school
   - Assign wardens to houses
   - View house-wise statistics

2. **Student Management**
   - Add/Edit/Delete students
   - Excel import/export
   - Photo upload
   - Search and filter

3. **Attendance Management**
   - Morning and Night attendance
   - House-wise overview
   - Charts and analytics
   - Export reports

### Warden Dashboard

1. **Attendance Overview**
   - Morning attendance cards
   - Night attendance cards
   - Pie charts for distribution
   - Quick status indicators

2. **Daily Attendance**
   - Mark attendance for assigned house
   - Session selection (Morning/Night)
   - Bulk actions
   - Real-time summary

---

## 🚀 How to Use

### Step 1: Master Login
1. Go to `/login`
2. Click "🔐 Master Admin Login →"
3. Login with `master` / `master123`
4. You'll see the Master Dashboard

### Step 2: Create a New School
1. Click "Add School" button
2. Fill in the form:
   - School Name: e.g., "Kendriya Vidyalaya No. 3"
   - School Code: e.g., "KV003"
   - Admin Name: e.g., "Ramesh Kumar"
   - Admin Email: e.g., "kv003@school.com"
   - Admin Username: e.g., "kv003"
   - Admin Password: e.g., "kv003@123"
   - Status: Active
3. Click "Create School"

### Step 3: School Admin Login
1. Logout from master account
2. Go to `/login`
3. Login with school admin credentials (e.g., `kv003` / `kv003@123`)
4. You'll see the School Admin Dashboard

### Step 4: Manage School Data
1. **Add Houses**: Go to Houses → Add House
2. **Add Wardens**: Go to Wardens → Add Warden → Assign to house
3. **Add Students**: Go to Students → Add Student or Import from Excel
4. **Mark Attendance**: Go to Attendance → Select session → Mark attendance

### Step 5: Warden Login
1. School admin creates wardens and assigns houses
2. Warden logs in with their credentials
3. Warden can only see their assigned house
4. Warden marks morning and night attendance

---

## 🔒 Security Features

1. **Data Isolation**
   - Each school's data is stored separately
   - School admin can only access their school's data
   - Warden can only access their house's data

2. **Role-Based Access Control**
   - Master: Full system access
   - School Admin: School-level access
   - Warden: House-level access

3. **Authentication**
   - Secure login with username/password
   - Session management via localStorage
   - Automatic redirect based on role

---

## 📊 Data Flow

### Creating a School
```
Master Dashboard → Add School → Save to hms_schools
                                → Initialize empty school data
```

### School Admin Login
```
Login → Verify credentials → Load school data
      → Set currentSchoolId → Load school-specific data
```

### Warden Login
```
Login → Verify credentials → Load school data
      → Set assigned_house_id → Load house-specific data
```

---

## 🎨 UI Features

### Master Dashboard
- Purple theme for master admin
- School cards with statistics
- Quick actions (Edit, Delete)
- Overview statistics cards

### School Admin Dashboard
- Indigo theme for school admin
- School name in header
- Full feature access for their school
- Same UI as original single-school system

### Warden Dashboard
- Morning/Night attendance cards
- Pie charts for visualization
- Quick action buttons
- Status indicators

---

## 📝 Important Notes

1. **School Code**: Must be unique for each school
2. **Admin Credentials**: Created by master, cannot be changed by school admin
3. **Data Persistence**: All data stored in localStorage
4. **Browser Limit**: ~5MB localStorage limit per domain
5. **Backup**: Regular backup recommended for production use

---

## 🔄 Migration from Single School

If you were using the single-school version:

1. **Old data** is still in localStorage
2. **New schools** will have separate storage
3. **Master login** gives access to all schools
4. **School admin** can manage their school independently

---

## 🛠️ Technical Details

### Storage Keys
- `hms_schools`: Array of all schools
- `hms_{schoolId}_houses`: Houses for specific school
- `hms_{schoolId}_wardens`: Wardens for specific school
- `hms_{schoolId}_students`: Students for specific school
- `hms_{schoolId}_attendance`: Attendance for specific school

### Context Updates
- `AuthContext`: Added `school_id` and `school_name` to user
- `DataContext`: Added school-scoped data loading
- `Routing`: Added master routes and role-based redirects

---

## 📞 Support

For any issues or questions:
1. Check localStorage for data integrity
2. Verify school credentials in master dashboard
3. Ensure proper role assignment
4. Clear browser cache if facing login issues

---

## 🎉 Summary

Your hostel management system now supports:
- ✅ Multiple schools management
- ✅ Master admin control
- ✅ School-wise data isolation
- ✅ Role-based access control
- ✅ Scalable architecture
- ✅ Easy school onboarding

**Ready to deploy for multiple schools!** 🚀
