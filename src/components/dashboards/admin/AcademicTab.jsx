import React, { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { academicAPI } from '../../../services/api';

export default function AcademicTab() {
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      const [assignmentsRes, attendanceRes] = await Promise.all([
        academicAPI.getAssignments(),
        academicAPI.getAttendance()
      ]);
      
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.assignments);
      }
      
      if (attendanceRes.success) {
        setAttendance(attendanceRes.attendance);
      }
    } catch (err) {
      console.error('Error loading academic data:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Management */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="h-7 w-7 mr-3" />
              Assignment Management
            </h2>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Assignment list implementation */}
        </div>
      </div>

      {/* Attendance Management */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Attendance section implementation */}
      </div>
    </div>
  );
}