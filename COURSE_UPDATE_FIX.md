# Course Update Fix - Complete Guide

## Problem Identified

The course updates made in the admin dashboard were not persisting or showing on the home page programs section. This was caused by **TWO ISSUES**:

### Issue 1: Missing Course Management Endpoints
The course management endpoints (GET, POST, PUT, DELETE for `/api/admin/courses`) were **NOT** present in the correct backend server file (`backend/src/routes/admin.js`). They were only in a duplicate backend folder (`src/backend/src/server.js`) which is not being used.

### Issue 2: Browser Caching
The frontend was caching course data, preventing fresh data from being loaded even when navigating back to the home page.

## Solution Implemented

### ✅ Part 1: Added Course Management Endpoints to Admin Routes

Added the following endpoints to `backend/src/routes/admin.js`:

1. **GET /api/admin/courses** - Get all courses
2. **GET /api/admin/courses/:id** - Get a single course
3. **POST /api/admin/courses** - Create a new course
4. **PUT /api/admin/courses/:id** - Update a course
5. **DELETE /api/admin/courses/:id** - Delete a course

All endpoints:
- Require authentication (verifyToken middleware)
- Properly parse JSON subjects field from database
- Return consistent response format with `success` flag
- Include proper error handling

### ✅ Part 2: Fixed Browser Caching Issues

#### Frontend Changes:

1. **src/components/ProgramsSection.jsx**
   - Added cache-busting parameter: `params: { _t: Date.now() }`
   - Ensures fresh data on every request

2. **src/components/ProgramsPage.jsx**
   - Added cache-busting parameter: `params: { _t: Date.now() }`
   - Ensures fresh data on programs page

3. **src/services/api.js**
   - Added cache control headers to all GET requests:
     - `Cache-Control: no-cache, no-store, must-revalidate`
     - `Pragma: no-cache`
     - `Expires: 0`

#### Backend Changes:

4. **backend/src/server.js**
   - Added cache control headers to `/api/courses` endpoint
   - Prevents server-side caching

## How to Test the Fix

### Step 1: Rebuild and Restart Docker Containers

**IMPORTANT:** Since you're using Docker, you must rebuild the backend container for the new endpoints to take effect.

```bash
# Stop all containers
docker-compose down

# Rebuild the backend container (this picks up the new code)
docker-compose build backend

# Start all containers
docker-compose up -d

# OR do it all in one command:
docker-compose up -d --build backend
```

**To view logs and verify backend is running:**
```bash
# View backend logs
docker-compose logs -f backend

# You should see:
# "Server running on port 3001"
# "Successfully connected to the database"
```

### Step 2: Clear Browser Cache

1. Open your browser's Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. OR use Ctrl+Shift+Delete to clear browsing data

### Step 3: Test Course Updates

1. **Login to Admin Dashboard**
   - Go to `http://localhost:8080` (Docker frontend port)
   - Login as admin

2. **Update a Course**
   - Navigate to the "Academic" tab
   - Click "Edit" on any course
   - Change the title, fee, or description
   - Click "Update Course"
   - Verify the changes appear in the admin dashboard

3. **Verify on Home Page**
   - Navigate to the home page (click logo or go to `/`)
   - Scroll to the "Academic Programs" section
   - **The updated course information should now be visible**

4. **Verify on Programs Page**
   - Click "View All Programs" button
   - OR navigate to `/programs`
   - **All course updates should be visible here too**

5. **Test Refresh**
   - Refresh the admin dashboard (F5)
   - **The course updates should persist**

## Expected Behavior After Fix

✅ Course updates in admin dashboard save to database
✅ Course updates persist after refreshing admin dashboard
✅ Course updates appear on home page programs section
✅ Course updates appear on dedicated programs page
✅ No caching issues - always shows fresh data
✅ All CRUD operations work (Create, Read, Update, Delete)

## Troubleshooting

### If updates still don't appear:

1. **Check Docker Containers are Running**
   ```bash
   docker-compose ps

   # All containers should show "Up" status:
   # project_db        Up (healthy)
   # project_backend   Up
   # project_frontend  Up
   ```

2. **Check Backend Logs for Errors**
   ```bash
   docker-compose logs backend

   # Should see:
   # Server running on port 3001
   # Successfully connected to the database
   # ✅ Created courses table
   ```

3. **Check Browser Console for Errors**
   - Open Developer Tools (F12)
   - Check Console tab for any red errors
   - Check Network tab to see if API calls are successful

4. **Verify Database Connection**
   ```bash
   # Check database container is healthy
   docker-compose ps db

   # Should show: Up (healthy)
   ```

5. **Check API Endpoints**
   - Open browser to: `http://localhost:3001/api/courses`
   - Should see JSON response with courses array
   - If you get connection error, backend container is not running

6. **Rebuild Everything from Scratch**
   ```bash
   # Stop and remove all containers
   docker-compose down

   # Rebuild all containers
   docker-compose build --no-cache

   # Start fresh
   docker-compose up -d

   # Watch logs
   docker-compose logs -f
   ```

### Common Issues:

**Issue:** "Course not found" error when updating
- **Solution:** The course ID might be incorrect. Check database to verify course exists.

**Issue:** Changes appear in admin but not on home page
- **Solution:** Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

**Issue:** 401 Unauthorized error
- **Solution:** Login again. Your auth token may have expired.

**Issue:** 500 Internal Server Error
- **Solution:** Check backend console logs for detailed error message

## Files Modified

### Backend Files:
1. ✅ `backend/src/routes/admin.js` - Added course management endpoints
2. ✅ `backend/src/server.js` - Added cache control headers to /api/courses

### Frontend Files:
1. ✅ `src/components/ProgramsSection.jsx` - Added cache-busting
2. ✅ `src/components/ProgramsPage.jsx` - Added cache-busting
3. ✅ `src/services/api.js` - Added cache control headers to GET requests

## Database Schema

The `courses` table structure:
```sql
CREATE TABLE courses (
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
);
```

## API Endpoints Reference

### Public Endpoint (No Auth Required):
- `GET /api/courses` - Get all courses (used by home page)

### Admin Endpoints (Auth Required):
- `GET /api/admin/courses` - Get all courses (admin view)
- `GET /api/admin/courses/:id` - Get single course
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course

## Docker-Specific Commands Reference

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# Rebuild and restart backend
docker-compose up -d --build backend
```

### View Logs
```bash
# View all logs
docker-compose logs

# Follow backend logs in real-time
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Access Containers
```bash
# Access backend container shell
docker-compose exec backend sh

# Access database
docker-compose exec db mysql -u appuser -p theology
```

### Clean Up
```bash
# Remove all containers and networks
docker-compose down

# Remove containers, networks, and volumes (⚠️ deletes database data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Next Steps

1. ✅ Rebuild backend Docker container: `docker-compose up -d --build backend`
2. ✅ Clear browser cache (Ctrl+Shift+R)
3. ✅ Test course updates in admin dashboard
4. ✅ Verify changes appear on home page
5. ✅ Verify changes persist after refresh

---

**Status:** ✅ FIX COMPLETE - Ready for Docker deployment

**Environment:** Docker Compose
**Frontend URL:** http://localhost:8080
**Backend URL:** http://localhost:3001
**Database Port:** 3307 (mapped from container's 3306)

**Last Updated:** 2025-11-04

