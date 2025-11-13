# Quick Test Guide - Application Form Database Integration

## 🚀 Quick Start

### Step 1: Start the Services
```bash
# Make sure you're in the project root directory
cd c:\Users\gouth\OneDrive\Desktop\new_project\dbclcdocker

# Start Docker containers (database and backend)
docker-compose up -d

# Wait for services to be ready (about 30 seconds)
```

### Step 2: Start the Frontend (if not already running)
```bash
# In a new terminal
npm run dev
```

### Step 3: Access the Application Form
Open your browser and navigate to the application form page.

## 📝 Test Submission

### Fill the form with test data:

**Personal Information:**
- Full Name: John Doe
- Alias: Johnny (optional)
- House Name: Test House
- Post Office: Central PO
- Place: Test City
- District: Test District
- State: Kerala
- PIN Code: 682001
- Sex: Male
- Date of Birth: 1995-01-15

**Family Information:**
- Father's Name: James Doe
- Mother's Name: Mary Doe

**Other Details:**
- Religion: Christian
- Caste Category: Forward Caste (FC)
- Nationality: Indian
- Educational Qualification: B.A. in Philosophy
- Email: john.doe@example.com
- Mobile Number: 9876543210
- Superintendent of the Server: Rev. Fr. Thomas

**Course Selection:**
- Check appropriate eligibility boxes
- Select at least one course from the dropdown

**File Uploads:**
- Photo: Upload a small image (< 500KB)
- Certificates: Upload a PDF file (< 5MB)

### Click Submit

You should see:
1. Loading state on the submit button
2. Success message: "✅ Application Submitted Successfully!"
3. Form resets to empty state

## ✅ Verify Data in Database

### Option 1: Using Docker MySQL Client
```bash
# Connect to MySQL
docker exec -it project_db mysql -u root -ptheology@dbclc2005

# Run these SQL commands:
USE theology;

# View the latest application
SELECT * FROM temp_student ORDER BY id DESC LIMIT 1;

# View all applications
SELECT id, candidate_name, email, course_name, status, created_at 
FROM temp_student 
ORDER BY id DESC;

# Exit MySQL
exit;
```

### Option 2: Using API Endpoint
```bash
# Get all applications
curl http://localhost:3001/api/applications
```

### Option 3: Check Uploaded Files
```bash
# List uploaded files
dir backend\uploads

# You should see files like:
# student-photo-1234567890-123456789.jpg
# student-cert-1234567890-987654321.pdf
```

## 🔍 What to Check

### In Database:
- ✅ New record created in `temp_student` table
- ✅ All fields populated correctly
- ✅ `status` = 'pending'
- ✅ `payment_status` = 'unpaid'
- ✅ `created_at` and `submitted_at` timestamps set
- ✅ `photo_path` and `certificate_path` contain filenames

### In File System:
- ✅ Photo file exists in `backend/uploads/`
- ✅ Certificate file exists in `backend/uploads/`
- ✅ Files are accessible

## 🐛 Common Issues & Solutions

### Issue: "Network Error" or "Failed to submit"
**Solution:**
```bash
# Check if backend is running
docker ps

# Check backend logs
docker logs project_backend

# Restart backend if needed
docker-compose restart backend
```

### Issue: "Missing required fields"
**Solution:**
- Make sure ALL required fields are filled (marked with red asterisk)
- Educational Qualification field must be filled
- At least one course must be selected

### Issue: "Photo must be <= 500KB"
**Solution:**
- Resize your photo to be smaller than 500KB
- Use online tools or image editors to compress

### Issue: "Certificates PDF must be <= 5MB"
**Solution:**
- Compress your PDF file
- Use online PDF compressors

### Issue: Database connection error
**Solution:**
```bash
# Check if database container is running
docker ps | findstr project_db

# Check database logs
docker logs project_db

# Restart database
docker-compose restart db

# Wait 30 seconds for database to be ready
```

## 📊 Sample SQL Queries

### View all pending applications:
```sql
SELECT id, candidate_name, email, course_name, created_at 
FROM temp_student 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Count applications by status:
```sql
SELECT status, COUNT(*) as count 
FROM temp_student 
GROUP BY status;
```

### View applications with photos:
```sql
SELECT id, candidate_name, photo_path, certificate_path 
FROM temp_student 
WHERE photo_path IS NOT NULL 
ORDER BY id DESC;
```

### View recent applications (last 24 hours):
```sql
SELECT id, candidate_name, email, course_name, created_at 
FROM temp_student 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
ORDER BY created_at DESC;
```

## 🎯 Success Criteria

Your integration is working correctly if:
- ✅ Form submits without errors
- ✅ Success message appears
- ✅ Data appears in `temp_student` table
- ✅ All fields are correctly populated
- ✅ Files are uploaded to `backend/uploads/`
- ✅ File paths are saved in database
- ✅ Form resets after submission

## 📞 Need Help?

If you encounter issues:
1. Check the browser console (F12) for JavaScript errors
2. Check backend logs: `docker logs project_backend`
3. Check database logs: `docker logs project_db`
4. Verify environment variables in `.env` and `backend/authconfig.env`
5. Ensure all Docker containers are running: `docker ps`

## 🔄 Reset Test Data

To clear test submissions:
```sql
# Connect to database
docker exec -it project_db mysql -u root -ptheology@dbclc2005

USE theology;

# Delete all test applications (BE CAREFUL!)
DELETE FROM temp_student WHERE candidate_name LIKE '%Test%';

# Or delete all applications (BE VERY CAREFUL!)
# DELETE FROM temp_student;

exit;
```

To clear uploaded files:
```bash
# Delete all uploaded files (BE CAREFUL!)
del backend\uploads\student-*
```

## 📝 Next Steps After Testing

Once you've verified the integration works:
1. Test with different data combinations
2. Test file upload limits
3. Test validation errors
4. Build admin interface to view applications
5. Add email notifications
6. Implement approval workflow
7. Add payment integration

