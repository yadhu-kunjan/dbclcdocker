import { Router } from "express";
import { getDbPool } from "../config/db.js";
import { verifyToken } from "./auth.js";
import { sendApprovalEmail, sendPaymentReminderEmail } from "../services/emailService.js";

const adminRouter = Router();
const dbConnection = getDbPool();

adminRouter.get("/applications", verifyToken, async (req, res) => {
  try {
    // Check if table exists first
    const [tables] = await dbConnection.execute(
      "SHOW TABLES LIKE 'temp_student'"
    );
    
    if (tables.length === 0) {
      // Table doesn't exist, return empty result
      return res.json({ 
        success: true, 
        applications: [],
        message: 'No applications table found'
      });
    }

    const [rows] = await dbConnection.execute(
      "SELECT * FROM temp_student ORDER BY created_at DESC"
    );
    
    // Transform database snake_case to camelCase for frontend
    const applications = (Array.isArray(rows) ? rows : []).map(app => ({
      id: app.id?.toString() || '',
      candidateName: app.candidate_name || '',
      courseName: app.course_name || '',
      courseFee: app.course_fee || '₹0',
      email: app.email || '',
      mobileNo: app.mobile_no || '',
      fatherName: app.father_name || '',
      nationality: app.nationality || '',
      religionCaste: app.religion_caste || '',
      dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth).toISOString().split('T')[0] : '',
      educationalQualification: app.educational_qualification || '',
      fullAddress: app.full_address || '',
      superintendentOfServer: app.superintendent_of_server || '',
      status: app.status || 'pending',
      paymentStatus: app.payment_status || 'unpaid',
      submittedAt: app.submitted_at || app.created_at || null,
      approvedAt: app.approved_at || null,
      rejectedAt: app.rejected_at || null,
      paidAt: app.paid_at || null,
      photoPath: app.photo_path || null
    }));
    
    res.json({ 
      success: true, 
      applications,
      count: applications.length 
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications',
      details: error.message,
      applications: [] // Always provide applications array
    });
  }
});

