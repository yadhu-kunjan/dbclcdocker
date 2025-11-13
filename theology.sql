-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: theology
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table admin_settings
--

DROP TABLE IF EXISTS admin_settings;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE admin_settings (
  id int NOT NULL AUTO_INCREMENT,
  setting_key varchar(100) NOT NULL,
  setting_value text,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY setting_key (setting_key)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table admin_settings
--

LOCK TABLES admin_settings WRITE;
/*!40000 ALTER TABLE admin_settings DISABLE KEYS */;
INSERT INTO admin_settings VALUES (1,'institution_name','DBCLC Institute of Theology','2025-10-26 15:03:29','2025-10-26 15:03:29'),(2,'admin_name','Dr. Sarah Johnson','2025-10-26 15:03:29','2025-10-26 15:03:29'),(3,'admin_role','Super Administrator','2025-10-26 15:03:29','2025-10-26 15:03:29'),(4,'admin_email','sarah.johnson@dbclc.edu','2025-10-26 15:03:29','2025-10-26 15:03:29'),(5,'default_course_fee','₹50,000','2025-10-26 15:03:29','2025-10-26 15:03:29');
/*!40000 ALTER TABLE admin_settings ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table assignment
--

DROP TABLE IF EXISTS assignment;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE assignment (
  assignment_id varchar(20) NOT NULL,
  course_id varchar(20) NOT NULL,
  faculty_id varchar(20) NOT NULL,
  title varchar(50) NOT NULL,
  due_date date NOT NULL,
  PRIMARY KEY (assignment_id),
  KEY course_id3_idx (course_id),
  KEY faculty_id2_idx (faculty_id),
  CONSTRAINT course_id3 FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT faculty_id2 FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table assignment
--

LOCK TABLES assignment WRITE;
/*!40000 ALTER TABLE assignment DISABLE KEYS */;
/*!40000 ALTER TABLE assignment ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table attendance
--

DROP TABLE IF EXISTS attendance;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE attendance (
  id int NOT NULL AUTO_INCREMENT,
  student_id int NOT NULL,
  attendance_date date NOT NULL,
  status enum('present','absent','late','excused') DEFAULT 'absent',
  remarks text,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_student_date (student_id,attendance_date),
  CONSTRAINT attendance_ibfk_1 FOREIGN KEY (student_id) REFERENCES temp_student (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table attendance
--

LOCK TABLES attendance WRITE;
/*!40000 ALTER TABLE attendance DISABLE KEYS */;
/*!40000 ALTER TABLE attendance ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table attendence
--

DROP TABLE IF EXISTS attendence;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE attendence (
  student_id varchar(20) NOT NULL,
  course_id varchar(20) NOT NULL,
  date date NOT NULL,
  status char(1) NOT NULL,
  PRIMARY KEY (student_id),
  KEY course_id_idx (course_id),
  CONSTRAINT course_id5 FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT student_id2 FOREIGN KEY (student_id) REFERENCES student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table attendence
--

LOCK TABLES attendence WRITE;
/*!40000 ALTER TABLE attendence DISABLE KEYS */;
/*!40000 ALTER TABLE attendence ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table course
--

DROP TABLE IF EXISTS course;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE course (
  course_id varchar(20) NOT NULL,
  course_name varchar(100) NOT NULL,
  duration varchar(20) NOT NULL,
  no_of_subjects int NOT NULL,
  pass_percentage decimal(5,2) NOT NULL,
  eligibility varchar(45) DEFAULT NULL,
  starting_month varchar(45) DEFAULT NULL,
  medium varchar(45) DEFAULT NULL,
  mode varchar(45) DEFAULT NULL,
  is_for_devotees tinyint(1) DEFAULT NULL,
  is_for_ct tinyint(1) DEFAULT NULL,
  is_for_asp_and_post varchar(45) DEFAULT NULL,
  class_days varchar(45) DEFAULT NULL,
  fees decimal(8,2) DEFAULT NULL,
  PRIMARY KEY (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table course
--

LOCK TABLES course WRITE;
/*!40000 ALTER TABLE course DISABLE KEYS */;
INSERT INTO course VALUES ('C001','B.A. in Theology and Religious Studies','3 Years',0,0.00,'Plus Two','June','English','Offline',0,0,'0','Sundays and common holidays',NULL),('C002','Certificate Course on Theology','1 Year',24,0.00,'SSLC','June','Malayalam','Offline',0,0,'0','2 Sundays in a month',NULL),('C003','Advanced Certificate Course on Theology','6 Months',0,0.00,'Plus Two','June','Malayalam','Offline',1,0,'0','null',NULL),('C004','Certificate Course on Theology(Online)','1 Year',24,0.00,'SSLC','July','Malayalam','Online',0,0,'0','2 Days in a Month',NULL),('C005','Basic Bible Course','1 Year',0,0.00,'null','March','Malayalam','Offline',0,0,'0','Every Sundays',NULL),('C006','Advanced Catechist Training Course(Advanced CTC)','null',0,0.00,'Catechist Training Course(CTC)','May','Malayalam','Offline',0,1,'0','2 Days in May',NULL),('C007','Certificate Course on Sacred Liturgy','1 Year',24,0.00,'SSLC','June','Malayalam','Offline',0,0,'0','2 Sundays in a Month',NULL),('C008','Certificate Course on Guidance and Counselling','1 Year',9,0.00,'Plus Two','June','Malayalam','Offline',0,0,'0','2 Sundays in a Month',NULL),('C009','Certificate Course on the Life in Holy Spirit','null',24,0.00,'SSLC','July','Malayalam','Offline',0,0,'0','2 Sundays in a Month',NULL),('C010','Catechism of the Catholic Church(CCC)','null',12,0.00,'SSLC','July','Malayalam','Offline',0,0,'0','2 Sundays in a Month',NULL),('C011','Basic Theology Course','3 Months',16,0.00,'SSLC','January','Malayalam','Offline',0,0,'1','null',NULL);
/*!40000 ALTER TABLE course ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table faculty
--

DROP TABLE IF EXISTS faculty;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE faculty (
  faculty_id varchar(10) NOT NULL,
  name varchar(30) NOT NULL,
  email varchar(30) NOT NULL,
  department varchar(30) NOT NULL,
  phone_no int NOT NULL,
  last_updated_by varchar(50) DEFAULT NULL,
  last_updated_on datetime DEFAULT NULL,
  PRIMARY KEY (faculty_id),
  CONSTRAINT f_id FOREIGN KEY (faculty_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table faculty
--

LOCK TABLES faculty WRITE;
/*!40000 ALTER TABLE faculty DISABLE KEYS */;
INSERT INTO faculty VALUES ('ITHF01','Ms. Dhanya Anto','faculty@gmail.com','CS',1234567890,NULL,NULL);
/*!40000 ALTER TABLE faculty ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table faculty_subject
--

DROP TABLE IF EXISTS faculty_subject;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE faculty_subject (
  faculty_id varchar(20) DEFAULT NULL,
  subject_id varchar(20) DEFAULT NULL,
  KEY faculty_id_idx (faculty_id),
  KEY subject_id_idx (subject_id),
  CONSTRAINT faculty_id3 FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id),
  CONSTRAINT subject_id2 FOREIGN KEY (subject_id) REFERENCES subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table faculty_subject
--

LOCK TABLES faculty_subject WRITE;
/*!40000 ALTER TABLE faculty_subject DISABLE KEYS */;
/*!40000 ALTER TABLE faculty_subject ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table fees
--

DROP TABLE IF EXISTS fees;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE fees (
  fee_id varchar(20) NOT NULL,
  student_id varchar(20) NOT NULL,
  course_id varchar(20) NOT NULL,
  total_fees decimal(8,2) NOT NULL,
  amount_paid decimal(8,2) NOT NULL,
  payment_status varchar(10) NOT NULL,
  date date NOT NULL,
  due_date date NOT NULL,
  PRIMARY KEY (fee_id),
  KEY student_id_idx (student_id),
  KEY course_id_idx (course_id),
  CONSTRAINT course_id2 FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT student_id FOREIGN KEY (student_id) REFERENCES student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table fees
--

LOCK TABLES fees WRITE;
/*!40000 ALTER TABLE fees DISABLE KEYS */;
INSERT INTO fees VALUES ('F001','ITH26001','C001',25000.00,15000.00,'partial','2025-09-20','2025-09-30');
/*!40000 ALTER TABLE fees ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table mark
--

DROP TABLE IF EXISTS mark;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE mark (
  student_id varchar(20) NOT NULL,
  course_id varchar(20) NOT NULL,
  subject_id varchar(20) NOT NULL,
  exam_mark decimal(5,2) NOT NULL,
  assignment_mark decimal(5,2) NOT NULL,
  attendence varchar(10) NOT NULL,
  total_mark decimal(5,2) NOT NULL,
  status char(1) NOT NULL,
  PRIMARY KEY (subject_id),
  KEY course_id4_idx (course_id),
  CONSTRAINT course_id4 FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT subject_id FOREIGN KEY (subject_id) REFERENCES subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table mark
--

LOCK TABLES mark WRITE;
/*!40000 ALTER TABLE mark DISABLE KEYS */;
INSERT INTO mark VALUES ('ITH26001','C001','S001',80.00,10.00,'95',95.00,'p');
/*!40000 ALTER TABLE mark ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table roles
--

DROP TABLE IF EXISTS roles;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE roles (
  role_id int NOT NULL,
  role varchar(20) NOT NULL,
  PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table roles
--

LOCK TABLES roles WRITE;
/*!40000 ALTER TABLE roles DISABLE KEYS */;
INSERT INTO roles VALUES (1,'Superuser'),(2,'Admin'),(3,'Faculty'),(4,'student'),(5,'superintendent');
/*!40000 ALTER TABLE roles ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table student
--

DROP TABLE IF EXISTS student;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE student (
  student_id varchar(20) NOT NULL,
  name varchar(30) NOT NULL,
  house_name varchar(30) NOT NULL,
  post_office varchar(30) NOT NULL,
  place varchar(30) NOT NULL,
  district varchar(20) NOT NULL,
  state varchar(20) NOT NULL,
  pin int NOT NULL,
  dob date NOT NULL,
  sex varchar(10) NOT NULL,
  course varchar(50) NOT NULL,
  father varchar(30) NOT NULL,
  mother varchar(30) NOT NULL,
  religion_caste varchar(20) NOT NULL,
  nationality varchar(20) NOT NULL,
  qualification varchar(20) NOT NULL,
  email varchar(30) NOT NULL,
  whatsapp_no int NOT NULL,
  year int NOT NULL,
  last_updated_by varchar(50) DEFAULT NULL,
  last_updated_on datetime DEFAULT NULL,
  UNIQUE KEY student_id_UNIQUE (student_id),
  UNIQUE KEY email_UNIQUE (email),
  CONSTRAINT s_id FOREIGN KEY (student_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table student
--

LOCK TABLES student WRITE;
/*!40000 ALTER TABLE student DISABLE KEYS */;
INSERT INTO student VALUES ('ITH26001','Gouri','thottiyil','srr','srr','pkd','kerala',123456,'2020-09-05','female','B.A. in Theology and Religious Studies','rajendran','maya','hindu','indian','sslc','gouri@gmail.com',1234567890,2025,NULL,NULL);
/*!40000 ALTER TABLE student ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table student_course
--

DROP TABLE IF EXISTS student_course;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE student_course (
  student_id varchar(20) DEFAULT NULL,
  course_id varchar(20) DEFAULT NULL,
  KEY student_id3_idx (student_id),
  KEY course_id6_idx (course_id),
  CONSTRAINT course_id6 FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT student_id3 FOREIGN KEY (student_id) REFERENCES student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table student_course
--

LOCK TABLES student_course WRITE;
/*!40000 ALTER TABLE student_course DISABLE KEYS */;
/*!40000 ALTER TABLE student_course ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table subject
--

DROP TABLE IF EXISTS subject;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE subject (
  subject_id varchar(30) NOT NULL,
  subject_name varchar(30) NOT NULL,
  course_id varchar(20) NOT NULL,
  faculty_id varchar(20) NOT NULL,
  PRIMARY KEY (subject_id),
  KEY course_id_idx (course_id),
  KEY faculty_id_idx (faculty_id),
  CONSTRAINT course_id FOREIGN KEY (course_id) REFERENCES course (course_id),
  CONSTRAINT faculty_id FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table subject
--

LOCK TABLES subject WRITE;
/*!40000 ALTER TABLE subject DISABLE KEYS */;
INSERT INTO subject VALUES ('S001','Basics in Theology','C001','ITHF01');
/*!40000 ALTER TABLE subject ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table temp_student
--

DROP TABLE IF EXISTS temp_student;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE temp_student (
  id int NOT NULL AUTO_INCREMENT,
  candidate_name varchar(100) NOT NULL,
  alias varchar(45) DEFAULT NULL,
  house_name varchar(50) DEFAULT NULL,
  post_office varchar(45) DEFAULT NULL,
  district varchar(45) DEFAULT NULL,
  state varchar(45) DEFAULT NULL,
  pin int DEFAULT NULL,
  course_name varchar(100) NOT NULL,
  date_of_birth date NOT NULL,
  sex varchar(10) NOT NULL,
  father_name varchar(45) NOT NULL,
  mother_name varchar(45) NOT NULL,
  religion varchar(20) NOT NULL,
  caste varchar(45) NOT NULL,
  nationality varchar(20) NOT NULL,
  educational_qualification varchar(45) NOT NULL,
  email varchar(100) NOT NULL,
  mobile_no varchar(20) NOT NULL,
  superintendent_of_server varchar(100) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status varchar(20) NOT NULL DEFAULT 'pending',
  photo_path varchar(500) DEFAULT NULL,
  certificate_path varchar(500) DEFAULT NULL,
  payment_status varchar(20) DEFAULT 'unpaid',
  course_fee varchar(50) DEFAULT NULL,
  submitted_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp NULL DEFAULT NULL,
  rejected_at timestamp NULL DEFAULT NULL,
  paid_at timestamp NULL DEFAULT NULL,
  academic_year varchar(10) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table temp_student
--

LOCK TABLES temp_student WRITE;
/*!40000 ALTER TABLE temp_student DISABLE KEYS */;
INSERT INTO temp_student VALUES (2,'Gouri Raj',NULL,NULL,NULL,NULL,NULL,NULL,'Bachelor of Religious Education','2005-09-20','','Rajendran T K','','Hindu','','Indian','Plus Two','gouriraj5002@gmail.com','8281819746','abcd','2025-10-22 06:00:17','approved',NULL,'','unpaid','₹50,000','2025-10-26 15:03:29',NULL,NULL,NULL,'2024-25'),(24,'Gouriraj',NULL,NULL,NULL,NULL,NULL,NULL,'Certificate in Biblical Studies','2025-10-08','','Rajendran T K','','Hindu','','Indian','sslc','abcd@gmail.com','1234567890','abcd','2025-10-24 11:14:02','approved',NULL,'','unpaid','₹50,000','2025-10-26 15:03:29',NULL,NULL,NULL,'2024-25'),(27,'Gouri',NULL,NULL,NULL,NULL,NULL,NULL,'Master of Arts in Christian Counseling','2005-09-20','','abcd','','Hindu','','Indian','plus two','gouriraj5002@gmail.com','8281819746','abcd','2025-10-26 16:22:52','pending','student-photo-1761495772594-630400856.png','','unpaid','₹50,000','2025-10-26 16:22:52',NULL,NULL,NULL,'2024-25');
/*!40000 ALTER TABLE temp_student ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table users
--

DROP TABLE IF EXISTS users;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE users (
  id varchar(20) NOT NULL,
  username varchar(45) NOT NULL,
  password varchar(45) NOT NULL,
  role_id int NOT NULL,
  PRIMARY KEY (id),
  KEY user_id_idx (role_id),
  CONSTRAINT user_id FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table users
--

LOCK TABLES users WRITE;
/*!40000 ALTER TABLE users DISABLE KEYS */;
INSERT INTO users VALUES ('ITH26001','student123','password123',4),('ITHA01','admin789','password789',2),('ITHF01','faculty456','password456',3),('ITHSUP','Rev. Dr. Saijo Thaikkattil','password111',5);
/*!40000 ALTER TABLE users ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 19:13:48