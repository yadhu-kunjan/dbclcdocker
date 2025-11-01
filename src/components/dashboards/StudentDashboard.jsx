import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, CreditCard, BarChart3, Bell, Calendar, User, TrendingUp, Award, Clock, ChevronRight, Download, Eye, GraduationCap, Target, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api.js';

export function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const studentId = user?.id || user?.studentId || '';

  const [courses, setCourses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      if (!studentId || !isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        // Make real API calls to fetch student data
        const [profileRes, coursesRes, marksRes, feesRes, assignmentsRes, attendanceRes] = await Promise.all([
          studentAPI.getProfile(studentId),
          studentAPI.getCourses(studentId),
          studentAPI.getMarks(studentId),
          studentAPI.getFees(studentId),
          studentAPI.getAssignments(studentId),
          studentAPI.getAttendance(studentId),
        ]);
        
        if (!isMounted) return;
        
        setProfile(profileRes.student || null);
        setCourses(coursesRes.courses || []);
        setMarks(marksRes.marks || []);
        setFees(feesRes.fees || []);
        setAssignments(assignmentsRes.assignments || []);
        setAttendance(attendanceRes.attendance || null);
        
        // Generate deadlines from assignments
        const assignmentsData = assignmentsRes.assignments || [];
        const deadlinesData = assignmentsData
          .filter(a => a.status === 'pending')
          .map(a => ({
            title: a.title,
            course: a.course_id,
            date: a.due_date,
            time: a.due_time || '11:59 PM',
            priority: new Date(a.due_date) - new Date() < 86400000 ? 'high' : 
                     new Date(a.due_date) - new Date() < 259200000 ? 'medium' : 'low'
          }));
        setDeadlines(deadlinesData);
        
      } catch (e) {
        console.error('Failed to load student data', e);
        // Set empty data on error
        setProfile(null);
        setCourses([]);
        setMarks([]);
        setFees([]);
        setAssignments([]);
        setAttendance(null);
        setDeadlines([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    loadData();
    
    return () => { isMounted = false; };
  }, [studentId, isAuthenticated]);

  // Calculate statistics from database data
  const enrolledCoursesCount = courses.length;
  
  const pendingAssignments = assignments.filter(a => 
    a.status === 'pending' || a.status === 'not_submitted'
  ).length;

  const unpaidFees = fees.find(f => 
    (f.payment_status || '').toLowerCase() !== 'paid'
  );
  const feeStatus = unpaidFees ? 'Due' : (fees.length ? 'Paid' : 'N/A');

  const overallGrade = useMemo(() => {
    if (!marks.length) return 'N/A';
    const validMarks = marks.filter(m => m.total_mark && !isNaN(Number(m.total_mark)));
    if (!validMarks.length) return 'N/A';
    const avg = validMarks.reduce((sum, m) => sum + Number(m.total_mark), 0) / validMarks.length;
    if (avg >= 90) return 'A+';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    return 'D';
  }, [marks]);

  const attendancePercentage = useMemo(() => {
    if (!attendance || !attendance.total_classes) return 'N/A';
    return Math.round((attendance.attended_classes / attendance.total_classes) * 100);
  }, [attendance]);

  const totalExams = marks.length;
  
  const completedAssignments = assignments.filter(a => 
    a.status === 'submitted' || a.status === 'graded'
  ).length;

  const stats = [
    { 
      name: 'Enrolled Courses', 
      value: String(enrolledCoursesCount), 
      icon: BookOpen, 
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: `${enrolledCoursesCount} active`,
      trend: 'up'
    },
    { 
      name: 'Pending Assignments', 
      value: String(pendingAssignments), 
      icon: FileText, 
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      change: pendingAssignments > 0 ? 'Action required' : 'All clear',
      trend: pendingAssignments > 0 ? 'neutral' : 'up'
    },
    { 
      name: 'Fee Status', 
      value: feeStatus, 
      icon: CreditCard, 
      iconBg: feeStatus === 'Paid' ? 'bg-emerald-100' : 'bg-red-100',
      iconColor: feeStatus === 'Paid' ? 'text-emerald-600' : 'text-red-600',
      change: feeStatus === 'Paid' ? 'All clear' : 'Payment due',
      trend: feeStatus === 'Paid' ? 'up' : 'down'
    },
    { 
      name: 'Overall Grade', 
      value: overallGrade, 
      icon: BarChart3, 
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: marks.length > 0 ? 'Current average' : 'No data',
      trend: 'up'
    },
  ];

  // Format activities from database
  const recentActivities = useMemo(() => {
    const formattedActivities = [];
    
    marks.slice(0, 3).forEach(m => {
      formattedActivities.push({ 
        type: 'grade', 
        title: `Marks updated: ${m.course_name}`, 
        course: m.course_id, 
        grade: `${m.total_mark}`,
        time: m.updated_at || '2 hours ago',
        icon: TrendingUp,
        color: 'bg-emerald-100 text-emerald-600'
      });
    });
    
    fees.slice(0, 1).forEach(f => {
      formattedActivities.push({ 
        type: 'fee', 
        title: 'Fee payment processed', 
        amount: `${f.amount_paid}`, 
        status: f.payment_status,
        time: f.payment_date || '1 day ago',
        icon: CreditCard,
        color: 'bg-blue-100 text-blue-600'
      });
    });
    
    formattedActivities.push(
      { type: 'assignment', title: 'New assignment posted', course: 'CS101', time: '3 days ago', icon: FileText, color: 'bg-amber-100 text-amber-600' },
      { type: 'announcement', title: 'Exam schedule updated', course: 'General', time: '1 week ago', icon: Bell, color: 'bg-purple-100 text-purple-600' }
    );
    
    return formattedActivities;
  }, [marks, fees]);

  // Show loading state
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

  // Show authentication required message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header with Student Photo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6">
                {/* Professional Student Photo from Database */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg bg-white shadow-lg overflow-hidden border-4 border-white">
                    {profile?.photo_url || profile?.photoUrl || profile?.photo ? (
                      <img
                        src={profile?.photo_url || profile?.photoUrl || profile?.photo}
                        alt="Student"
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
                
                {/* Student Information from Database */}
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-1">
                    {profile?.name || user?.username || 'Student Name'}
                  </h1>
                  <p className="text-blue-100 text-sm font-medium mb-3">
                    Student ID: {profile?.student_id || studentId || '—'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                      <GraduationCap className="w-3 h-3 mr-1.5" />
                      {profile?.program || profile?.course || 'Not Assigned'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {profile?.semester || 'Semester N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* GPA Display from Database */}
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Current GPA</div>
                <div className="text-4xl font-bold text-white mb-1">
                  {profile?.gpa || profile?.cgpa || 'N/A'}
                </div>
                <div className="text-white/70 text-xs">Out of 4.0</div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Bar from Database */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{enrolledCoursesCount}</div>
                <div className="text-xs text-gray-600 font-medium">Active Courses</div>
              </div>
              <div className="text-center md:border-l border-gray-300">
                <div className="text-2xl font-bold text-gray-900">
                  {attendancePercentage !== 'N/A' ? `${attendancePercentage}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-600 font-medium">Attendance</div>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0">
                <div className="text-2xl font-bold text-gray-900">{totalExams}</div>
                <div className="text-xs text-gray-600 font-medium">Exams Taken</div>
              </div>
              <div className="text-center border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0">
                <div className="text-2xl font-bold text-gray-900">{completedAssignments}</div>
                <div className="text-xs text-gray-600 font-medium">Assignments Done</div>
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
                    stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                    stat.trend === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activities from Database */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activities
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className={`p-2.5 rounded-lg ${activity.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                        <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                          <p className="text-xs text-gray-600">
                            {activity.course && `${activity.course}`}
                            {activity.grade && ` • Grade: ${activity.grade}`}
                            {activity.amount && ` • ${activity.amount} • ${activity.status}`}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">No recent activities</div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines from Database */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-amber-600" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {deadlines.length > 0 ? deadlines.map((deadline, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    deadline.priority === 'high' ? 'border-red-500 bg-red-50' :
                    deadline.priority === 'medium' ? 'border-amber-500 bg-amber-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm pr-2">{deadline.title}</h3>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                        deadline.priority === 'high' ? 'bg-red-500' :
                        deadline.priority === 'medium' ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}></span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-2">{deadline.course}</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>{deadline.date}</span>
                      <span>{deadline.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">No upcoming deadlines</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Courses and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses from Database */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
                  My Courses
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.length > 0 ? courses.map((c) => {
                  // Find grade for this course from marks
                  const courseMark = marks.find(m => m.course_id === c.course_id);
                  const grade = courseMark ? 
                    (courseMark.grade || 
                     (courseMark.total_mark >= 90 ? 'A+' :
                      courseMark.total_mark >= 80 ? 'A' :
                      courseMark.total_mark >= 70 ? 'B' :
                      courseMark.total_mark >= 60 ? 'C' : 'D')) : 'N/A';
                  
                  return (
                    <div key={c.course_id || c.course_name} className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{grade}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {c.course_name || c.name || c.course_id}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        {c.department || c.course_code || 'Course Code N/A'}
                      </p>
                    </div>
                  );
                }) : (
                  <div className="col-span-2 text-center py-8 text-gray-500 text-sm">No courses enrolled</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-semibold text-gray-900 text-sm">Browse Courses</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors text-left">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-amber-600 mr-3" />
                    <span className="font-semibold text-gray-900 text-sm">Submit Assignment</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors text-left">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="font-semibold text-gray-900 text-sm">Pay Fees</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors text-left">
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-semibold text-gray-900 text-sm">Download Results</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;