// Test script to verify course updates are persisting to database
// Run this inside the backend container: docker-compose exec backend node test-course-update.js

import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'theology'
};

async function testCourseUpdate() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    console.log('Config:', { ...dbConfig, password: '***' });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // 1. Fetch all courses
    console.log('📚 Fetching all courses...');
    const [courses] = await connection.execute('SELECT * FROM courses');
    console.log(`Found ${courses.length} courses:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ID: ${course.id} - ${course.title}`);
      console.log(`   Fee: ${course.fee}, Duration: ${course.duration}`);
      console.log(`   Level: ${course.level}, Credits: ${course.credits}\n`);
    });

    if (courses.length === 0) {
      console.log('❌ No courses found in database!');
      return;
    }

    // 2. Test update on first course
    const testCourse = courses[0];
    console.log(`\n🔧 Testing update on course ID ${testCourse.id}...`);
    console.log(`Original title: "${testCourse.title}"`);
    console.log(`Original fee: "${testCourse.fee}"`);

    const newTitle = `${testCourse.title} [UPDATED ${Date.now()}]`;
    const newFee = '$99,999/year';

    console.log(`\nUpdating to:`);
    console.log(`New title: "${newTitle}"`);
    console.log(`New fee: "${newFee}"`);

    const [updateResult] = await connection.execute(
      'UPDATE courses SET title = ?, fee = ? WHERE id = ?',
      [newTitle, newFee, testCourse.id]
    );

    console.log(`\n✅ Update executed, affected rows: ${updateResult.affectedRows}`);

    // 3. Verify update
    console.log('\n🔍 Verifying update...');
    const [updatedCourses] = await connection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [testCourse.id]
    );

    if (updatedCourses.length > 0) {
      const updated = updatedCourses[0];
      console.log(`✅ Course after update:`);
      console.log(`   Title: "${updated.title}"`);
      console.log(`   Fee: "${updated.fee}"`);
      
      if (updated.title === newTitle && updated.fee === newFee) {
        console.log('\n✅✅✅ UPDATE SUCCESSFUL! Changes persisted to database.');
      } else {
        console.log('\n❌❌❌ UPDATE FAILED! Changes did not persist.');
        console.log('Expected:', { title: newTitle, fee: newFee });
        console.log('Got:', { title: updated.title, fee: updated.fee });
      }
    }

    // 4. Restore original values
    console.log('\n🔄 Restoring original values...');
    await connection.execute(
      'UPDATE courses SET title = ?, fee = ? WHERE id = ?',
      [testCourse.title, testCourse.fee, testCourse.id]
    );
    console.log('✅ Original values restored');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testCourseUpdate();