adminRouter.get("/stats", verifyToken, async (req, res) => {
  // Default stats object (defined outside try block)
  const defaultStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    awaitingPayment: 0,
    fullyEnrolled: 0,
    paidCount: 0,
    totalRevenue: 0
  };

  try {
    console.log('=== FETCHING ADMIN STATS ===');

    // Check if table exists
    const [tables] = await dbConnection.execute(
      "SHOW TABLES LIKE 'temp_student'"
    );

    if (tables.length === 0) {
      console.log('⚠️ temp_student table not found, returning default stats');
      // Table doesn't exist, return default stats
      return res.json({
        success: true,
        stats: defaultStats,
        message: 'No applications table found'
      });
    }

    console.log('✅ temp_student table exists, fetching stats');

    const [applications] = await dbConnection.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'approved' AND payment_status = 'unpaid' THEN 1 ELSE 0 END) as awaitingPayment,
        SUM(CASE WHEN status = 'approved' AND payment_status = 'paid' THEN 1 ELSE 0 END) as fullyEnrolled,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paidCount,
        0 as totalRevenue
      FROM temp_student`
    );

    console.log('✅ Stats query result:', applications[0]);

    // Transform the stats and ensure all values are numbers
    const stats = {
      pending: parseInt(applications[0].pending || 0),
      approved: parseInt(applications[0].approved || 0),
      rejected: parseInt(applications[0].rejected || 0),
      awaitingPayment: parseInt(applications[0].awaitingPayment || 0),
      fullyEnrolled: parseInt(applications[0].fullyEnrolled || 0),
      totalRevenue: parseFloat(applications[0].totalRevenue || 0),
      paidCount: parseInt(applications[0].paidCount || 0)
    };

    console.log('✅ Returning stats:', stats);

    res.json({
      success: true,
      stats,
      raw: applications[0] // Include raw data for debugging
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message,
      stats: defaultStats // Return default stats even on error
    });
  }
});

// Get admin settings
adminRouter.get("/settings", verifyToken, async (req, res) => {
  try {
    const settings = {
      institution_name: process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology',
      admin_name: 'Dr. Sarah Johnson',
      admin_role: 'Super Administrator',
      admin_email: 'sarah.johnson@dbclc.edu'
    };
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (approve/reject)
adminRouter.patch('/applications/:id/status', verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    // Basic validation
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Update application status and timestamps
    let updateQuery = '';
    let params = [];

    if (status === 'approved') {
      updateQuery = `UPDATE temp_student SET status = ?, approved_at = NOW(), payment_status = COALESCE(payment_status, 'unpaid') WHERE id = ?`;
      params = [status, applicationId];
    } else if (status === 'rejected') {
      updateQuery = `UPDATE temp_student SET status = ?, rejected_at = NOW() WHERE id = ?`;
      params = [status, applicationId];
    } else {
      updateQuery = `UPDATE temp_student SET status = ? WHERE id = ?`;
      params = [status, applicationId];
    }

    const [result] = await dbConnection.execute(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Fetch updated application record
    const [rows] = await dbConnection.execute('SELECT * FROM temp_student WHERE id = ?', [applicationId]);
    const appRow = rows[0];

    const application = {
      id: appRow.id?.toString() || '',
      candidateName: appRow.candidate_name || '',
      courseName: appRow.course_name || '',
      courseFee: appRow.course_fee || '₹0',
      email: appRow.email || '',
      mobileNo: appRow.mobile_no || '',
      status: appRow.status || 'pending',
      paymentStatus: appRow.payment_status || 'unpaid'
    };

    // Send approval email automatically when application is approved
    if (status === 'approved') {
      try {
        await sendApprovalEmail(application);
        console.log(`✅ Approval email sent to ${application.email}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send approval email to ${application.email}:`, emailError);
        // Don't fail the request if email fails, just log it
      }
    }

    res.json({ success: true, message: 'Status updated', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

// ============ LOGIN MANAGEMENT ENDPOINTS ============

// Get all logins (with user details)
adminRouter.get('/logins', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const [rows] = await dbConnection.execute(`
      SELECT u.id, u.username, u.password, u.role_id, r.role, u.is_active
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.username ASC
    `);

    const logins = rows.map(row => ({
      id: row.id,
      username: row.username,
      role: row.role.toLowerCase(),
      roleId: row.role_id,
      isActive: row.is_active !== 0,
      createdAt: row.created_at
    }));

    res.json({ success: true, logins });
  } catch (error) {
    console.error('Error fetching logins:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logins', error: error.message });
  }
});

// Create new login
adminRouter.post('/logins', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const { username, password, role } = req.body;

    // Validation
    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, and role are required' });
    }

    // Get role_id from role name
    const [roleRows] = await dbConnection.execute(
      'SELECT role_id FROM roles WHERE LOWER(role) = LOWER(?)',
      [role]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const roleId = roleRows[0].role_id;

    // Check if username already exists
    const [existingUser] = await dbConnection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Generate user ID based on role
    const rolePrefix = role === 'admin' ? 'ITHA' : role === 'faculty' ? 'ITHF' : 'ITH';
    const [lastUser] = await dbConnection.execute(
      `SELECT id FROM users WHERE id LIKE ? ORDER BY id DESC LIMIT 1`,
      [`${rolePrefix}%`]
    );

    let newId;
    if (lastUser.length > 0) {
      const lastNum = parseInt(lastUser[0].id.substring(rolePrefix.length)) || 0;
      newId = `${rolePrefix}${String(lastNum + 1).padStart(2, '0')}`;
    } else {
      newId = `${rolePrefix}01`;
    }

    // Insert new user
    const [result] = await dbConnection.execute(
      'INSERT INTO users (id, username, password, role_id, is_active) VALUES (?, ?, ?, ?, 1)',
      [newId, username, password, roleId]
    );

    res.json({
      success: true,
      message: 'Login created successfully',
      login: {
        id: newId,
        username,
        role: role.toLowerCase(),
        roleId,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error creating login:', error);
    res.status(500).json({ success: false, message: 'Failed to create login', error: error.message });
  }
});

// Update login (change password or role)
adminRouter.patch('/logins/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const userId = req.params.id;
    const { password, role } = req.body;

    // Build update query
    let updateFields = [];
    let params = [];

    if (password) {
      updateFields.push('password = ?');
      params.push(password);
    }

    if (role) {
      const [roleRows] = await dbConnection.execute(
        'SELECT role_id FROM roles WHERE LOWER(role) = LOWER(?)',
        [role]
      );

      if (roleRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      updateFields.push('role_id = ?');
      params.push(roleRows[0].role_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(userId);

    const [result] = await dbConnection.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Login updated successfully' });
  } catch (error) {
    console.error('Error updating login:', error);
    res.status(500).json({ success: false, message: 'Failed to update login', error: error.message });
  }
});

// Toggle login active status
adminRouter.patch('/logins/:id/toggle-status', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const userId = req.params.id;

    // Get current status
    const [userRows] = await dbConnection.execute(
      'SELECT is_active FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = userRows[0].is_active ? 0 : 1;

    // Update status
    await dbConnection.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [newStatus, userId]
    );

    res.json({
      success: true,
      message: `Login ${newStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: newStatus === 1
    });
  } catch (error) {
    console.error('Error toggling login status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
});

// Delete login
adminRouter.delete('/logins/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const userId = req.params.id;

    // Prevent deleting the current admin user
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const [result] = await dbConnection.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Login deleted successfully' });
  } catch (error) {
    console.error('Error deleting login:', error);
    res.status(500).json({ success: false, message: 'Failed to delete login', error: error.message });
  }
});

