import { getDbPool } from './db.js';

export async function runMigrations() {
  const pool = getDbPool();
  
  try {
    console.log('Running database migrations...');
    
    // Add status column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN status VARCHAR(20) DEFAULT "pending"');
      console.log('✅ Added status column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Status column already exists');
      } else {
        console.log('⚠️ Error adding status column:', error.message);
      }
    }
    
    // Add payment_status column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN payment_status VARCHAR(20) DEFAULT "unpaid"');
      console.log('✅ Added payment_status column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Payment_status column already exists');
      } else {
        console.log('⚠️ Error adding payment_status column:', error.message);
      }
    }
    
    // Add course_fee column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN course_fee VARCHAR(50) DEFAULT "₹50,000"');
      console.log('✅ Added course_fee column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Course_fee column already exists');
      } else {
        console.log('⚠️ Error adding course_fee column:', error.message);
      }
    }
    
    // Add submitted_at column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ Added submitted_at column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Submitted_at column already exists');
      } else {
        console.log('⚠️ Error adding submitted_at column:', error.message);
      }
    }
    
    // Add approved_at column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN approved_at TIMESTAMP NULL');
      console.log('✅ Added approved_at column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Approved_at column already exists');
      } else {
        console.log('⚠️ Error adding approved_at column:', error.message);
      }
    }
    
    // Add rejected_at column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN rejected_at TIMESTAMP NULL');
      console.log('✅ Added rejected_at column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Rejected_at column already exists');
      } else {
        console.log('⚠️ Error adding rejected_at column:', error.message);
      }
    }
    
    // Add paid_at column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN paid_at TIMESTAMP NULL');
      console.log('✅ Added paid_at column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Paid_at column already exists');
      } else {
        console.log('⚠️ Error adding paid_at column:', error.message);
      }
    }
    
    // Create admin_settings table for dashboard configuration
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS admin_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created admin_settings table');
      
      // Insert default settings
      const defaultSettings = [
        { key: 'institution_name', value: 'DBCLC Institute of Theology' },
        { key: 'admin_name', value: 'Dr. Sarah Johnson' },
        { key: 'admin_role', value: 'Super Administrator' },
        { key: 'admin_email', value: 'sarah.johnson@dbclc.edu' },
        { key: 'default_course_fee', value: '₹50,000' }
      ];
      
      for (const setting of defaultSettings) {
        try {
          await pool.execute(
            'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?)',
            [setting.key, setting.value]
          );
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`✅ Setting ${setting.key} already exists`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Error creating admin_settings table:', error.message);
    }

    // Add academic management columns to existing temp_student table
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN assignment_marks JSON NULL');
      console.log('✅ Added assignment_marks column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Assignment_marks column already exists');
      } else {
        console.log('⚠️ Error adding assignment_marks column:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN attendance_record JSON NULL');
      console.log('✅ Added attendance_record column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Attendance_record column already exists');
      } else {
        console.log('⚠️ Error adding attendance_record column:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN cgpa DECIMAL(3,2) DEFAULT 0.00');
      console.log('✅ Added cgpa column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ CGPA column already exists');
      } else {
        console.log('⚠️ Error adding cgpa column:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN semester VARCHAR(20) DEFAULT "1st"');
      console.log('✅ Added semester column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Semester column already exists');
      } else {
        console.log('⚠️ Error adding semester column:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN academic_year VARCHAR(10) DEFAULT "2024-25"');
      console.log('✅ Added academic_year column to temp_student table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Academic_year column already exists');
      } else {
        console.log('⚠️ Error adding academic_year column:', error.message);
      }
    }
    
    // Create assignment table if it doesn't exist
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS assignment (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          student_id INT NOT NULL,
          due_date DATE NOT NULL,
          max_marks INT DEFAULT 100,
          assignment_type VARCHAR(50) DEFAULT 'homework',
          instructions TEXT,
          file_path VARCHAR(500),
          marks_obtained INT NULL,
          feedback TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES temp_student(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created assignment table');
    } catch (error) {
      console.log('⚠️ Error creating assignment table:', error.message);
    }

    // Create attendance table if it doesn't exist
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          attendance_date DATE NOT NULL,
          status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES temp_student(id) ON DELETE CASCADE,
          UNIQUE KEY unique_student_date (student_id, attendance_date)
        )
      `);
      console.log('✅ Created attendance table');
    } catch (error) {
      console.log('⚠️ Error creating attendance table:', error.message);
    }

    // Create courses table and populate with static data
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS courses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          duration VARCHAR(50),
          description TEXT,
          subjects JSON,
          fee VARCHAR(50),
          intake VARCHAR(100),
          level VARCHAR(50),
          credits INT,
          color VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created courses table');
      
      // Check if courses table is empty and populate with static data
      const [existingCourses] = await pool.execute('SELECT COUNT(*) as count FROM courses');
      if (existingCourses[0].count === 0) {
        const courses = [
          {
            title: "Bachelor of Theology (B.Th)",
            duration: "4 Years",
            description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            fee: "$12,000/year",
            intake: "Fall & Spring",
            level: "Undergraduate",
            credits: 120,
            color: "blue"
          },
          {
            title: "Master of Theology (Th.M)",
            duration: "2 Years",
            description: "Advanced theological study with research focus for academic and ministry excellence.",
            subjects: JSON.stringify(["Research Methodology", "Advanced Dogmatics", "Biblical Languages", "Thesis Writing"]),
            fee: "$18,000/year",
            intake: "Fall Only",
            level: "Graduate",
            credits: 60,
            color: "emerald"
          },
          {
            title: "Doctor of Ministry (D.Min)",
            duration: "3-4 Years",
            description: "Professional doctoral program for experienced ministry leaders seeking advanced expertise.",
            subjects: JSON.stringify(["Leadership Studies", "Contemporary Theology", "Ministry Innovation", "Doctoral Project"]),
            fee: "$20,000/year",
            intake: "Summer Cohorts",
            level: "Doctoral",
            credits: 45,
            color: "amber"
          },
          {
            title: "Certificate in Biblical Studies",
            duration: "1 Year",
            description: "Foundation program providing essential biblical knowledge and theological understanding.",
            subjects: JSON.stringify(["Old Testament Survey", "New Testament Survey", "Biblical Interpretation", "Church History"]),
            fee: "$8,000/year",
            intake: "Fall, Spring & Summer",
            level: "Certificate",
            credits: 30,
            color: "indigo"
          },
          {
            title: "Diploma in Christian Ministry",
            duration: "2 Years",
            description: "Practical ministry training program for church leaders and lay ministers.",
            subjects: JSON.stringify(["Pastoral Care", "Worship Leadership", "Christian Education", "Mission Studies"]),
            fee: "$10,000/year",
            intake: "Fall & Spring",
            level: "Diploma",
            credits: 60,
            color: "rose"
          }
        ];

        for (const course of courses) {
          await pool.execute(`
            INSERT INTO courses (title, duration, description, subjects, fee, intake, level, credits, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            course.title, course.duration, course.description, course.subjects,
            course.fee, course.intake, course.level, course.credits, course.color
          ]);
        }
        console.log('✅ Populated courses table with static data');
      } else {
        console.log('✅ Courses table already has data');
      }
    } catch (error) {
      console.log('⚠️ Error creating/populating courses table:', error.message);
    }

    console.log('✅ Database migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}
