// API service for backend communication
import axios from 'axios';

// Configure your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Remove Content-Type header for FormData to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Add response interceptor to handle network errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors, but only if not during login
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Method to refresh user data from server
  refreshUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Application API calls
export const applicationAPI = {
  submit: async (applicationData, photo = null) => {
    console.log('API submit called with photo:', photo);
    
    if (photo) {
      // Use photo upload endpoint
      const formData = new FormData();
      
      // Add all application data to FormData
      Object.keys(applicationData).forEach(key => {
        formData.append(key, applicationData[key]);
      });
      
      // Add photo
      formData.append('photo', photo);
      
      console.log('Submitting to /applications/with-photo with FormData');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log('Photo file details:', {
        name: photo.name,
        size: photo.size,
        type: photo.type,
        lastModified: photo.lastModified
      });
      
      const response = await api.post('/applications/with-photo', formData);
      console.log('Response received:', response.data);
      return response.data;
    } else {
      // Use regular endpoint without photo
      console.log('Submitting to /applications without photo');
      const response = await api.post('/applications', applicationData);
      return response.data;
    }
  },
  
  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/applications/${id}`, { status });
    return response.data;
  }
};

// Student API calls
export const studentAPI = {
  // Get all students (Admin only)
  getAll: async () => {
    const response = await api.get('/student/all');
    return response.data;
  },
  
  getProfile: async (studentId) => {
    const response = await api.get(`/student/${studentId}/profile`);
    return response.data;
  },
  getCourses: async (studentId) => {
    const response = await api.get(`/student/${studentId}/courses`);
    return response.data;
  },
  getMarks: async (studentId) => {
    const response = await api.get(`/student/${studentId}/marks`);
    return response.data;
  },
  getFees: async (studentId) => {
    const response = await api.get(`/student/${studentId}/fees`);
    return response.data;
  },
  getAssignments: async (studentId) => {
    const response = await api.get(`/student/${studentId}/assignments`);
    return response.data;
  },
  getAttendance: async (studentId) => {
    const response = await api.get(`/student/${studentId}/attendance`);
    return response.data;
  }
};

// Faculty API calls
export const facultyAPI = {
  getProfile: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/profile`);
    return response.data;
  },
  getCourses: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/courses`);
    return response.data;
  },
  getSubmissions: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/submissions`);
    return response.data;
  },
  getEvents: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/events`);
    return response.data;
  },
  getAchievements: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/achievements`);
    return response.data;
  },
  getMaterials: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/materials`);
    return response.data;
  }
};

// Admin API calls
export const adminAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      console.log('Fetching admin stats...');
      const response = await api.get('/admin/stats');
      console.log('Stats response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      throw err;
    }
  },
  
  // Get applications with filtering and pagination
  getApplications: async (params = {}) => {
    try {
      console.log('\n=== FETCHING APPLICATIONS ===');
      console.log('Request params:', params);
      console.log('Auth token present:', !!localStorage.getItem('authToken'));
      
      const response = await api.get('/admin/applications', { 
        params,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Applications response status:', response.status);
      console.log('Applications data:', response.data);
      
      return response.data;
    } catch (err) {
      console.error('\n=== API ERROR ===');
      console.error('Error fetching applications:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
          params: err.config?.params
        }
      });
      throw err;
    }
  },
  
  // Update application status
  updateApplicationStatus: async (id, status) => {
    const response = await api.patch(`/admin/applications/${id}/status`, { status });
    return response.data;
  },
  
  // Update payment status
  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.patch(`/admin/applications/${id}/payment`, { paymentStatus });
    return response.data;
  },
  
  // Get admin settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  
  // Update admin settings
  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', { settings });
    return response.data;
  },
  
  // Export applications to CSV
  exportApplications: async (params = {}) => {
    const response = await api.get('/admin/applications/export', { 
      params,
      responseType: 'blob' // Important for file download
    });
    return response.data;
  },
  
  // Send payment request email
  sendPaymentEmail: async (applicationId) => {
    const response = await api.post(`/admin/applications/${applicationId}/send-payment-email`);
    return response.data;
  }
};

// Academic API calls
export const academicAPI = {
  // Assignment Management
  getAssignments: async (params = {}) => {
    const response = await api.get('/academic/assignments', { params });
    return response.data;
  },
  
  createAssignment: async (assignmentData, file = null) => {
    const formData = new FormData();
    Object.keys(assignmentData).forEach(key => {
      formData.append(key, assignmentData[key]);
    });
    if (file) {
      formData.append('file', file);
    }
    
    const response = await api.post('/academic/assignments', formData);
    return response.data;
  },
  
  updateAssignment: async (id, assignmentData, file = null) => {
    const formData = new FormData();
    Object.keys(assignmentData).forEach(key => {
      formData.append(key, assignmentData[key]);
    });
    if (file) {
      formData.append('file', file);
    }
    
    const response = await api.put(`/academic/assignments/${id}`, formData);
    return response.data;
  },
  
  deleteAssignment: async (id) => {
    const response = await api.delete(`/academic/assignments/${id}`);
    return response.data;
  },
  
  gradeAssignment: async (id, marks, feedback) => {
    const response = await api.post(`/academic/assignments/${id}/grade`, { 
      marks_obtained: marks, 
      feedback 
    });
    return response.data;
  },
  
  // Attendance Management
  getAttendance: async (params = {}) => {
    const response = await api.get('/academic/attendance', { params });
    return response.data;
  },
  
  markAttendance: async (attendanceData) => {
    const response = await api.post('/academic/attendance', attendanceData);
    return response.data;
  },
  
  bulkMarkAttendance: async (attendanceDate, records) => {
    const response = await api.post('/academic/attendance/bulk', {
      attendance_date: attendanceDate,
      attendance_records: records
    });
    return response.data;
  },
  
  updateAttendance: async (id, status, remarks) => {
    const response = await api.put(`/academic/attendance/${id}`, { status, remarks });
    return response.data;
  },
  
  deleteAttendance: async (id) => {
    const response = await api.delete(`/academic/attendance/${id}`);
    return response.data;
  },
  
  // Student Academic Data
  getStudentAcademic: async (studentId) => {
    const response = await api.get(`/academic/students/${studentId}/academic`);
    return response.data;
  },
  
  // Faculty Assignment Management
  getFacultyAssignments: async () => {
    const response = await api.get('/academic/faculty/assignments');
    return response.data;
  },
  
  // Dashboard Statistics
  getAcademicStats: async () => {
    const response = await api.get('/academic/dashboard/stats');
    return response.data;
  },
  
  // File serving
  getAssignmentFile: (filename) => {
    return `${api.defaults.baseURL}/academic/assignments/file/${filename}`;
  }
};

export default api;