// ============ EMAIL ENDPOINTS ============

// Send payment reminder email
adminRouter.post('/applications/:id/send-payment-email', verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Fetch application details
    const [rows] = await dbConnection.execute('SELECT * FROM temp_student WHERE id = ?', [applicationId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const appRow = rows[0];
    const application = {
      id: appRow.id?.toString() || '',
      candidateName: appRow.candidate_name || '',
      courseName: appRow.course_name || '',
      courseFee: appRow.course_fee || '₹0',
      email: appRow.email || '',
      mobileNo: appRow.mobile_no || ''
    };

    // Send payment reminder email
    await sendPaymentReminderEmail(application);

    console.log(`✅ Payment reminder email sent to ${application.email}`);
    res.json({ success: true, message: 'Payment reminder email sent successfully' });
  } catch (error) {
    console.error('Error sending payment email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// ============ COURSE MANAGEMENT ENDPOINTS ============

// Get all courses
adminRouter.get('/courses', verifyToken, async (req, res) => {
  try {
    console.log('=== FETCHING ALL COURSES (ADMIN) ===');
    const [courses] = await dbConnection.execute(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );

    console.log(`✅ Found ${courses.length} courses in database`);

    // Parse subjects JSON for each course
    const coursesWithParsedSubjects = courses.map(course => ({
      ...course,
      subjects: course.subjects ? JSON.parse(course.subjects) : []
    }));

    console.log('✅ Returning courses to admin dashboard');
    res.json({
      success: true,
      courses: coursesWithParsedSubjects
    });
  } catch (err) {
    console.error('❌ Error fetching courses:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Get a single course
adminRouter.get('/courses/:id', verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;

    const [courses] = await dbConnection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = {
      ...courses[0],
      subjects: courses[0].subjects ? JSON.parse(courses[0].subjects) : []
    };

    res.json({
      success: true,
      course
    });
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
});

// Create a new course
adminRouter.post('/courses', verifyToken, async (req, res) => {
  try {
    const { title, duration, description, subjects, fee, intake, level, credits, color } = req.body;

    // Validate required fields
    if (!title || !level) {
      return res.status(400).json({
        success: false,
        message: 'Title and level are required'
      });
    }

    // Convert subjects array to JSON string
    const subjectsJson = JSON.stringify(subjects || []);

    const [result] = await dbConnection.execute(
      `INSERT INTO courses
       (title, duration, description, subjects, fee, intake, level, credits, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, duration, description, subjectsJson, fee, intake, level, credits, color || 'blue']
    );

    // Fetch the newly created course
    const [newCourse] = await dbConnection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    const course = {
      ...newCourse[0],
      subjects: newCourse[0].subjects ? JSON.parse(newCourse[0].subjects) : []
    };

    res.json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: err.message
    });
  }
});

// Update a course
adminRouter.put('/courses/:id', verifyToken, async (req, res) => {
  try {
    const { title, duration, description, subjects, fee, intake, level, credits, color } = req.body;
    const courseId = req.params.id;

    console.log('=== UPDATE COURSE REQUEST ===');
    console.log('Course ID:', courseId);
    console.log('Request body:', req.body);

    // Validate required fields
    if (!title || !level) {
      console.log('❌ Validation failed: Missing title or level');
      return res.status(400).json({
        success: false,
        message: 'Title and level are required'
      });
    }

    // Check if course exists
    const [existing] = await dbConnection.execute(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );

    if (existing.length === 0) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('✅ Course exists, proceeding with update');

    // Convert subjects array to JSON string
    const subjectsJson = JSON.stringify(subjects || []);

    const updateResult = await dbConnection.execute(
      `UPDATE courses
       SET title = ?, duration = ?, description = ?, subjects = ?,
           fee = ?, intake = ?, level = ?, credits = ?, color = ?
       WHERE id = ?`,
      [title, duration, description, subjectsJson, fee, intake, level, credits, color || 'blue', courseId]
    );

    console.log('✅ Update executed, affected rows:', updateResult[0].affectedRows);

    // Fetch the updated course
    const [updatedCourse] = await dbConnection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    console.log('✅ Fetched updated course:', updatedCourse[0]);

    const course = {
      ...updatedCourse[0],
      subjects: updatedCourse[0].subjects ? JSON.parse(updatedCourse[0].subjects) : []
    };

    console.log('✅ Course update successful');
    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    console.error('❌ Error updating course:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: err.message
    });
  }
});

// Delete a course
adminRouter.delete('/courses/:id', verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const [existing] = await dbConnection.execute(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await dbConnection.execute(
      'DELETE FROM courses WHERE id = ?',
      [courseId]
    );

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: err.message
    });
  }
});

export default adminRouter;

