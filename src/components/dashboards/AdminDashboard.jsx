import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, FileText, CheckCircle, XCircle, Clock, Search, Download, Mail, Phone, MapPin, Calendar, GraduationCap, Award, Bell, Eye, Shield, Activity, Briefcase, CreditCard, Send, UserCheck, Filter, Globe, User, BookOpen, ClipboardList, BarChart3, Plus, Edit, Trash2, Upload, Calendar as CalendarIcon } from 'lucide-react';
// Assuming api.js is in a services folder, adjust path as needed
// import { adminAPI, academicAPI } from '../../services/api.js';

// --- MOCK API ---
// We'll create mock API functions to simulate the backend
// and make the component runnable for debugging.
const mockApi = (data, delay = 500) => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const adminAPI = {
  getStats: () => mockApi({
    success: true,
    stats: {
      pending: 5,
      approved: 12,
      rejected: 2,
      awaitingPayment: 3,
      fullyEnrolled: 9,
      totalRevenue: 4500000,
      paidCount: 9
    }
  }),
  getSettings: () => mockApi({
    success: true,
    settings: {
      institution_name: 'DBCLC Institute of Theology',
      admin_name: 'Dr. Sarah Johnson',
      admin_role: 'Super Administrator',
      admin_email: 'sarah.johnson@dbclc.edu'
    }
  }),
  getApplications: (params = {}) => mockApi({
    success: true,
    applications: [
      { id: 1, candidateName: 'John Doe', email: 'john.doe@example.com', mobileNo: '9876543210', courseName: 'Masters in Theology', courseFee: '₹50,000', status: 'pending', paymentStatus: 'unpaid', dateOfBirth: '1995-03-15', fatherName: 'Richard Doe', nationality: 'Indian', religionCaste: 'Christian', educationalQualification: 'B.Th', fullAddress: '123 Gospel St, Bangalore', superintendentOfServer: 'Rev. Michael', submittedAt: new Date().toISOString() },
      { id: 2, candidateName: 'Jane Smith', email: 'jane.smith@example.com', mobileNo: '8765432109', courseName: 'Bachelors in Divinity', courseFee: '₹40,000', status: 'approved', paymentStatus: 'unpaid', dateOfBirth: '1998-07-22', fatherName: 'Robert Smith', nationality: 'Indian', religionCaste: 'Christian', educationalQualification: 'PUC', fullAddress: '456 Faith Ave, Mumbai', superintendentOfServer: 'Rev. David', submittedAt: new Date(Date.now() - 86400000).toISOString(), approvedAt: new Date().toISOString() },
      { id: 3, candidateName: 'Mike Johnson', email: 'mike.j@example.com', mobileNo: '7654321098', courseName: 'Bachelors in Divinity', courseFee: '₹40,000', status: 'approved', paymentStatus: 'paid', dateOfBirth: '1997-01-10', fatherName: 'Peter Johnson', nationality: 'Indian', religionCaste: 'Christian', educationalQualification: 'PUC', fullAddress: '789 Grace Rd, Delhi', superintendentOfServer: 'Rev. Michael', submittedAt: new Date(Date.now() - 172800000).toISOString(), approvedAt: new Date(Date.now() - 86400000).toISOString(), paidAt: new Date().toISOString() },
      { id: 4, candidateName: 'Sarah Williams', email: 's.williams@example.com', mobileNo: '6543210987', courseName: 'Masters in Theology', courseFee: '₹50,000', status: 'rejected', paymentStatus: 'unpaid', dateOfBirth: '1996-11-30', fatherName: 'Chris Williams', nationality: 'Indian', religionCaste: 'Christian', educationalQualification: 'B.Th', fullAddress: '101 Church Ln, Kolkata', superintendentOfServer: 'Rev. David', submittedAt: new Date(Date.now() - 259200000).toISOString() },
      // Added an entry with null candidateName to test the fix
      { id: 5, candidateName: null, email: 'no.name@example.com', mobileNo: '5432109876', courseName: 'Certificate in Ministry', courseFee: '₹20,000', status: 'pending', paymentStatus: 'unpaid', dateOfBirth: '1999-05-01', fatherName: 'N/A', nationality: 'Indian', religionCaste: 'Christian', educationalQualification: 'SSLC', fullAddress: '202 Hope Blvd, Chennai', superintendentOfServer: 'Rev. Michael', submittedAt: new Date().toISOString() },
    ].filter(app => {
      if (params.status && params.status !== 'all' && app.status !== params.status) return false;
      if (params.payment && params.payment !== 'all') {
        if (params.payment === 'paid' && app.paymentStatus !== 'paid') return false;
        if (params.payment === 'unpaid' && app.paymentStatus !== 'unpaid') return false;
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        return (
          app.candidateName?.toLowerCase().includes(s) ||
          app.email?.toLowerCase().includes(s) ||
          app.courseName?.toLowerCase().includes(s) ||
          app.mobileNo?.includes(s)
        );
      }
      return true;
    })
  }),
  updateApplicationStatus: (id, status) => mockApi({
    success: true,
    application: { id, candidateName: 'Updated User', email: 'test@example.com', courseName: 'B.Th', courseFee: '₹40,000', status, paymentStatus: status === 'approved' ? 'unpaid' : 'unpaid', approvedAt: status === 'approved' ? new Date().toISOString() : null }
  }),
  sendPaymentEmail: (id) => mockApi({ success: true, message: 'Email sent' }),
  updatePaymentStatus: (id, status) => mockApi({
    success: true,
    application: { id, candidateName: 'Paid User', email: 'paid@example.com', courseName: 'B.Th', courseFee: '₹40,000', status: 'approved', paymentStatus: 'paid', paidAt: new Date().toISOString() }
  }),
  exportApplications: () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "id,candidateName,email,courseName,status,paymentStatus\n"
      + "1,John Doe,john.doe@example.com,Masters in Theology,pending,unpaid\n"
      + "2,Jane Smith,jane.smith@example.com,Bachelors in Divinity,approved,unpaid\n";
    const blob = new Blob([csvContent.split(",")[1]], { type: 'text/csv' });
    return mockApi(blob);
  }
};

