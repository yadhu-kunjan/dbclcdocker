import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Calendar, Users, Clock, DollarSign, Award, X } from 'lucide-react';
import AttendanceManagement from './AttendanceManagement';
import { courses as localCourses } from '../../../data/courses';
import { adminAPI } from '../../../services/api';

export default function AcademicTab() {
  const [courseList, setCourseList] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '', duration: '', description: '', subjects: [],
    fee: '', intake: '', level: '', credits: '', color: 'blue'
  });
  const [newSubject, setNewSubject] = useState('');

  const colors = ['blue', 'emerald', 'amber', 'indigo', 'rose', 'teal', 'cyan', 'violet', 'orange', 'lime'];
  const levels = ['Undergraduate', 'Graduate', 'Doctoral', 'Certificate', 'Diploma', 'Associate'];

  // Helper function to parse subjects
  const parseSubjects = (subjects) => {
    if (typeof subjects === 'string') {
      try {
        return JSON.parse(subjects);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(subjects) ? subjects : [];
  };

  const resetForm = () => {
    setCourseForm({ title: '', duration: '', description: '', subjects: [], fee: '', intake: '', level: '', credits: '', color: 'blue' });
    setNewSubject('');
    setEditingCourse(null);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title, duration: course.duration, description: course.description,
      subjects: [...parseSubjects(course.subjects)], fee: course.fee, intake: course.intake,
      level: course.level, credits: course.credits.toString(), color: course.color
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      // optimistic UI update + server call
      setCourseList(courseList.filter(course => course.id !== courseId));
      adminAPI.deleteCourse(courseId).catch(err => {
        console.error('Failed to delete course', err);
        // revert on failure
        // re-fetch courses to be safe
        fetchCourses();
      });
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setCourseForm({ ...courseForm, subjects: [...courseForm.subjects, newSubject.trim()] });
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (index) => {
    setCourseForm({ ...courseForm, subjects: courseForm.subjects.filter((_, i) => i !== index) });
  };

  const handleSubmitCourse = (e) => {
    e.preventDefault();
    const payload = {
      title: courseForm.title,
      duration: courseForm.duration,
      description: courseForm.description,
      subjects: courseForm.subjects,
      fee: courseForm.fee,
      intake: courseForm.intake,
      level: courseForm.level,
      credits: parseInt(courseForm.credits || '0', 10),
      color: courseForm.color
    };

    if (editingCourse) {
      adminAPI.updateCourse(editingCourse.id, payload).then((updated) => {
        setCourseList(courseList.map(c => c.id === updated.id ? updated : c));
        setShowCourseModal(false);
        resetForm();
      }).catch(err => {
        console.error('Failed to update course', err);
        alert('Failed to update course');
      });
    } else {
      adminAPI.createCourse(payload).then((created) => {
        // API returns the created course with parsed subjects
        setCourseList(prev => [created, ...prev]);
        setShowCourseModal(false);
        resetForm();
      }).catch(err => {
        console.error('Failed to create course', err);
        alert('Failed to create course');
      });
    }
  };

  // Fetch courses from backend (admin API). Falls back to local static data if request fails.
  const fetchCourses = async () => {
    try {
      const data = await adminAPI.getCourses();
      setCourseList(data || []);
    } catch (err) {
      console.warn('Failed to load courses from API, falling back to local data', err);
      setCourseList(localCourses);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600', emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600', indigo: 'from-indigo-500 to-indigo-600',
      rose: 'from-rose-500 to-rose-600', teal: 'from-teal-500 to-teal-600',
      cyan: 'from-cyan-500 to-cyan-600', violet: 'from-violet-500 to-violet-600',
      orange: 'from-orange-500 to-orange-600', lime: 'from-lime-500 to-lime-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="h-7 w-7 mr-3" />Course Management
            </h2>
            <button onClick={() => { resetForm(); setShowCourseModal(true); }}
              className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium shadow-lg">
              <Plus className="h-4 w-4 mr-2" />Add New Course
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseList.map(course => (
              <div key={course.id} className="bg-white border-2 border-gray-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`bg-gradient-to-r ${getColorClasses(course.color)} p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                      <p className="text-white/90 text-sm flex items-center"><Clock className="h-4 w-4 mr-1" />{course.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCourse(course)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4 text-white" />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  <div className="flex items-center text-sm text-gray-700"><Award className="h-4 w-4 mr-2 text-purple-500" /><span className="font-medium">{course.level}</span></div>
                  <div className="flex items-center text-sm text-gray-700"><DollarSign className="h-4 w-4 mr-2 text-green-500" /><span className="font-medium">{course.fee}</span></div>
                  <div className="flex items-center text-sm text-gray-700"><Calendar className="h-4 w-4 mr-2 text-blue-500" /><span>{course.intake}</span></div>
                  <div className="flex items-center text-sm text-gray-700"><BookOpen className="h-4 w-4 mr-2 text-orange-500" /><span>{course.credits} Credits</span></div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Key Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const courseSubjects = parseSubjects(course.subjects);
                        return (
                          <>
                            {courseSubjects.slice(0, 3).map((subject, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{subject}</span>
                            ))}
                            {courseSubjects.length > 3 && (<span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">+{courseSubjects.length - 3} more</span>)}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {courseList.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses available</p>
              <p className="text-gray-400 text-sm">Click "Add New Course" to create one</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center"><Users className="h-7 w-7 mr-3" />Attendance Management</h2>
        </div>
        <div className="p-6">
          <AttendanceManagement />
        </div>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-white">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={() => { setShowCourseModal(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmitCourse} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input type="text" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Bachelor of Theology (B.Th)" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                <select required value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Level</option>
                  {levels.map(level => <option key={level} value={level}>{level}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input type="text" required value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 4 Years" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Credits *</label><input type="number" required value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 120" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Brief course description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Fee *</label>
                  <input type="text" required value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., $12,000/year" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Intake *</label>
                  <input type="text" required value={courseForm.intake} onChange={(e) => setCourseForm({ ...courseForm, intake: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Fall & Spring" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Color Theme *</label>
                <select required value={courseForm.color} onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {colors.map(color => <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a subject" />
                  <button type="button" onClick={handleAddSubject} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseForm.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      <span className="text-sm">{subject}</span>
                      <button type="button" onClick={() => handleRemoveSubject(index)} className="hover:bg-blue-200 rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowCourseModal(false); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
