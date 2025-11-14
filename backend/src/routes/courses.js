// routes/courses.js
import { Router } from 'express';
import { getDbPool } from '../config/db.js';

const router = Router();

// GET /api/courses - Fetch all courses with eligibility filters
router.get('/', async (req, res) => {
  try {
    console.log('=== FETCHING COURSES (PUBLIC) ===');
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const pool = getDbPool();
    
    // Fetch from 'course' table (singular, not 'courses')
    const [courses] = await pool.execute(`
      SELECT
        course_id as id,
        course_name as title,
        duration,
        no_of_subjects,
        pass_percentage,
        eligibility,
        starting_month,
        medium,
        mode,
        is_for_pri_and_rel,
        is_for_ct,
        is_for_asp_and_post,
        class_days,
        fees
      FROM course
      ORDER BY course_name
    `);

    console.log(`✅ Found ${courses.length} courses in database`);

    // Format courses with proper boolean values
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      duration: course.duration,
      subjects: course.no_of_subjects,
      passPercentage: course.pass_percentage,
      eligibility: course.eligibility,
      startingMonth: course.starting_month,
      medium: course.medium,
      mode: course.mode,
      classDays: course.class_days,
      fees: course.fees,
      // Convert tinyint to boolean - based on actual database columns
      forCT: Boolean(course.is_for_pri_and_rel), // For priests and religious
      forDevotees: Boolean(course.is_for_ct), // For general devotees
      forAspPost: Boolean(course.is_for_asp_and_post) // For aspirants and postulants
    }));

    console.log('✅ Returning courses with eligibility flags to frontend');
    console.log('Sample course:', formattedCourses[0]);
    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching courses from database', 
      message: err.message 
    });
  }
});

export default router;