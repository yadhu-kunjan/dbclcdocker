# Quick Docker Restart Instructions

## 🚀 To Apply the Course Update Fix

Since you're using Docker, follow these steps to apply the backend changes:

### Option 1: Quick Restart (Recommended)
```bash
# Rebuild and restart only the backend container
docker-compose up -d --build backend
```

### Option 2: Full Restart
```bash
# Stop all containers
docker-compose down

# Rebuild backend
docker-compose build backend

# Start all containers
docker-compose up -d
```

### Option 3: Complete Clean Rebuild (if issues persist)
```bash
# Stop and remove everything
docker-compose down

# Rebuild without cache
docker-compose build --no-cache backend

# Start fresh
docker-compose up -d
```

## ✅ Verify It's Working

### 1. Check Container Status
```bash
docker-compose ps
```
**Expected output:**
```
NAME                STATUS
project_db          Up (healthy)
project_backend     Up
project_frontend    Up
```

### 2. Check Backend Logs
```bash
docker-compose logs backend
```
**Look for:**
- ✅ "Server running on port 3001"
- ✅ "Successfully connected to the database"
- ✅ "Created courses table"

### 3. Test API Endpoint
Open in browser: http://localhost:3001/api/courses

**Expected:** JSON response with courses array

### 4. Test Frontend
1. Open: http://localhost:8080
2. Login as admin
3. Go to Academic tab
4. Update a course
5. Navigate to home page
6. **Course changes should now appear!**

## 🔍 Troubleshooting

### Backend won't start?
```bash
# View detailed logs
docker-compose logs -f backend

# Check for port conflicts
netstat -ano | findstr :3001

# Restart backend
docker-compose restart backend
```

### Database connection issues?
```bash
# Check database is healthy
docker-compose ps db

# Access database directly
docker-compose exec db mysql -u appuser -papppassword theology

# Check if courses table exists
SHOW TABLES;
SELECT * FROM courses;
```

### Frontend not loading?
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Still having issues?
```bash
# Nuclear option - rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Watch all logs
docker-compose logs -f
```

## 📝 Important Notes

- **Frontend URL:** http://localhost:8080
- **Backend API:** http://localhost:3001
- **Database Port:** 3307 (external) / 3306 (internal)
- **Database Name:** theology
- **Database User:** appuser
- **Database Password:** apppassword (default)

## 🎯 What Was Fixed

1. ✅ Added course management endpoints to `backend/src/routes/admin.js`
2. ✅ Added cache-busting to frontend components
3. ✅ Added no-cache headers to prevent stale data

## 🔄 After Restart

1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Test course updates in admin dashboard
3. Verify changes appear on home page
4. Verify changes persist after page refresh

---

**Quick Command Reference:**
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild backend
docker-compose up -d --build backend

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

**Status:** Ready to deploy! 🚀

