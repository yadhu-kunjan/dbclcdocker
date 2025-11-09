# DBCLC Institute - Setup Guide for Your Friend

This guide will help your friend set up the DBCLC Institute application with their existing database.

## 🗄️ Database Requirements

Your friend needs a MySQL database with the following configuration:

### Database Details
- **Host**: localhost (or their database server)
- **Port**: 3307 (default MySQL port)
- **Database Name**: theology
- **Username**: root (or their MySQL username)
- **Password**: theology@dbclc2005 (or their MySQL password)

## 🚀 Quick Setup Steps

### 1. Install Dependencies
```bash
# Navigate to backend directory
cd backend

# Install all required packages
npm install
```

### 2. Configure Database Connection
Edit `backend/authconfig.env` file and update the database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=theology@dbclc2005
DB_NAME=theology
```

**Important**: Replace the database credentials with your friend's actual MySQL credentials.

### 3. Configure Email Settings (Optional)
If your friend wants to use the email features, update the email configuration in `backend/authconfig.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Institution Information
INSTITUTION_NAME=DBCLC Institute of Theology
SUPPORT_EMAIL=support@dbclc.edu
SUPPORT_PHONE=+91-1234567890
PAYMENT_PORTAL_URL=https://payments.dbclc.edu
```

### 4. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will:
- Connect to the database
- Run automatic migrations to create required tables
- Populate the courses table with static data
- Start on http://localhost:3001

### 5. Start the Frontend
In a new terminal:
```bash
# Navigate to project root
cd ..

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on http://localhost:5173

## 📊 Database Tables Created

The application will automatically create these tables:

1. **temp_student** - Student applications
2. **assignment** - Assignment management
3. **attendance** - Attendance tracking
4. **courses** - Course catalog (populated with static data)
5. **admin_settings** - Admin configuration

## 🔧 Features Available

### Admin Dashboard
- View and manage student applications
- Approve/reject applications
- Send automated payment request emails
- Export application data to CSV
- Academic management (assignments, attendance)

### Student Dashboard
- View enrolled courses
- Check grades and attendance
- View assignments and deadlines
- Track payment status

### Faculty Dashboard
- Manage courses and students
- Grade assignments
- Mark attendance
- View academic statistics

## 📧 Email Features

If email is configured, the system will:
- Automatically send payment request emails when applications are approved
- Send status update emails for application changes
- Provide professional HTML email templates

## 🛠️ Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
2. Check database credentials in `authconfig.env`
3. Ensure the database exists
4. Check firewall settings

### Email Issues
1. Configure SMTP settings in `authconfig.env`
2. Use app passwords for Gmail
3. Test email configuration with `node test-email.js`

### Port Issues
- Backend runs on port 3001
- Frontend runs on port 5173
- Make sure these ports are available

## 📱 Access the Application

1. Open browser and go to http://localhost:5173
2. The application will load with all features working
3. Use the admin dashboard to manage applications
4. Test the email functionality by approving an application

## 🎉 Success!

Once everything is running, your friend will have a fully functional DBCLC Institute management system with:
- Student application management
- Automated email notifications
- Academic management features
- Professional dashboards for all user types

The application is ready to use for managing theological education programs!
