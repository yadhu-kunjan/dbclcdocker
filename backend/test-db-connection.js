// Test script to verify database connection and data
import { getDbPool } from './src/config/db.js';
import { runMigrations } from './src/config/migrations.js';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    const pool = getDbPool();
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('🔄 Running migrations...');
    await runMigrations();
    
    // Test courses table
    console.log('📚 Testing courses table...');
    const [courses] = await pool.execute('SELECT COUNT(*) as count FROM courses');
    console.log(`✅ Courses table has ${courses[0].count} records`);
    
    // Test temp_student table
    console.log('👥 Testing temp_student table...');
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM temp_student');
    console.log(`✅ Temp_student table has ${students[0].count} records`);
    
    // Test assignment table
    console.log('📝 Testing assignment table...');
    const [assignments] = await pool.execute('SELECT COUNT(*) as count FROM assignment');
    console.log(`✅ Assignment table has ${assignments[0].count} records`);
    
    // Test attendance table
    console.log('📅 Testing attendance table...');
    const [attendance] = await pool.execute('SELECT COUNT(*) as count FROM attendance');
    console.log(`✅ Attendance table has ${attendance[0].count} records`);
    
    // Test admin_settings table
    console.log('⚙️ Testing admin_settings table...');
    const [settings] = await pool.execute('SELECT COUNT(*) as count FROM admin_settings');
    console.log(`✅ Admin_settings table has ${settings[0].count} records`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
