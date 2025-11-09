# Authentication System Update

## Overview
Updated the authentication system to work with the new database structure where there's a single `login` table and a `users` table with roles.

## Database Structure
- **login table**: Contains login credentials (username, password) and references `user_id` from users table
- **users table**: Contains user details (name, email, role) with unique IDs

## Changes Made

### Backend Changes

#### 1. Updated Authentication Routes (`backend/src/routes/auth.js`)
- Modified login endpoint to JOIN `login` and `users` tables
- Added role verification to ensure users can only login with their assigned role
- Enhanced JWT payload to include `userId` (reference to users table)
- Added `verifyToken` middleware for protected routes
- Updated `/me` endpoint to return complete user information

#### 2. Updated Student Routes (`backend/src/routes/student.js`)
- Added `/student/all` endpoint for admins to fetch all students
- Updated `/student/:studentId/profile` to work with new database structure
- Added authentication middleware to protect student routes
- Enhanced student profile endpoint to include application data from `temp_student` table

### Frontend Changes

#### 1. Updated Authentication Context (`src/contexts/AuthContext.jsx`)
- Enhanced user object to include additional fields (userId, name, email)
- Updated login function to handle new user structure

#### 2. Updated API Service (`src/services/api.js`)
- Added `studentAPI.getAll()` method for fetching all students
- Added `authAPI.refreshUser()` method for refreshing user data

#### 3. Enhanced Admin Dashboard (`src/components/dashboards/AdminDashboard.jsx`)
- Added Student Management section
- Added functionality to view all students
- Added detailed student information modal
- Updated stats to show actual student count
- Added "View Details" functionality for each student

## New Features

### Admin Student Management
- **View All Students**: Admins can see a list of all registered students
- **Student Details Modal**: Click "View Details" to see comprehensive student information including:
  - Basic information (name, email, username, mobile, DOB, nationality)
  - Additional information (father's name, religion/caste, course, education, superintendent)
  - Application details (status, submission date)
  - Student photo (if uploaded)
  - System information (login ID, user ID, account creation date)

### Enhanced Authentication
- Role-based access control
- JWT tokens include user role and user ID
- Protected routes with authentication middleware
- Better error handling and user feedback

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username, password, and role
- `GET /api/auth/me` - Get current user information (protected)
- `POST /api/auth/logout` - Logout

### Student Management (Admin Only)
- `GET /api/student/all` - Get all students
- `GET /api/student/:studentId/profile` - Get detailed student profile

## Usage

### For Admins
1. Login with admin credentials
2. Navigate to Admin Dashboard
3. View "Student Management" section
4. Click "View Details" on any student to see comprehensive information

### Database Requirements
Ensure your database has the following structure:
```sql
-- login table
CREATE TABLE login (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing
1. Start the backend server: `npm start` in backend directory
2. Start the frontend: `npm run dev` in root directory
3. Login as admin
4. Navigate to Admin Dashboard
5. Test the Student Management functionality
