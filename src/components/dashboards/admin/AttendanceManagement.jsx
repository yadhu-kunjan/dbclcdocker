import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { courses as staticCourses } from '../../../data/courses';

export default function AttendanceManagement() {
  const [courses] = useState(staticCourses);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  // Static mock students (previous simple behavior)
  const mockStudents = [
    { id: 1, name: 'John Doe', regNo: '2023001' },
    { id: 2, name: 'Jane Smith', regNo: '2023002' },
    { id: 3, name: 'Mike Johnson', regNo: '2023003' },
    { id: 4, name: 'Sarah Williams', regNo: '2023004' },
    { id: 5, name: 'David Brown', regNo: '2023005' }
  ];

  useEffect(() => {
    // When course selected, show mock students and reset attendance
    if (selectedCourse) {
      setStudents(mockStudents);
      const init = {};
      mockStudents.forEach(s => { init[s.id] = false; });
      setAttendance(init);
    } else {
      setStudents([]);
      setAttendance({});
    }
    setSelectedSubject('');
  }, [selectedCourse]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const toggleAttendance = (id) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveAttendance = () => {
    // Simulate save - for now just log to console
    console.log('Saving attendance', { selectedCourse, selectedSubject, selectedDate, attendance });
    alert('Attendance saved (mock)');
  };

  const getSubjectsForCourse = (courseId) => {
    const c = courses.find(cc => String(cc.id) === String(courseId));
    return c ? c.subjects : [];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">Choose a course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedCourse} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">Choose a subject</option>
            {getSubjectsForCourse(selectedCourse).map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <button onClick={() => changeDate(-1)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => changeDate(1)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      {selectedCourse && selectedSubject && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center"><Users className="h-5 w-5 mr-2" />Attendance Sheet</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.regNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => toggleAttendance(s.id)} className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${attendance[s.id] ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {attendance[s.id] ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button onClick={handleSaveAttendance} className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Save Attendance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
