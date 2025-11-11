# Docker Login Fix - Complete Guide

## Issues Fixed

The login problem in Docker was caused by several configuration issues:

### 1. **Backend Dockerfile Issue**
- **Problem**: The Dockerfile was copying `authconfig.env` which had hardcoded `DB_HOST=localhost`
- **Fix**: Removed the `authconfig.env` copy from Dockerfile. Now uses environment variables from `docker-compose.yml`

### 2. **Database Configuration Issue**
- **Problem**: `backend/src/config/db.js` was loading from `authconfig.env` with `DB_HOST=localhost`
- **Fix**: Updated to use environment variables directly from Docker, with `DB_HOST=db` (the service name)

### 3. **Server Configuration Issue**
- **Problem**: `backend/src/server.js` was loading from `authconfig.env` instead of Docker environment
- **Fix**: Changed to use `dotenv.config()` which reads from Docker environment variables

### 4. **CORS Configuration Issue**
- **Problem**: CORS was not allowing requests from Docker container URLs
- **Fix**: Added Docker container URLs to CORS whitelist

### 5. **Nginx Proxy Issue**
- **Problem**: Nginx was proxying to `http://backend:3001` but container name is `project_backend`
- **Fix**: Updated to `http://project_backend:3001`

### 6. **Missing Environment Variables**
- **Problem**: JWT_SECRET and other critical variables weren't properly passed to Docker
- **Fix**: Added all required environment variables to `docker-compose.yml` with proper defaults

## Files Modified

1. **backend/Dockerfile**
   - Removed `authconfig.env` copy
   - Now relies on Docker environment variables

2. **backend/src/config/db.js**
   - Removed authconfig.env loading
   - Uses environment variables directly

3. **backend/src/server.js**
   - Changed to `dotenv.config()` without path
   - Added Docker container URLs to CORS

4. **docker-compose.yml**
   - Added JWT_SECRET and RESEND_API_KEY
   - Added FROM_EMAIL configuration
   - Ensured all environment variables are properly set

5. **nginx.conf**
   - Updated backend proxy to use correct container name

6. **.env** (New file)
   - Created with all required environment variables for Docker

## How to Run

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3001/api
```

### Option 2: Using Existing Images

```bash
# Start services without rebuilding
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Testing Login

### Test Credentials

The system seeds demo users on startup. Use these credentials:

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Student Login:**
- Username: `student1`
- Password: `student123`

**Faculty Login:**
- Username: `faculty1`
- Password: `faculty123`

### Manual Testing

1. Open http://localhost:8080 in your browser
2. Click "Login" button
3. Enter credentials (e.g., admin/admin123)
4. Click "Login"
5. You should be redirected to the appropriate dashboard

### API Testing

```bash
# Test login endpoint directly
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response:
# {
#   "success": true,
#   "user": {
#     "id": "ADMIN01",
#     "userId": "ADMIN01",
#     "username": "admin",
#     "role": "admin",
#     "name": "admin",
#     "email": "admin@dbclc.com"
#   },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if database container is running
docker ps | grep project_db

# Check database logs
docker logs project_db

# Verify database is healthy
docker-compose ps
```

### Issue: "Login fails with 401 Unauthorized"

**Solution:**
1. Check backend logs: `docker logs project_backend`
2. Verify JWT_SECRET is set: `docker exec project_backend env | grep JWT_SECRET`
3. Verify database connection: `docker exec project_db mysql -u appuser -p theology -e "SELECT * FROM users;"`

### Issue: "Frontend cannot reach backend"

**Solution:**
1. Check nginx logs: `docker logs project_frontend`
2. Verify backend is running: `docker logs project_backend`
3. Test backend directly: `curl http://localhost:3001/api/auth/me`

### Issue: "CORS error in browser console"

**Solution:**
- This is fixed in the updated server.js
- If still occurring, check that frontend is accessing via correct URL
- Frontend should use `/api` (proxied through nginx) not `http://localhost:3001/api`

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | db | Database host (use 'db' for Docker) |
| DB_PORT | 3306 | Database port |
| DB_USER | appuser | Database user |
| DB_PASSWORD | apppassword | Database password |
| DB_NAME | theology | Database name |
| JWT_SECRET | (long string) | JWT signing secret |
| RESEND_API_KEY | (key) | Email service API key |
| FROM_EMAIL | onboarding@resend.dev | Sender email address |
| VITE_API_BASE_URL | /api | Frontend API base URL |

## Production Deployment

For production, create a `.env` file with secure values:

```bash
# .env (production)
DB_HOST=your-db-host
DB_USER=secure-user
DB_PASSWORD=secure-password
JWT_SECRET=generate-a-secure-random-string
RESEND_API_KEY=your-resend-api-key
```

Then run:
```bash
docker-compose --env-file .env up -d
```

## Verification Checklist

- [ ] Docker containers are running: `docker ps`
- [ ] Database is healthy: `docker-compose ps`
- [ ] Backend logs show "Successfully connected to the database"
- [ ] Frontend loads at http://localhost:8080
- [ ] Login works with test credentials
- [ ] JWT token is returned on successful login
- [ ] Dashboard loads after login
- [ ] Logout works correctly

## Additional Resources

- Docker Compose Documentation: https://docs.docker.com/compose/
- MySQL Docker Image: https://hub.docker.com/_/mysql
- Node.js Docker Image: https://hub.docker.com/_/node
- Nginx Docker Image: https://hub.docker.com/_/nginx
