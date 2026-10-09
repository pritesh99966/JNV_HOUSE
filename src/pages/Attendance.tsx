import React from 'react';

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daily Attendance</h1>
        <p className="text-gray-500 text-sm">Mark attendance for students</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Attendance marking will be displayed here...</p>
      </div>
    </div>
  );
}
