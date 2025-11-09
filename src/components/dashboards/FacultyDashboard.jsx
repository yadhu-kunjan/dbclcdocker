import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, FileText, Upload, CheckSquare, Calendar, TrendingUp, Award, Clock, Star, ChevronRight, Plus, Download, Eye, GraduationCap, BarChart3, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { facultyAPI } from '../../services/api';

export function FacultyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const facultyId = user?.id || '';

  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      if (!facultyId || !isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch data from API
        const [profileRes, coursesRes, submissionsRes, eventsRes, achievementsRes, materialsRes] = await Promise.all([
          facultyAPI.getProfile(facultyId),
          facultyAPI.getCourses(facultyId),
          facultyAPI.getSubmissions(facultyId),
          facultyAPI.getEvents(facultyId),
          facultyAPI.getAchievements(facultyId),
          facultyAPI.getMaterials(facultyId),
        ]);
        
        if (!isMounted) return;
        
        setProfile(profileRes.faculty || null);
        setCourses(coursesRes.courses || []);
        setSubmissions(submissionsRes.submissions || []);
        setEvents(eventsRes.events || []);
        setAchievements(achievementsRes.achievements || []);
        setMaterials(materialsRes.materials || {});
        
      } catch (e) {
        console.error('Failed to load faculty data', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    loadData();
    
    return () => { isMounted = false; };
  }, [facultyId, isAuthenticated]);

  // Calculate statistics from database data
  const totalStudents = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.students_count || 0), 0);
  }, [courses]);

  const totalPendingReviews = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.pending_reviews || 0), 0);
  }, [courses]);

  const newEnrollments = useMemo(() => {
    // This would come from database - showing mock calculation
    return Math.floor(totalStudents * 0.15);
  }, [totalStudents]);

  const stats = [
    { 
      name: 'Active Courses', 
      value: String(courses.length), 
      icon: BookOpen, 
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: `${courses.length} active`,
      changeType: 'positive'
    },
    { 
      name: 'Total Students', 
      value: String(totalStudents), 
      icon: Users, 
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      change: `${newEnrollments} new enrollments`,
      changeType: 'positive'
    },
    { 
      name: 'Pending Reviews', 
      value: String(totalPendingReviews), 
      icon: FileText, 
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      change: totalPendingReviews > 0 ? 'Action required' : 'All clear',
      changeType: totalPendingReviews > 0 ? 'warning' : 'positive'
    },
    { 
      name: 'Materials Uploaded', 
      value: String(materials?.total_uploaded || 0), 
      icon: Upload, 
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: 'Total uploaded',
      changeType: 'positive'
    },
  ];

  const getIconComponent = (iconType) => {
    switch(iconType) {
      case 'star': return Star;
      case 'award': return Award;
      case 'clock': return Clock;
      default: return Award;
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'rating': return 'text-yellow-500';
      case 'completion': return 'text-blue-500';
      case 'performance': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the faculty dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header with Faculty Photo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6">
                {/* Professional Faculty Photo from Database */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg bg-white shadow-lg overflow-hidden border-4 border-white">
                    {profile?.photo_url || profile?.photoUrl || profile?.photo ? (
                      <img
                        src={profile?.photo_url || profile?.photoUrl || profile?.photo}
                        alt="Faculty"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"><svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <User className="w-16 h-16 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Faculty Information from Database */}
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-1">
                    {profile?.name || user?.username || 'Faculty Name'}
                  </h1>
                  <p className="text-blue-100 text-sm font-medium mb-3">
                    {profile?.department || 'Department'} • Faculty ID: {profile?.faculty_id || facultyId || '—'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                      <GraduationCap className="w-3 h-3 mr-1.5" />
                      {profile?.designation || 'Professor'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                      <Clock className="w-3 h-3 mr-1.5" />
                      {profile?.experience_years || 0} Years Experience
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Rating Display from Database */}
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Student Rating</div>
                <div className="text-4xl font-bold text-white mb-1">
                  {profile?.rating || 'N/A'}
                </div>
                <div className="text-white/70 text-xs">Out of 5.0</div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Bar from Database */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                <div className="text-xs text-gray-600 font-medium">Active Courses</div>
              </div>
              <div className="text-center md:border-l border-gray-300">
                <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                <div className="text-xs text-gray-600 font-medium">Total Students</div>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0">
                <div className="text-2xl font-bold text-gray-900">{submissions.filter(s => s.status === 'graded').length}</div>
                <div className="text-xs text-gray-600 font-medium">Graded</div>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0">
                <div className="text-2xl font-bold text-gray-900">{materials?.total_uploaded || 0}</div>
                <div className="text-xs text-gray-600 font-medium">Materials</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    stat.changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                    stat.changeType === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Course Management from Database */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                My Courses
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length > 0 ? courses.map((course) => (
                <div key={course.course_id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{course.course_code || course.course_id}</h3>
                      <p className="text-sm text-gray-600">{course.course_name}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      course.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {course.status || 'Active'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Students:</span>
                      <span className="font-semibold text-gray-900">{course.students_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Assignments:</span>
                      <span className="font-semibold text-gray-900">{course.assignments_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Materials:</span>
                      <span className="font-semibold text-gray-900">{course.materials_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Pending Reviews:</span>
                      <span className="font-semibold text-amber-600">{course.pending_reviews || 0}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Manage
                    </button>
                    <button className="flex-1 border-2 border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                      Upload
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-gray-500">No courses assigned</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Submissions from Database */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2 text-emerald-600" />
                  Recent Submissions
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {submissions.length > 0 ? submissions.map((submission) => (
                  <div key={submission.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {submission.student_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{submission.student_name}</p>
                      <p className="text-sm text-gray-600">{submission.assignment_name}</p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        <span className="text-xs text-blue-600 font-medium">{submission.course_code}</span>
                        <span className="text-xs text-gray-500">{submission.submitted_at}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.status === 'graded' && submission.grade && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          {submission.grade}
                        </span>
                      )}
                      <button className={`p-2 rounded-lg transition-colors ${
                        submission.status === 'graded' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                      }`}>
                        {submission.status === 'graded' ? <CheckSquare className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">No recent submissions</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                  <Upload className="h-7 w-7 text-blue-600 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Upload Material</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  <FileText className="h-7 w-7 text-emerald-600 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Create Assignment</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                  <Calendar className="h-7 w-7 text-amber-600 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Attendance</span>
                </button>
                <button className="flex flex-col items-center p-4 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                  <CheckSquare className="h-7 w-7 text-purple-600 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Grade Work</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events from Database */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                Upcoming Events
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                        <p className="text-xs text-gray-600 mt-1 capitalize">{event.type}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-semibold text-gray-700">{event.date}</span>
                          <span className="text-xs font-semibold text-gray-700">{event.time}</span>
                        </div>
                      </div>
                      <div className="ml-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">No upcoming events</div>
                )}
              </div>
            </div>
          </div>

          {/* Achievements from Database */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Recent Achievements
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {achievements.length > 0 ? achievements.map((achievement) => {
                  const IconComponent = getIconComponent(achievement.icon_type);
                  const iconColor = getIconColor(achievement.type);
                  return (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-300 transition-all">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">No achievements yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;