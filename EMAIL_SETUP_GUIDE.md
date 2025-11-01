# Email Setup Guide for DBCLC Institute

This guide will help you configure automated email functionality for the DBCLC Institute application.

## 📧 Email Configuration

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Update Environment Variables** in `backend/authconfig.env`:
   ```env
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   
   # Institution Information
   INSTITUTION_NAME=DBCLC Institute of Theology
   SUPPORT_EMAIL=support@dbclc.edu
   SUPPORT_PHONE=+91-1234567890
   PAYMENT_PORTAL_URL=https://payments.dbclc.edu
   ```

### 2. Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

## 🚀 Installation

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   - Update `backend/authconfig.env` with your email settings
   - Make sure all required environment variables are set

3. **Test Email Configuration**:
   ```bash
   cd backend
   node test-email.js
   ```

## 📋 Email Features

### Automated Emails

1. **Application Approval**:
   - Sent automatically when admin approves an application
   - Includes payment details and instructions
   - Professional HTML template with institution branding

2. **Payment Request**:
   - Can be sent manually from admin dashboard
   - Includes course fee, payment deadline, and portal link
   - Reminder functionality for unpaid applications

3. **Status Updates**:
   - Application rejection notifications
   - Payment confirmation emails
   - General status change notifications

### Email Templates

- **Professional HTML Design**: Responsive, branded templates
- **Fallback Text Version**: Plain text for all email clients
- **Dynamic Content**: Personalized with student and course information
- **Institution Branding**: Customizable with your institution details

## 🔧 Customization

### Email Templates
Edit `backend/src/services/emailService.js` to customize:
- Email content and styling
- Institution information
- Payment instructions
- Contact details

### Email Triggers
Modify `backend/src/routes/admin.js` to add more email triggers:
- Payment confirmations
- Course enrollment confirmations
- Reminder emails
- Notification emails

## 🛠️ Troubleshooting

### Common Issues

1. **"Authentication failed"**:
   - Check your email and password
   - Ensure 2FA is enabled and app password is used
   - Verify SMTP settings

2. **"Connection timeout"**:
   - Check SMTP host and port
   - Verify firewall settings
   - Try different SMTP port (465 for SSL)

3. **"Email not received"**:
   - Check spam folder
   - Verify recipient email address
   - Check email server logs

### Testing

Use the test script to verify email configuration:
```bash
cd backend
node test-email.js
```

## 📊 Email Analytics

The system logs all email activities:
- Success/failure status
- Message IDs for tracking
- Error details for debugging
- Timestamps for audit trails

## 🔒 Security

- App passwords are used instead of main account passwords
- SMTP connections use TLS encryption
- Email content is sanitized
- No sensitive data in email logs

## 📞 Support

For email configuration issues:
1. Check the logs in `backend/logs/`
2. Verify environment variables
3. Test with a simple email first
4. Contact system administrator

---

**Note**: Make sure to keep your email credentials secure and never commit them to version control.
