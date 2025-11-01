import { Router } from 'express';
import { getDbPool } from '../config/db.js';
import { verifyToken } from './auth.js';

const router = Router();

// GET /api/student/all - Get all students (Admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const pool = getDbPool();
    // Get all students from users and roles tables (new schema)
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, r.role
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE r.role = 'student'
       ORDER BY u.username ASC`
    );

    // Transform the data to match expected format
    const students = rows.map(row => ({
      id: row.id,
      username: row.username,
      role: row.role.toLowerCase(),
      name: row.username,
      email: `${row.username}@dbclc.com`,
      created_at: null
    }));

    return res.json({ success: true, students });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students', error: err.message });
  }
});

// GET /api/student/:studentId/profile
router.get('/:studentId/profile', verifyToken, async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    // Get student details from users and roles tables (new schema)
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, r.role
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.id = ? AND r.role = 'student'`,
      [studentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = rows[0];
    // Optionally add more student info from other tables if needed
    return res.json({
      success: true,
      student: {
        id: student.id,
        username: student.username,
        role: student.role.toLowerCase(),
        name: student.username,
        email: `${student.username}@dbclc.com`,
        created_at: null
      }
    });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student profile', error: err.message });
  }
});

// GET /api/student/:studentId/courses
router.get('/:studentId/courses', async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT DISTINCT c.course_id, c.course_name, c.duration, c.no_of_subjects, c.pass_percentage
       FROM mark m
       JOIN course c ON c.course_id = m.course_id
       WHERE m.student_id = ?
       ORDER BY c.course_name ASC`,
      [studentId]
    );
    return res.json({ success: true, courses: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: err.message });
  }
});

// GET /api/student/:studentId/marks
router.get('/:studentId/marks', async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT m.student_id, m.course_id, m.exam_mark, m.assignment_mark, m.attendence, m.total_mark, m.status,
              c.course_name
       FROM mark m
       JOIN course c ON c.course_id = m.course_id
       WHERE m.student_id = ?
       ORDER BY c.course_name ASC`,
      [studentId]
    );
    return res.json({ success: true, marks: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch marks', error: err.message });
  }
});

// GET /api/student/:studentId/fees
router.get('/:studentId/fees', async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      `SELECT fee_id, student_id, course_id, total_fees, amount_paid, payment_status, date, due_date
       FROM fees
       WHERE student_id = ?
       ORDER BY date DESC`,
      [studentId]
    );
    return res.json({ success: true, fees: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch fees', error: err.message });
  }
});

// GET /api/student/:studentId/assignments
router.get('/:studentId/assignments', async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    
    // Get assignments from database
    const [assignments] = await pool.execute(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.max_marks,
        a.assignment_type,
        a.instructions,
        a.file_path,
        a.marks_obtained,
        a.feedback,
        a.created_at,
        a.updated_at,
        ts.course_name,
        CASE 
          WHEN a.marks_obtained IS NOT NULL THEN 'graded'
          WHEN a.due_date < CURDATE() THEN 'overdue'
          ELSE 'pending'
        END as status
      FROM assignment a
      LEFT JOIN temp_student ts ON a.student_id = ts.id
      WHERE a.student_id = ?
      ORDER BY a.due_date ASC
    `, [studentId]);
    
    return res.json({ success: true, assignments });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: err.message });
  }
});

// GET /api/student/:studentId/attendance
router.get('/:studentId/attendance', async (req, res) => {
  const { studentId } = req.params;
  try {
    const pool = getDbPool();
    
    // Get attendance records from database
    const [attendanceRecords] = await pool.execute(`
      SELECT 
        attendance_date,
        status,
        remarks
      FROM attendance 
      WHERE student_id = ?
      ORDER BY attendance_date DESC
    `, [studentId]);
    
    // Calculate attendance statistics
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(record => record.status === 'present').length;
    const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
    
    const attendance = {
      total_classes: totalClasses,
      attended_classes: attendedClasses,
      percentage: percentage,
      records: attendanceRecords
    };
    
    return res.json({ success: true, attendance });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: err.message });
  }
});

export default router;


