// server.js
// server.js - AFTER
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import studentRoutes from './routes/student.js';
import facultyRoutes from './routes/faculty.js';
import adminRoutes from './routes/admin.js';
import academicRoutes from './routes/academic.js';
import attendanceRoutes from './routes/attendance.js';
import { verifyDbConnection } from './config/db.js';
import { sendApprovalEmail, sendPaymentReminderEmail } from './services/emailService.js';
import { runMigrations } from './config/migrations.js';
import { seedDemoUsers } from './config/seedDemoUsers.js';

// Load environment variables from .env or docker-compose
dotenv.config();

const app = express();
const port = 3001; // A port for your backend server

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:80',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://project_frontend:80',
    'http://project_frontend:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Verify database connection and run migrations
verifyDbConnection()
  .then(async () => {
    console.log('Successfully connected to the database.');
    await runMigrations();
    await seedDemoUsers();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Request logging middleware (should be BEFORE routes)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);

// Simple test endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { getDbPool } = await import('./config/db.js');
    const pool = getDbPool();
    // Return users joined with their role name
    const [results] = await pool.execute(
      `SELECT u.id, u.username, u.password, r.role 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id`
    );
    res.json(results); // Send the results back as JSON
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching data from database' });
  }
});

// API endpoint to get courses from database
app.get('/api/courses', async (req, res) => {
  try {
    console.log('=== FETCHING COURSES (PUBLIC) ===');
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const { getDbPool } = await import('./config/db.js');
    const pool = getDbPool();
    const [courses] = await pool.execute(`
      SELECT
        id,
        title,
        duration,
        description,
        subjects,
        fee,
        intake,
        level,
        credits,
        color,
        is_for_pri_and_rel,
        is_for_ct,
        is_for_asp_and_post
      FROM courses
      ORDER BY level, title
    `);

    console.log(`✅ Found ${courses.length} courses in database`);

    // Parse JSON subjects field with error handling
    const formattedCourses = courses.map(course => {
      let subjects = [];
      if (course.subjects) {
        try {
          subjects = JSON.parse(course.subjects);
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse subjects for course ${course.id}:`, course.subjects);
          // If it's not valid JSON, treat it as a single subject
          subjects = [course.subjects];
        }
      }
      return {
        ...course,
        subjects
      };
    });

    console.log('✅ Returning courses to frontend');
    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ success: false, error: 'Error fetching courses from database' });
  }
});
// ==================== EMAIL ROUTES ====================

app.post('/api/emails/send-approval', async (req, res) => {
  try {
    const { applicationId, candidateName, email, courseName, courseFee, mobileNo } = req.body;
    
    if (!applicationId || !candidateName || !email || !courseName || !courseFee) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const application = {
      id: applicationId,
      candidateName,
      email,
      courseName,
      courseFee,
      mobileNo: mobileNo || 'N/A'
    };

    const result = await sendApprovalEmail(application);
    
    console.log('✅ Approval email sent to:', email);
    
    res.json({
      success: true,
      message: 'Approval email sent successfully',
      emailId: result.emailId
    });
    
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send approval email',
      error: error.message
    });
  }
});

app.post('/api/emails/send-payment-reminder', async (req, res) => {
  try {
    const { applicationId, candidateName, email, courseName, courseFee } = req.body;
    
    if (!applicationId || !candidateName || !email || !courseName || !courseFee) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const application = {
      id: applicationId,
      candidateName,
      email,
      courseName,
      courseFee
    };

    const result = await sendPaymentReminderEmail(application);
    
    res.json({
      success: true,
      message: 'Payment reminder sent successfully',
      emailId: result.emailId
    });
    
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder',
      error: error.message
    });
  }
});

// ==================== END EMAIL ROUTES ====================

// Error handling middleware (must be AFTER all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler (must be LAST, after all routes)
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📧 Email service initialized with Resend API`);
});
