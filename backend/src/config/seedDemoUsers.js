import { getDbPool } from './db.js';

export async function seedDemoUsers() {
  const pool = getDbPool();
  
  try {
    console.log('Starting demo users seed...');
    // If the legacy `login` table does not exist, skip seeding because the
    // provided `theology.sql` already creates a `users` table compatible with
    // the app. This prevents SQL errors from mismatched schema.
    const [loginTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'login'`
    );
    if (!loginTable || loginTable[0].cnt === 0) {
      console.log('Skipping legacy login seeding: `login` table not present.');
      return;
    }
    
    // Insert demo users into users table
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE user_id IN ("student123", "faculty456", "admin789")');
    
    if (existingUsers[0].count === 0) {
      // Insert student user
      try {
        await pool.execute(
          'INSERT INTO users (user_id, role, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['student123', 'student']
        );
        console.log('✅ Created student user');
      } catch (error) {
        console.log('⚠️ Student user already exists or error:', error.message);
      }
      
      // Insert faculty user
      try {
        await pool.execute(
          'INSERT INTO users (user_id, role, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['faculty456', 'faculty']
        );
        console.log('✅ Created faculty user');
      } catch (error) {
        console.log('⚠️ Faculty user already exists or error:', error.message);
      }
      
      // Insert admin user
      try {
        await pool.execute(
          'INSERT INTO users (user_id, role, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          ['admin789', 'admin']
        );
        console.log('✅ Created admin user');
      } catch (error) {
        console.log('⚠️ Admin user already exists or error:', error.message);
      }
    }
    
    // Insert login credentials
    const [existingLogins] = await pool.execute('SELECT COUNT(*) as count FROM login WHERE user_id IN ("student123", "faculty456", "admin789")');
    
    if (existingLogins[0].count === 0) {
      // Insert student login
      try {
        await pool.execute(
          'INSERT INTO login (username, password, user_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          ['student123', 'password123', 'student123']
        );
        console.log('✅ Created student login');
      } catch (error) {
        console.log('⚠️ Student login already exists or error:', error.message);
      }
      
      // Insert faculty login
      try {
        await pool.execute(
          'INSERT INTO login (username, password, user_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          ['faculty456', 'password456', 'faculty456']
        );
        console.log('✅ Created faculty login');
      } catch (error) {
        console.log('⚠️ Faculty login already exists or error:', error.message);
      }
      
      // Insert admin login
      try {
        await pool.execute(
          'INSERT INTO login (username, password, user_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          ['admin789', 'password789', 'admin789']
        );
        console.log('✅ Created admin login');
      } catch (error) {
        console.log('⚠️ Admin login already exists or error:', error.message);
      }
    }
    
    console.log('✅ Demo users seeding completed');
    
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  }
}

