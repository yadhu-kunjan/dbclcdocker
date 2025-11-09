import React from 'react';
import { GraduationCap, Bell } from 'lucide-react';

export const getInitials = (name) => {
  if (typeof name !== 'string' || name.length === 0) {
    return 'NA';
  }
  return name.split(' ')
    .filter(n => n)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminDashboardHeader({ adminProfile }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">{adminProfile.institution}</h1>
                <p className="text-xs text-gray-500">Administrative Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{adminProfile.name}</p>
                <p className="text-xs text-gray-500">{adminProfile.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                {getInitials(adminProfile.name)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}