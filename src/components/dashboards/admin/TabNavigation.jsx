import React from 'react';
import { FileText, GraduationCap } from 'lucide-react';

export default function TabNavigation({ activeTab, setActiveTab, onTabChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => {
              setActiveTab('applications');
              if (onTabChange) onTabChange('applications');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Applications</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('academic');
              if (onTabChange) onTabChange('academic');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'academic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Academic Management</span>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
}