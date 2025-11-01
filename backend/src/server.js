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
import { verifyDbConnection } from './config/db.js';
import { runMigrations } from './config/migrations.js';
import { seedDemoUsers } from './config/seedDemoUsers.js';

// Load environment variables
dotenv.config({ path: './authconfig.env' });

const app = express();
const port = 3001; // A port for your backend server

// Middleware
app.use(cors());
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);

// Create a simple API endpoint
// This endpoint will fetch all users from a 'users' table
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
        color
      FROM courses 
      ORDER BY level, title
    `);
    
    // Parse JSON subjects field
    const formattedCourses = courses.map(course => ({
      ...course,
      subjects: course.subjects ? JSON.parse(course.subjects) : []
    }));
    
    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Error fetching courses from database' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});