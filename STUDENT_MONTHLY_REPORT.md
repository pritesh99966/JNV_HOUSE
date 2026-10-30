# Student Monthly Report - Feature Documentation

## Overview
The Student Monthly Report is a comprehensive analytics page that provides detailed attendance analysis for each student on a monthly basis. It tracks Morning and Night attendance sessions separately and calculates leave days, sick days, on-duty days, and overall attendance percentage.

## Features

### 1. Monthly Attendance Tracking
- **Morning Session**: Tracks Present, Absent, Sick, OD (On Duty), and Staff Ward
- **Night Session**: Tracks Present, Absent, Sick, OD, and Staff Ward
- **Total Summary**: Combines both sessions for overall statistics

### 2. Leave Calculation
- **Leave Days** = (Sick + OD + Staff Ward) / 2
- This formula accounts for both Morning and Night sessions (2 sessions = 1 day)

### 3. Analytics Dashboard
The page displays four key metrics at the top:
- **Total Students**: Number of students in the selected filter
- **Average Attendance**: Overall attendance percentage across all students
- **Total Sick Leaves**: Combined sick days for all students
- **Total OD Leaves**: Combined on-duty days for all students

### 4. Performance Insights
Three cards highlighting:
- 🏆 **Top 5 Performers**: Students with highest attendance percentage
- ⚠️ **Need Attention (<75%)**: Students with attendance below 75%
- 📅 **Highest Leave Takers**: Students with most leave days

### 5. Detailed Student Table
Comprehensive table showing:
- Student photo, name, and class
- Morning session breakdown (P, A, Sick, OD, SW)
- Night session breakdown (P, A, Sick, OD, SW)
- Total Present, Total Absent, Leave Days
- Attendance percentage with color coding:
  - 🟢 Green (≥90%): Excellent
  - 🔵 Blue (75-89%): Good
  - 🟡 Yellow (60-74%): Average
  - 🔴 Red (<60%): Poor

### 6. Filtering Options
- **Month Selection**: Choose any month to view reports
- **House Filter**: Filter by specific house (Admin only)
- **Class Filter**: Filter by class (6-12)
- **Sort Options**: Sort by Name, Attendance %, Present Count, or Absent Count
- **Sort Order**: Ascending or Descending

### 7. Export Options
- **Excel Export**: Download report as .xls file
- **Print Report**: Print-friendly format with all details

## Access

### Admin Access
- Navigate to: Admin Dashboard → Student Report (📊 icon)
- Can view all students across all houses
- Can filter by house and class

### Warden Access
- Navigate to: Warden Dashboard → Student Report (📊 icon)
- Can only view students from assigned house
- Can filter by class

## Data Calculation

### Attendance Percentage
```
Attendance % = (Total Present / Total Records) × 100
```

### Leave Days
```
Leave Days = (Sick + OD + Staff Ward) / 2
```
This accounts for both Morning and Night sessions.

### Color Coding
- **≥90%**: Green background (Excellent attendance)
- **75-89%**: Blue background (Good attendance)
- **60-74%**: Yellow background (Average attendance)
- **<60%**: Red background (Poor attendance - needs attention)

## Use Cases

### 1. Monthly Review
- Review student attendance at the end of each month
- Identify students with attendance issues
- Track trends over time

### 2. Parent Communication
- Generate reports for parent meetings
- Show detailed breakdown of attendance
- Highlight areas of concern

### 3. Performance Analysis
- Identify top performers for recognition
- Find students needing intervention
- Track improvement over time

### 4. Administrative Reporting
- Generate monthly reports for school management
- Export data for further analysis
- Print reports for records

## Technical Details

### Route
- Admin: `/admin/student-report`
- Warden: `/warden/student-report`

### Component
- File: `src/pages/StudentMonthlyReport.tsx`
- Uses: `useData()` hook for accessing students and attendance
- Uses: `useAuth()` hook for role-based filtering

### Data Flow
1. Fetch all active students (filtered by house for wardens)
2. For each student, fetch attendance records for selected month
3. Separate Morning and Night session records
4. Calculate statistics for each session
5. Combine for total summary
6. Sort and display results

### Performance
- Uses `useMemo` for efficient data processing
- Filters applied before calculations
- Optimized for up to 500+ students

## Future Enhancements (Suggestions)

1. **Trend Analysis**: Show attendance trend over multiple months
2. **Comparison View**: Compare current month with previous month
3. **Notifications**: Alert when student attendance drops below threshold
4. **Custom Reports**: Allow custom date range selection
5. **Charts & Graphs**: Visual representation of attendance data
6. **Bulk Actions**: Send notifications to parents of low-attendance students
7. **Medical Tracking**: Track sick patterns for health insights
8. **OD Tracking**: Track on-duty activities and reasons

## Notes

- All data is stored in localStorage
- Reports are generated in real-time from attendance data
- No data is lost if attendance is updated
- Export formats are compatible with Microsoft Excel
- Print layout is optimized for A4 paper

---

**Last Updated**: 2024
**Version**: 1.0