const academicAPI = {
  getAcademicStats: () => mockApi({
    success: true,
    stats: {
      assignments: { total_assignments: 20, graded_assignments: 15, pending_assignments: 5 },
      attendance: { total_records: 150, present_count: 140, absent_count: 10 },
      students: { total_students: 12, active_students: 12 }
    }
  }),
  getAssignments: () => mockApi({
    success: true,
    assignments: [
      { id: 1, title: 'Old Testament Survey', student_name: 'Jane Smith', course_name: 'Bachelors in Divinity', due_date: '2025-10-25', max_marks: 100, marks_obtained: 85, feedback: 'Good work.', file_path: 'assignments/jane_ot_survey.pdf' },
      { id: 2, title: 'New Testament Analysis', student_name: 'Mike Johnson', course_name: 'Bachelors in Divinity', due_date: '2025-10-28', max_marks: 100, marks_obtained: null, feedback: null, file_path: 'assignments/mike_nt_analysis.pdf' },
    ]
  }),
  getAttendance: () => mockApi({
    success: true,
    attendance: [
      { id: 1, student_name: 'Jane Smith', course_name: 'Bachelors in Divinity', attendance_date: '2025-10-31', status: 'present', remarks: '' },
      { id: 2, student_name: 'Mike Johnson', course_name: 'Bachelors in Divinity', attendance_date: '2025-10-31', status: 'present', remarks: '' },
    ]
  }),
  createAssignment: (data) => mockApi({ success: true, assignment: { id: Date.now(), ...data, student_name: 'New Student', course_name: 'B.Th' } }),
  gradeAssignment: (id, marks, feedback) => mockApi({ success: true, assignment: { id, title: 'Graded Assignment', student_name: 'Mike Johnson', course_name: 'B.Th', max_marks: 100, marks_obtained: marks, feedback } }),
  bulkMarkAttendance: (date, records) => mockApi({ success: true, count: records.length }),
  deleteAssignment: (id) => mockApi({ success: true })
};
// --- END MOCK API ---


