import { getDbPool } from './db.js';

export async function seedDemoUsers() {
  const pool = getDbPool();
  
  try {
    console.log('Starting demo users seed...');
    
    // Check if demo users already exist
    const [existingUsers] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE username IN ('admin', 'student1', 'faculty1')`
    );
    
    if (existingUsers[0].count === 0) {
      console.log('Adding demo users...');
      
      // Get role IDs
      const [roles] = await pool.execute(
        `SELECT role_id, role FROM roles WHERE role IN ('admin', 'student', 'faculty')`
      );
      
      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.role] = role.role_id;
      });
      
      // Insert admin user
      try {
        await pool.execute(
          'INSERT INTO users (id, username, password, role_id) VALUES (?, ?, ?, ?)',
          ['ADMIN01', 'admin', 'admin123', roleMap['admin']]
        );
        console.log('✅ Created admin user');
      } catch (error) {
        console.log('⚠️ Admin user creation error:', error.message);
      }
      
      // Insert student user
      try {
        await pool.execute(
          'INSERT INTO users (id, username, password, role_id) VALUES (?, ?, ?, ?)',
          ['STU001', 'student1', 'student123', roleMap['student']]
        );
        console.log('✅ Created student user');
      } catch (error) {
        console.log('⚠️ Student user creation error:', error.message);
      }
      
      // Insert faculty user
      try {
        await pool.execute(
          'INSERT INTO users (id, username, password, role_id) VALUES (?, ?, ?, ?)',
          ['FAC001', 'faculty1', 'faculty123', roleMap['faculty']]
        );
        console.log('✅ Created faculty user');
      } catch (error) {
        console.log('⚠️ Faculty user creation error:', error.message);
      }
    } else {
      console.log('✅ Demo users already exist');
    }
    
    console.log('✅ Demo users seeding completed');
    
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  }
}

