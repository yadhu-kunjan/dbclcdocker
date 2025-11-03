# Resend Email Automation Setup Guide

## Overview
Your application now has automated email notifications using the **Resend API**. When an admin approves a student application, an approval email is automatically sent with course details and payment portal links.

## What's Been Implemented

### 1. **Resend API Integration**
- ✅ Resend package installed (`npm install resend`)
- ✅ API key configured in `backend/authconfig.env`
- ✅ Email service updated to use Resend instead of nodemailer

### 2. **Automated Approval Email**
When an admin clicks **"Approve"** on a student application:
- Email is automatically sent to the student
- Includes course details (name, fee, application ID)
- Contains payment portal link with 7-day deadline
- Professional HTML template with course information

### 3. **Payment Reminder Email**
Admin can manually send payment reminders via the "Send Email" button:
- Reminds students about pending payments
- Includes payment portal link
- Urgent payment deadline notification

## Email Templates

### Approval Email Content
```
📧 Subject: 🎓 Application Approved - Payment Required for [Course Name]

Includes:
- Congratulations message
- Course Details section (name, fee, application ID)
- Payment box with amount and 7-day deadline
- Payment portal link (clickable button)
- Next steps instructions
- Important warning about payment deadline
```

### Payment Reminder Email Content
```
📧 Subject: ⏰ Payment Reminder - [Course Name]

Includes:
- Payment pending notification
- Course information
- Amount due
- Payment portal link
- Urgent payment warning
```

## Configuration

### Environment Variables (backend/authconfig.env)
```env
# Resend API Configuration
RESEND_API_KEY=re_fE9WxWft_GpqBPnXhcpWv8BJqfe1YZ1Zv

# Email sender address
FROM_EMAIL=onboarding@resend.dev

# Payment Portal URL (customize as needed)
PAYMENT_PORTAL_URL=https://yourapp.com/payment
```

## How It Works

### 1. Admin Approves Application
```
Admin Dashboard → Applications Tab → Click "Approve" button
```

### 2. Automatic Email Trigger
```
Backend receives approval request
↓
Updates application status to "approved"
↓
Automatically sends approval email via Resend API
↓
Student receives email with payment details
```

### 3. Manual Payment Reminder
```
Admin Dashboard → Applications Tab → Click "Send Email" button
↓
Backend sends payment reminder email via Resend API
↓
Student receives reminder to complete payment
```

## API Endpoints

### Update Application Status (Auto-sends approval email)
```
PATCH /api/admin/applications/:id/status
Body: { "status": "approved" }
```

### Send Payment Reminder Email
```
POST /api/admin/applications/:id/send-payment-email
```

## Files Modified

1. **backend/src/services/emailService.js**
   - Replaced nodemailer with Resend API
   - Updated email templates with course details
   - Enhanced HTML styling for professional appearance

2. **backend/src/routes/admin.js**
   - Added automatic email sending on approval
   - Added payment reminder email endpoint
   - Integrated sendApprovalEmail function

3. **backend/authconfig.env**
   - Added RESEND_API_KEY
   - Added FROM_EMAIL
   - Updated PAYMENT_PORTAL_URL

## Testing the Email System

### Test Approval Email
1. Go to Admin Dashboard
2. Navigate to Applications tab
3. Find a pending application
4. Click "Approve" button
5. Check student's email for approval notification

### Test Payment Reminder
1. Go to Admin Dashboard
2. Navigate to Applications tab
3. Find an approved application with unpaid status
4. Click "Send Email" button
5. Check student's email for payment reminder

## Payment Portal Link Format
```
http://localhost:8080/payment?application_id=123&amount=₹5000
```

Customize the `PAYMENT_PORTAL_URL` in `authconfig.env` to point to your actual payment portal.

## Email Features

✅ **Professional HTML Templates** - Responsive design with gradients and styling
✅ **Course Details** - Shows course name, fee, and application ID
✅ **Payment Portal Links** - Direct links to payment page
✅ **7-Day Deadline** - Automatic deadline calculation
✅ **Error Handling** - Graceful error handling if email fails
✅ **Logging** - Console logs for email sending status
✅ **Resend API** - Reliable email delivery service

## Troubleshooting

### Email Not Sending
1. Check Resend API key in `authconfig.env`
2. Verify student email address is correct
3. Check backend logs: `docker logs project_backend`
4. Ensure FROM_EMAIL is verified in Resend dashboard

### Email Template Issues
1. Check email HTML in `backend/src/services/emailService.js`
2. Verify course details are being passed correctly
3. Test with different email clients

### Payment Link Not Working
1. Update `PAYMENT_PORTAL_URL` in `authconfig.env`
2. Ensure payment portal is accessible
3. Check URL format in email template

## Next Steps

1. **Customize Email Templates** - Update sender name, institution details
2. **Set Up Payment Portal** - Create payment page at the configured URL
3. **Test with Real Emails** - Send test emails to verify delivery
4. **Monitor Email Logs** - Check Resend dashboard for delivery status
5. **Add Email Scheduling** - Implement automatic payment reminders

## Support

For issues with Resend API:
- Visit: https://resend.com/docs
- Check API status: https://status.resend.com
- Contact support: support@resend.com

