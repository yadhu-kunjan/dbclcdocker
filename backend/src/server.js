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
    
    // FIXED: Changed 'title' to 'course_name' to match database column
    const [courses] = await pool.execute(`
      SELECT
        id,
        course_name,
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
      ORDER BY level, course_name
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