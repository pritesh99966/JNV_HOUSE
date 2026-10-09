import React from 'react';

export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm">View and manage your profile</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Profile information will be displayed here...</p>
      </div>
    </div>
  );
}
