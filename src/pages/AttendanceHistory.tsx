import React from 'react';

export default function AttendanceHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance History</h1>
        <p className="text-gray-500 text-sm">View past attendance records</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Attendance history will be displayed here...</p>
      </div>
    </div>
  );
}
