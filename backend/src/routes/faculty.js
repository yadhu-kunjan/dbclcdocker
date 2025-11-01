import { Router } from 'express';
import { getDbPool } from '../config/db.js';

const router = Router();

// GET /api/faculty/:facultyId/profile
router.get('/:facultyId/profile', async (req, res) => {
  const { facultyId } = req.params;
  try {
    const pool = getDbPool();
    
    // Join faculty_login and faculty tables to get complete faculty information
    const [rows] = await pool.execute(
      `SELECT 
        fl.id as faculty_id,
        fl.username,
        f.name,
        f.department
      FROM faculty_login fl
      LEFT JOIN faculty f ON fl.id = f.faculty_id
      WHERE fl.id = ? LIMIT 1`,
      [facultyId]
    );
    
    if (rows.length === 0) {
      return res.json({ success: true, faculty: null });
    }
    
    const faculty = {
      faculty_id: rows[0].faculty_id,
      username: rows[0].username,
      name: rows[0].name || rows[0].username, // Use name from faculty table, fallback to username
      department: rows[0].department
    };
    
    return res.json({ success: true, faculty });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty profile', error: err.message });
  }
});

// GET /api/faculty/:facultyId/courses
router.get('/:facultyId/courses', async (req, res) => {
  const { facultyId } = req.params;
  try {
    const pool = getDbPool();
    
    // Get courses from database with student and assignment counts
    const [courses] = await pool.execute(`
      SELECT 
        c.id as course_id,
        c.title as course_name,
        c.title as course_code,
        c.duration,
        c.level,
        c.credits,
        COUNT(DISTINCT ts.id) as students_count,
        COUNT(DISTINCT a.id) as assignments_count,
        COUNT(DISTINCT CASE WHEN a.marks_obtained IS NULL THEN a.id END) as pending_reviews,
        'active' as status
      FROM courses c
      LEFT JOIN temp_student ts ON ts.course_name = c.title AND ts.status = 'approved'
      LEFT JOIN assignment a ON a.student_id = ts.id
      GROUP BY c.id, c.title, c.duration, c.level, c.credits
      ORDER BY c.title
    `);
    
    return res.json({ success: true, courses });
  } catch (err) {
    console.error('Error fetching faculty courses:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty courses', error: err.message });
  }
});

// GET /api/faculty/:facultyId/submissions
router.get('/:facultyId/submissions', async (req, res) => {
  const { facultyId } = req.params;
  try {
    const pool = getDbPool();
    
    // Get assignment submissions from database
    const [submissions] = await pool.execute(`
      SELECT 
        a.id,
        ts.candidate_name as student_name,
        a.title as assignment_name,
        ts.course_name as course_code,
        a.created_at as submitted_at,
        CASE 
          WHEN a.marks_obtained IS NOT NULL THEN 'graded'
          ELSE 'pending'
        END as status,
        CASE 
          WHEN a.marks_obtained IS NOT NULL THEN 
            CASE 
              WHEN a.marks_obtained >= 90 THEN 'A+'
              WHEN a.marks_obtained >= 80 THEN 'A'
              WHEN a.marks_obtained >= 70 THEN 'B+'
              WHEN a.marks_obtained >= 60 THEN 'B'
              WHEN a.marks_obtained >= 50 THEN 'C'
              ELSE 'D'
            END
          ELSE NULL
        END as grade
      FROM assignment a
      LEFT JOIN temp_student ts ON a.student_id = ts.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    
    return res.json({ success: true, submissions });
  } catch (err) {
    console.error('Error fetching faculty submissions:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty submissions', error: err.message });
  }
});

// GET /api/faculty/:facultyId/events
router.get('/:facultyId/events', async (req, res) => {
  const { facultyId } = req.params;
  try {
    // Mock events data for now - replace with actual database query
    const events = [
      { 
        id: 1, 
        title: 'Faculty Meeting', 
        date: '2024-12-15', 
        time: '2:00 PM', 
        type: 'meeting' 
      },
      { 
        id: 2, 
        title: 'Course Planning Session', 
        date: '2024-12-18', 
        time: '10:00 AM', 
        type: 'planning' 
      },
      { 
        id: 3, 
        title: 'Student Consultation', 
        date: '2024-12-20', 
        time: '3:30 PM', 
        type: 'consultation' 
      },
    ];
    
    return res.json({ success: true, events });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty events', error: err.message });
  }
});

// GET /api/faculty/:facultyId/achievements
router.get('/:facultyId/achievements', async (req, res) => {
  const { facultyId } = req.params;
  try {
    // Mock achievements data for now - replace with actual database query
    const achievements = [
      { 
        id: 1, 
        title: 'Top Rated Professor', 
        description: '4.9/5 student rating this semester', 
        type: 'rating', 
        icon_type: 'star' 
      },
      { 
        id: 2, 
        title: 'Course Completion', 
        description: '100% completion rate in CS301', 
        type: 'completion', 
        icon_type: 'award' 
      },
      { 
        id: 3, 
        title: 'Early Grader', 
        description: 'Graded 50+ assignments this week', 
        type: 'performance', 
        icon_type: 'clock' 
      },
    ];
    
    return res.json({ success: true, achievements });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty achievements', error: err.message });
  }
});

// GET /api/faculty/:facultyId/materials
router.get('/:facultyId/materials', async (req, res) => {
  const { facultyId } = req.params;
  try {
    // Mock materials data for now - replace with actual database query
    const materials = { total_uploaded: 35 };
    
    return res.json({ success: true, materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty materials', error: err.message });
  }
});

export default router;
