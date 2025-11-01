# Backend API Endpoints for MySQL Integration

Here are the API endpoints you need to create in your backend:

## Authentication Endpoints

### POST /api/auth/login
```json
Request:
{
  "username": "student123",
  "password": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "user": {
    "id": "1",
    "name": "John Smith",
    "email": "john.smith@seminary.edu",
    "role": "student",
    "studentId": "STU-2024-001"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/logout
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
```json
Response:
{
  "success": true,
  "user": {
    "id": "1",
    "name": "John Smith",
    "email": "john.smith@seminary.edu",
    "role": "student"
  }
}
```

## Application Endpoints

### POST /api/applications
```json
Request:
{
  "candidateName": "John Doe",
  "fullAddress": "123 Main St, City, State",
  "courseName": "Bachelor of Theology",
  "dateOfBirth": "1995-05-15",
  "fatherName": "Robert Doe",
  "religionCaste": "Christian",
  "nationality": "American",
  "educationalQualification": "High School Diploma",
  "email": "john@example.com",
  "mobileNo": "+1234567890",
  "superintendentOfServer": "Rev. Smith"
}

Response:
{
  "success": true,
  "application": {
    "id": "app_123",
    "candidateName": "John Doe",
    // ... other fields
    "status": "pending",
    "submittedAt": "2025-01-15T10:30:00Z"
  }
}
```

### GET /api/applications
```json
Response:
{
  "success": true,
  "applications": [
    {
      "id": "app_123",
      "candidateName": "John Doe",
      // ... all application fields
      "status": "pending",
      "submittedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### PATCH /api/applications/:id
```json
Request:
{
  "status": "approved"
}

Response:
{
  "success": true,
  "application": {
    "id": "app_123",
    // ... updated application data
    "status": "approved"
  }
}
```

## MySQL Table Structures

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  student_id VARCHAR(20),
  faculty_id VARCHAR(20),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_name VARCHAR(100) NOT NULL,
  full_address TEXT NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  father_name VARCHAR(100) NOT NULL,
  religion_caste VARCHAR(50) NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  educational_qualification TEXT NOT NULL,
  email VARCHAR(100) NOT NULL,
  mobile_no VARCHAR(20) NOT NULL,
  superintendent_of_server VARCHAR(100) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables
Create a `.env` file in your backend:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=theology@dbclc2005
DB_NAME=theology
JWT_SECRET=3c29d83114762bdd0e965bcf502796e23f4c5ba4bf44535dcf0e1f0ee98e8a15a87a403620615dd3448466bbe9fe223a7a1854864b9da8f9714d43216e5752df
PORT=3306
```

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gouriraj5002@gmail.com
SMTP_PASS=gouriraj@2005

# Institution Information
INSTITUTION_NAME=DBCLC Institute of Theology
SUPPORT_EMAIL=support@dbclc.edu
SUPPORT_PHONE=+91-1234567890
PAYMENT_PORTAL_URL=https://payments.dbclc.edu