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
          is_for_pri_and_rel TINYINT(1) DEFAULT 0,
          is_for_ct TINYINT(1) DEFAULT 0,
          is_for_asp_and_post TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created courses table');
      
      // Check if courses table is empty and populate with static data
      const [existingCourses] = await pool.execute('SELECT COUNT(*) as count FROM courses');
      if (existingCourses[0].count === 0) {
        const courses = [
          {
            course_id:"C001",
            course_name: "B.A. in Theology and Religious Studies",
            duration: "3 Years",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"PLlus Two",
            starting_month:"June",
            medium:"English",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"Sundays and common holidays",
            fee:"10,000/-" 
          },
          {
            course_id:"C002",
            course_name: "Certificate Course on Theology",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"June",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-" 
          },
          {
            course_id:"C003",
            course_name: "Advanced Certificate Course on Theology",
            duration: "6 Months",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"Plus Two",
            starting_month:"June",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:1,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Days in a Month",
            fee:"10,000/-" 
          },
          {
            course_id:"C004",
            course_name: "Certificate Course on Theology(Online)",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"July",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Days in a Month",
            fee:"10,000/-" 
          },
          {
            course_id:"C005",
            course_name: "Basic Bible Course",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"March",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"Every Sundays",
            fee:"10,000/-"
          },
          {
            course_id:"C006",
            course_name: "Advanced Catechist Training Course(Advanced CTC)",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"Catechist Training Course(CTC)",
            starting_month:"May",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:1,
            is_for_asp_and_post:0,
            class_days:"2 Days in May",
            fee:"10,000/-"
          },
          {
            course_id:"C007",
            course_name: "Certificate Course on Sacred Liturgy",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"SSlC",
            starting_month:"June",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-"
          },
          {
            course_id:"C008",
            course_name: "Certificate Course on Guidance and Counselling",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:9,
            pass_percentage:"40%",
            eligibility:"Plus Two",
            starting_month:"June",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-"
          },
          {
            course_id:"C009",
            course_name: "Certificate Course on the Life in Holy Spirit",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:24,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"July",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-"
          },
           {
            course_id:"C010",
            course_name: "Catechism of the Catholic Church(CCC)",
            duration: "1 Year",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:12,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"July",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:0,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-"
          },
          {
            course_id:"C011",
            course_name: "Basic Theology Course",
            duration: "3 Months",
            //description: "Comprehensive undergraduate program in biblical studies, systematic theology, and practical ministry.",
            //subjects: JSON.stringify(["Biblical Studies", "Systematic Theology", "Church History", "Practical Ministry"]),
            no_of_subjects:16,
            pass_percentage:"40%",
            eligibility:"SSLC",
            starting_month:"January",
            medium:"Malayalam",
            mode:"Offline",
            is_for_pri_and_rel:0,
            is_for_ct:0,
            is_for_asp_and_post:1,
            class_days:"2 Sundays in a Month",
            fee:"10,000/-"
          }
        ];

        for (const course of courses) {
          await pool.execute(`
            INSERT INTO courses (title, duration, description, subjects, fee, intake, level, credits, color, is_for_pri_and_rel, is_for_ct, is_for_asp_and_post)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            course.course_name || course.title,
            course.duration || '',
            course.description || '',
            course.subjects || null,
            course.fee || '',
            course.intake || '',
            course.level || '',
            course.credits || 0,
            course.color || 'blue',
            course.is_for_pri_and_rel || 0,
            course.is_for_ct || 0,
            course.is_for_asp_and_post || 0
          ]);
        }
        console.log('✅ Populated courses table with static data');
      } else {
        console.log('✅ Courses table already has data');
      }
    } catch (error) {
      console.log('⚠️ Error creating/populating courses table:', error.message);
    }

    // Add is_active column to users table if it doesn't exist
    try {
      await pool.execute('ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1');
      console.log('✅ Added is_active column to users table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ is_active column already exists');
      } else {
        console.log('⚠️ Error adding is_active column:', error.message);
      }
    }

    console.log('✅ Database migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}
