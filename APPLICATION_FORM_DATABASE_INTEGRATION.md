# Application Form Database Integration

## Overview
The ApplicationForm component has been successfully connected to the backend database. When applicants fill out and submit the form, their data is now stored in the `temp_student` table in the `theology` database.

## Changes Made

### 1. Backend Route Updates (`backend/src/routes/applications.js`)

**Updated the POST /applications endpoint to:**
- Accept multipart/form-data with photo and certificate uploads
- Map all form fields to the correct `temp_student` table columns
- Validate required fields before insertion
- Handle file uploads (photo max 500KB, certificates max 5MB)
- Insert data into the database with proper field mapping

**Database Fields Mapped:**
- `candidate_name` - Full name of the applicant
- `full_address` - Complete address (combined from house_name, post_office, place, district, state, pin)
- `course_name` - Selected courses (comma-separated if multiple)
- `date_of_birth` - Date of birth
- `father_name` - Father's name
- `religion_caste` - Combined religion and caste (e.g., "Christian - Forward Caste (FC)")
- `nationality` - Nationality
- `educational_qualification` - Highest educational qualification
- `email` - Email address
- `mobile_no` - Mobile number
- `superintendent_of_server` - Superintendent name
- `photo_path` - Path to uploaded photo file
- `certificate_path` - Path to uploaded certificates PDF

**Default Values Set:**
- `status` - 'pending' (automatically set by database)
- `payment_status` - 'unpaid' (automatically set by database)
- `created_at` - Current timestamp (automatically set by database)
- `submitted_at` - Current timestamp (automatically set by database)

### 2. Frontend Form Updates (`src/components/ApplicationForm.jsx`)

**Added:**
- Import of `applicationAPI` from services
- `educationalQualification` field to form state
- Educational Qualification input field in the form
- Real API submission replacing the simulated submission

**Updated handleSubmit function to:**
- Create FormData object with all form fields
- Attach photo and certificate files
- Submit to backend API endpoint
- Handle success and error responses
- Reset form on successful submission
- Display appropriate alerts to users

### 3. API Service Updates (`src/services/api.js`)

**Updated applicationAPI.submit to:**
- Accept FormData directly or create it from object
- Support both old and new calling patterns
- Properly handle multipart/form-data submissions

## Database Schema

The `temp_student` table structure (ACTUAL schema in database):
```sql
CREATE TABLE temp_student (
  id int NOT NULL AUTO_INCREMENT,
  candidate_name varchar(100) NOT NULL,
  full_address text NOT NULL,
  course_name varchar(100) NOT NULL,
  date_of_birth date NOT NULL,
  father_name varchar(100) NOT NULL,
  religion_caste varchar(50) NOT NULL,
  nationality varchar(50) NOT NULL,
  educational_qualification text NOT NULL,
  email varchar(100) NOT NULL,
  mobile_no varchar(20) NOT NULL,
  superintendent_of_server varchar(100) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  photo_path varchar(500) DEFAULT NULL,
  payment_status varchar(20) DEFAULT 'unpaid',
  course_fee varchar(50) DEFAULT '50,000',
  submitted_at timestamp DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp NULL DEFAULT NULL,
  rejected_at timestamp NULL DEFAULT NULL,
  paid_at timestamp NULL DEFAULT NULL,
  assignment_marks json DEFAULT NULL,
  attendance_record json DEFAULT NULL,
  cgpa decimal(3,2) DEFAULT 0.00,
  semester varchar(20) DEFAULT '1st',
  academic_year varchar(10) DEFAULT '2024-25',
  certificate_path varchar(500) DEFAULT NULL,
  PRIMARY KEY (id)
)
```

**Note:** The form collects individual address fields (house_name, post_office, place, district, state, pin) which are combined into `full_address`. Similarly, religion and caste are combined into `religion_caste`.

## How to Test

### Prerequisites
1. Ensure Docker containers are running:
   ```bash
   docker-compose up -d
   ```

2. Verify backend server is running on port 3001
3. Verify frontend is running on port 5173 (or your configured port)
4. Verify database is accessible on port 3307

### Testing Steps

1. **Navigate to the Application Form**
   - Open your browser and go to the application form page
   - URL should be something like: `http://localhost:5173/apply` or wherever the form is accessible

2. **Fill Out the Form**
   - Fill in all required fields (marked with red asterisk *)
   - Upload a photo (max 500KB, image format)
   - Upload certificates (max 5MB, PDF format)
   - Select at least one course

3. **Submit the Form**
   - Click the Submit button
   - You should see a loading state while submitting
   - On success: Alert message "✅ Application Submitted Successfully!"
   - On error: Alert with error details

4. **Verify in Database**
   You can verify the data was saved by:
   
   **Option A: Using MySQL Client**
   ```bash
   docker exec -it project_db mysql -u root -p
   # Enter password: theology@dbclc2005
   
   USE theology;
   SELECT * FROM temp_student ORDER BY id DESC LIMIT 1;
   ```

   **Option B: Using Backend API**
   ```bash
   curl http://localhost:3001/api/applications
   ```

   **Option C: Check uploaded files**
   Files are stored in `backend/uploads/` directory:
   - Photos: `student-photo-[timestamp]-[random].jpg/png`
   - Certificates: `student-cert-[timestamp]-[random].pdf`

### Expected Results

1. **Successful Submission:**
   - Form data saved to `temp_student` table
   - Files uploaded to `backend/uploads/` directory
   - File paths saved in database
   - Status set to 'pending'
   - Payment status set to 'unpaid'
   - Timestamps automatically recorded
   - Form resets after successful submission

2. **Validation Errors:**
   - Missing required fields: Error message displayed
   - Photo too large (>500KB): Error message
   - Certificate too large (>5MB): Error message
   - Invalid file types: Error message

## API Endpoint Details

**POST /api/applications**
- **Content-Type:** multipart/form-data
- **Fields:** All form fields + photo + certificates files
- **Response on Success:**
  ```json
  {
    "success": true,
    "message": "Application submitted successfully!",
    "application": { /* inserted record */ }
  }
  ```
- **Response on Error:**
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "Detailed error"
  }
  ```

## Troubleshooting

### Issue: "Failed to submit application"
- Check if backend server is running
- Check database connection
- Verify .env configuration
- Check browser console for detailed errors

### Issue: "Missing required fields"
- Ensure all required fields are filled
- Check that educationalQualification field has a value
- Verify selectedCourses array is not empty

### Issue: Files not uploading
- Check file size limits (photo: 500KB, certificates: 5MB)
- Verify file types (photo: image/*, certificates: application/pdf)
- Ensure `backend/uploads/` directory exists and is writable

### Issue: Database connection error
- Verify Docker containers are running
- Check database credentials in backend/authconfig.env
- Test database connection manually

## Next Steps

1. **Test the form submission** with various data
2. **Verify data integrity** in the database
3. **Test file uploads** with different file sizes and types
4. **Add admin interface** to view submitted applications
5. **Implement email notifications** for new applications
6. **Add payment integration** for approved applications

## Files Modified

1. `backend/src/routes/applications.js` - Backend API route
2. `src/components/ApplicationForm.jsx` - Frontend form component
3. `src/services/api.js` - API service layer

## Configuration Files

- `.env` - Environment variables (VITE_API_BASE_URL)
- `backend/authconfig.env` - Backend database configuration
- `docker-compose.yml` - Docker services configuration