export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    awaitingPayment: 0,
    fullyEnrolled: 0,
    totalRevenue: 0,
    paidCount: 0
  });
  const [adminSettings, setAdminSettings] = useState({
    institution_name: 'DBCLC Institute of Theology',
    admin_name: 'Dr. Sarah Johnson',
    admin_role: 'Super Administrator',
    admin_email: 'sarah.johnson@dbclc.edu'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application management state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Academic management state
  const [activeTab, setActiveTab] = useState('applications');
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [academicStats, setAcademicStats] = useState({
    assignments: { total_assignments: 0, graded_assignments: 0, pending_assignments: 0 },
    attendance: { total_records: 0, present_count: 0, absent_count: 0 },
    students: { total_students: 0, active_students: 0 }
  });
  
  // Assignment management state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    student_id: '',
    due_date: '',
    max_marks: 100,
    assignment_type: 'homework',
    instructions: ''
  });
  
  // Attendance management state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Helper function to get initials safely
  /**
   * BUG FIX:
   * The original guard `if (!name)` was not robust enough.
   * If the API passes a non-string value (e.g., a number, or even null in some edge cases),
   * the `!name` check might pass, leading to an error on `name.split(' ')`.
   * * The new guard `if (typeof name !== 'string' || name.length === 0)`
   * explicitly checks if 'name' is a string and is not empty.
   * This prevents the `TypeError` if `application.candidateName` is null,
   * undefined, a number, or any other non-string value.
   */
  const getInitials = (name) => {
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

  const loadDashboardData = async () => {
    try {
      console.log('Starting to load dashboard data...');
      setLoading(true);
      setError(null);
      
      // Mocking token check
      const token = 'mock-auth-token'; // localStorage.getItem('authToken');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.error('No auth token found');
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Proceeding to load dashboard data...');
      
      const handleApiCall = async (name, promise) => {
        try {
          console.log(`Starting ${name} API call...`);
          const result = await promise;
          console.log(`${name} API call succeeded:`, result);
          return result;
        } catch (err) {
          console.error(`${name} API call failed:`, err);
          throw err;
        }
      };
      
      const [statsResponse, settingsResponse, academicStatsResponse, applicationsResponse] = await Promise.all([
        handleApiCall('getStats', adminAPI.getStats()),
        handleApiCall('getSettings', adminAPI.getSettings()),
        handleApiCall('getAcademicStats', academicAPI.getAcademicStats()),
        handleApiCall('getApplications', adminAPI.getApplications()) // Initial load, no params
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        throw new Error('Failed to load admin stats');
      }
      
      if (settingsResponse.success && settingsResponse.settings) {
        setAdminSettings(settingsResponse.settings);
      } else {
        throw new Error('Failed to load admin settings');
      }
      
      if (academicStatsResponse.success) {
        setAcademicStats(academicStatsResponse.stats);
      } else {
        throw new Error('Failed to load academic stats');
      }

      if (applicationsResponse.success) {
        setApplications(applicationsResponse.applications || []);
      } else {
        throw new Error('Failed to load applications');
      }
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicData = async () => {
    try {
      const [assignmentsResponse, attendanceResponse] = await Promise.all([
        academicAPI.getAssignments(),
        academicAPI.getAttendance()
      ]);
      
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.assignments);
      }
      
      if (attendanceResponse.success) {
        setAttendance(attendanceResponse.attendance);
      }
    } catch (err)
 {
      console.error('Error loading academic data:', err);
      setError('Failed to load academic data');
    }
  };

  const loadApplications = async () => {
    try {
      console.log('=== LOADING APPLICATIONS ===');
      console.log('Filter params:', { status: filterStatus, payment: filterPayment, search: searchTerm });
      
      const params = {
        status: filterStatus,
        payment: filterPayment,
        search: searchTerm
      };
      
      // We set loading to true only for filter/search, not initial load
      // setLoading(true); 
      
      const response = await adminAPI.getApplications(params);
      console.log('API Response:', response);
      
      if (response?.success) {
        console.log('Setting applications:', response.applications);
        setApplications(response.applications || []);
      } else {
        console.error('API returned error:', response);
        setError(response?.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error('\n=== APPLICATION LOADING ERROR ===');
      console.error('Error message:', err.message);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      console.error('Request config:', err.config);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to load applications';
      
      setError(errorMessage);
      setApplications([]);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    // This effect runs once on mount to load initial dashboard stats
    // and the first batch of applications.
    loadDashboardData();
  }, []);

  useEffect(() => {
    // This effect runs on mount *and* whenever filters change.
    // We skip the first run (on mount) because loadDashboardData
    // already fetches the initial applications.
    const handler = setTimeout(() => {
      loadApplications();
    }, 300); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, filterStatus, filterPayment]);


  const updateApplicationStatus = async (id, status) => {
    try {
      const response = await adminAPI.updateApplicationStatus(id, status);
      
      if (response.success) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, ...response.application } : app
        ));
        
        // Refresh stats after status update
        const statsResponse = await adminAPI.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }
        
        if (status === 'approved') {
          // Find the full application object to send to the modal
          const updatedApp = applications.find(app => app.id === id) || response.application;
          setSelectedApplication({ ...updatedApp, ...response.application });
          setShowEmailModal(true);
        }
        
        alert(`✅ Application ${status} successfully`);
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('❌ Failed to update application status');
    }
  };

  const sendPaymentEmail = async (application) => {
    if (!application) return;
    try {
      console.log('Sending payment email to:', application.email);
      
      const response = await adminAPI.sendPaymentEmail(application.id);
      
      if (response.success) {
        alert(`✅ Payment request email sent successfully to ${application.candidateName} at ${application.email}\n\nThe student will receive:\n- Course fee details: ${application.courseFee}\n- Payment instructions\n- Payment deadline\n- Payment portal link`);
      } else {
        alert(`⚠️ Email sending failed: ${response.message || 'Unknown error'}\n\nPlease contact the student directly at ${application.email}`);
      }
    } catch (error) {
      console.error('Error sending payment email:', error);
      alert(`❌ Failed to send email: ${error.message}\n\nPlease contact the student directly at ${application.email}`);
    } finally {
      setShowEmailModal(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      const response = await adminAPI.updatePaymentStatus(id, 'paid');
      
      if (response.success) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, ...response.application } : app
        ));
        
        // Refresh stats after payment update
        const statsResponse = await adminAPI.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }
        
        alert('✅ Payment status updated to PAID');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('❌ Failed to update payment status');
    }
  };

  const viewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const exportToCSV = async () => {
    try {
      const params = {
        status: filterStatus,
        payment: filterPayment
      };
      
      const blob = await adminAPI.exportApplications(params);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); // Required for Firefox
      a.click();
      a.remove(); // Clean up
      window.URL.revokeObjectURL(url);
      
      alert('✅ CSV export completed successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('❌ Failed to export CSV');
    }
  };

  // The filtering logic is now handled by the API/backend
  // We just use the 'applications' state directly.
  const filteredApplications = applications || [];

  const createAssignment = async () => {
    try {
      const response = await academicAPI.createAssignment(assignmentForm);
      if (response.success) {
        setAssignments(prev => [response.assignment, ...prev]);
        setShowAssignmentModal(false);
        setAssignmentForm({
          title: '',
          description: '',
          student_id: '',
          due_date: '',
          max_marks: 100,
          assignment_type: 'homework',
          instructions: ''
        });
        alert('✅ Assignment created successfully');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('❌ Failed to create assignment');
    }
  };

  const gradeAssignment = async (marks, feedback) => {
    if (!selectedAssignment) return;
    try {
      const response = await academicAPI.gradeAssignment(selectedAssignment.id, marks, feedback);
      if (response.success) {
        setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? response.assignment : a));
        setShowGradeModal(false);
        setSelectedAssignment(null);
        alert('✅ Assignment graded successfully');
      }
    } catch (err) {
      console.error('Error grading assignment:', err);
      alert('❌ Failed to grade assignment');
    }
  };

  const markBulkAttendance = async () => {
    try {
      const response = await academicAPI.bulkMarkAttendance(attendanceDate, attendanceRecords);
      if (response.success) {
        setShowAttendanceModal(false);
        setAttendanceRecords([]);
        loadAcademicData(); // Refresh attendance list
        alert('✅ Attendance marked successfully');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('❌ Failed to mark attendance');
    }
  };

  const dashboardStats = [
    { name: 'Pending Review', value: stats.pending.toString(), icon: Clock, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-600', change: 'Action Required' },
    { name: 'Awaiting Payment', value: stats.awaitingPayment.toString(), icon: CreditCard, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', change: 'Send Reminders' },
    { name: 'Fully Enrolled', value: stats.fullyEnrolled.toString(), icon: UserCheck, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-600', change: 'Active Students' },
    { name: 'Total Revenue', value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`, icon: DollarSign, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-600', change: `${stats.paidCount} paid` },
  ];

  const academicDashboardStats = [
    { name: 'Total Assignments', value: academicStats.assignments.total_assignments.toString(), icon: BookOpen, color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-600', change: `${academicStats.assignments.graded_assignments} graded` },
    { name: 'Pending Grading', value: academicStats.assignments.pending_assignments.toString(), icon: Clock, color: 'from-orange-500 to-red-500', textColor: 'text-orange-600', change: 'Needs Review' },
    { name: 'Attendance Records', value: academicStats.attendance.total_records.toString(), icon: ClipboardList, color: 'from-green-500 to-emerald-500', textColor: 'text-green-600', change: `${academicStats.attendance.present_count} present` },
    { name: 'Active Students', value: academicStats.students.active_students.toString(), icon: Users, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-600', change: `${academicStats.students.total_students} total` },
  ];

  const adminProfile = {
    name: adminSettings.admin_name || "Dr. Sarah Johnson",
    role: adminSettings.admin_role || "Super Administrator",
    email: adminSettings.admin_email || "sarah.johnson@dbclc.edu",
    avatar: getInitials(adminSettings.admin_name || "SJ"),
    institution: adminSettings.institution_name || "DBCLC Institute of Theology",
    lastLogin: new Date().toLocaleString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-sans">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg font-semibold text-gray-900">Loading dashboard...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <FileText className="h-7 w-7 mr-3" />
                  Application Details
                </h3>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <XCircle className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
                  {getInitials(selectedApplication?.candidateName)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedApplication.candidateName || 'N/A'}</h4>
                  <p className="text-gray-600">{selectedApplication.courseName || 'N/A'}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedApplication.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      selectedApplication.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(selectedApplication.status || 'pending').toUpperCase()}
                    </span>
                    {selectedApplication.status === 'approved' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedApplication.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedApplication.paymentStatus === 'paid' ? 'PAID' : 'Payment Pending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Email Address</span>
                  </div>
                  <p className="text-gray-900 font-medium break-words">{selectedApplication.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.mobileNo || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Date of Birth</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedApplication.dateOfBirth 
                      ? new Date(selectedApplication.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Father's Name</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.fatherName || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-cyan-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Nationality</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.nationality || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Religion/Caste</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.religionCaste || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Course Fee</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{selectedApplication.courseFee || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Superintendent</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.superintendentOfServer || 'N/A'}</p>
                </div>

                <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Educational Qualification</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.educationalQualification || 'N/A'}</p>
                </div>

                <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Full Address</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedApplication.fullAddress || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.submittedAt 
                        ? new Date(selectedApplication.submittedAt).toLocaleString('en-IN')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  {selectedApplication.approvedAt && (
                    <div>
                      <span className="text-gray-500">Approved:</span>
                      <p className="font-medium text-emerald-700">
                        {new Date(selectedApplication.approvedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {selectedApplication.paidAt && (
                    <div>
                      <span className="text-gray-500">Payment Received:</span>
                      <p className="font-medium text-green-700">
                        {new Date(selectedApplication.paidAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Mail className="h-7 w-7 mr-3 text-blue-600" />
                Send Payment Request Email
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                  {getInitials(selectedApplication?.candidateName)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedApplication.candidateName || 'N/A'}</h4>
                  <p className="text-sm text-gray-600 break-all">{selectedApplication.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Course</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedApplication.courseName || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Course Fee</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedApplication.courseFee || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Send className="h-5 w-5 mr-2 text-blue-600" />
                Email Content Preview
              </h4>
              <div className="text-sm text-gray-700 space-y-2 bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-semibold">Dear {selectedApplication.candidateName || 'Student'},</p>
                <p>Congratulations! Your application for {selectedApplication.courseName || 'the course'} has been approved.</p>
                <p>To complete your enrollment, please proceed with the fee payment:</p>
                <div className="bg-blue-50 p-3 rounded-lg my-3 border-l-4 border-blue-500">
                  <p className="font-bold text-blue-900">Course Fee: {selectedApplication.courseFee || 'N/A'}</p>
                  <p className="text-xs text-blue-700 mt-1">Payment Deadline: 7 days from approval</p>
                </div>
                <p>Click the link below to access the payment portal</p>
                <p className="mt-3">Best regards,<br/>{adminProfile.institution}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => sendPaymentEmail(selectedApplication)}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Payment Email
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
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
                  {adminProfile.avatar}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-white relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Award className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {adminProfile.name?.split(' ')[1] || adminProfile.name?.split(' ')[0] || 'Admin'}!</h2>
              <p className="text-blue-100 mb-6">Manage applications, approvals, and student enrollments</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-white" />
                    <div>
                      <p className="text-xs text-blue-100">Access Level</p>
                      <p className="font-semibold">{adminProfile.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-8 w-8 text-white" />
                    <div>
                      <p className="text-xs text-blue-100">Pending Tasks</p>
                      <p className="font-semibold">{stats.pending} Applications</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-8 w-8 text-white" />
                    <div>
                      <p className="text-xs text-blue-100">Payment Pending</p>
                      <p className="font-semibold">{stats.awaitingPayment} Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('applications')}
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
                  loadAcademicData();
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

        {/* Stats Grid - Dynamic based on active tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 'applications' ? dashboardStats : academicDashboardStats).map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
              </div>
            );
          })}
        </div>

        {/* Application Management */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FileText className="h-7 w-7 mr-3" />
                  Application Management
                </h2>
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-blue-50 transition-colors font-medium shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search by name, email, mobile, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-white/30 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium"
                >
                  <option value="all" className="text-gray-900">All Status</option>
                  <option value="pending" className="text-gray-900">Pending</option>
                  <option value="approved" className="text-gray-900">Approved</option>
                  <option value="rejected" className="text-gray-900">Rejected</option>
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="px-4 py-3 border-2 border-white/30 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium"
                >
                  <option value="all" className="text-gray-900">All Payments</option>
                  <option value="paid" className="text-gray-900">Paid</option>
                  <option value="unpaid" className="text-gray-900">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No applications found</p>
                  </div>
                ) : (
                  filteredApplications.slice().reverse().map((application) => (
                    <div key={application.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                            {getInitials(application?.candidateName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">{application.candidateName || 'N/A'}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <GraduationCap className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-gray-600 font-medium">{application.courseName || 'N/A'}</span>
                              <span className="text-sm font-bold text-emerald-600">{application.courseFee || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                            application.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                            application.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' :
                            'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                          }`}>
                            {(application.status || 'pending').toUpperCase()}
                          </span>
                          
                          {application.status === 'approved' && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              application.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {application.paymentStatus === 'paid' ? 'PAID' : 'Payment Pending'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 overflow-hidden">
                          <p className="text-xs text-blue-600 font-semibold">Email</p>
                          <p className="text-sm text-gray-900 truncate" title={application.email || 'N/A'}>{application.email || 'N/A'}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                          <p className="text-xs text-emerald-600 font-semibold">Mobile</p>
                          <p className="text-sm text-gray-900">{application.mobileNo || 'N/A'}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                          <p className="text-xs text-purple-600 font-semibold">DOB</p>
                          <p className="text-sm text-gray-900">{application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md font-medium"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Send Email
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-md font-medium"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {application.status === 'approved' && application.paymentStatus === 'unpaid' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowEmailModal(true);
                              }}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Resend Payment Email
                            </button>
                            <button
                              onClick={() => markAsPaid(application.id)}
                              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </button>
                          </>
                        )}
                        
                        {application.status === 'approved' && application.paymentStatus === 'paid' && (
                          <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Fully Enrolled
                          </div>
                        )}
                        
                        <button 
                          onClick={() => viewDetails(application)}
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                      </div>

                      <div className="text-xs text-gray-400 mt-3">
                        Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleString('en-IN') : 'N/A'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Academic Management */}
        {activeTab === 'academic' && (
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
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No assignments found</p>
                    </div>
                  ) : (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900">{assignment.title || 'N/A'}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600 font-medium">{assignment.student_name || 'N/A'}</span>
                              <span className="text-sm font-bold text-blue-600">{assignment.course_name || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                              assignment.marks_obtained ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {assignment.marks_obtained ? `Graded: ${assignment.marks_obtained}/${assignment.max_marks}` : 'Pending'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {assignment.description && (
                          <p className="text-gray-700 mb-4">{assignment.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                          {!assignment.marks_obtained && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowGradeModal(true);
                              }}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Grade Assignment
                            </button>
                          )}
                          
                          {assignment.file_path && (
                            <a
                              href={`/api/assignments/file/${assignment.file_path}`} // This link will be broken with mock API
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </a>
                          )}
                          
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this assignment?')) {
                                academicAPI.deleteAssignment(assignment.id).then(() => {
                                  setAssignments(prev => prev.filter(a => a.id !== assignment.id));
                                  alert('✅ Assignment deleted successfully');
                                }).catch(() => alert('❌ Failed to delete assignment'));
                              }
                            }}
                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>

                        {assignment.feedback && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900">Feedback:</p>
                            <p className="text-sm text-blue-800">{assignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Management */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <ClipboardList className="h-7 w-7 mr-3" />
                    Attendance Management
                  </h2>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="flex items-center px-4 py-2 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-colors font-medium shadow-lg"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {attendance.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No attendance records found</p>
                    </div>
                  ) : (
                    attendance.slice(0, 10).map((record) => (
                      <div key={record.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{record.student_name || 'N/A'}</h3>
                            <p className="text-sm text-gray-600">{record.course_name || 'N/A'}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(record.status || 'N/A').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {record.attendance_date ? new Date(record.attendance_date).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {record.remarks && (
                          <p className="text-sm text-gray-600 mt-2">{record.remarks}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
