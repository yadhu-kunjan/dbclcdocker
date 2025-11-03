# Email System - Quick Start Guide

## 🚀 What's New

Your admin dashboard now has **automated email notifications** powered by Resend API!

## 📧 Email Types

### 1. Approval Email (Automatic)
**Triggered when:** Admin clicks "Approve" on a pending application

**What student receives:**
- ✅ Congratulations message
- ✅ Course details (name, fee, application ID)
- ✅ Payment amount and 7-day deadline
- ✅ Direct link to payment portal
- ✅ Next steps instructions

**Example:**
```
Subject: 🎓 Application Approved - Payment Required for Theology Diploma

Dear John,

We are delighted to inform you that your application has been APPROVED! 🎉

📚 Course Details
Course Name: Theology Diploma
Course Fee: ₹5,000
Application ID: #12345

💳 Payment Required
To complete your enrollment, please pay the course fee:
₹5,000

⏰ Payment Deadline: November 10, 2025

[💰 Pay Now] ← Click to pay

⚠️ Important: Please complete the payment within 7 days to secure your seat.
```

### 2. Payment Reminder Email (Manual)
**Triggered when:** Admin clicks "Send Email" button on an approved application

**What student receives:**
- ✅ Payment pending notification
- ✅ Course and amount information
- ✅ Direct payment link
- ✅ Urgent payment warning

## 🎯 How to Use

### Send Approval Email (Automatic)
```
1. Go to Admin Dashboard
2. Click "Applications" tab
3. Find a pending application
4. Click "Approve" button
5. ✅ Email automatically sent to student!
```

### Send Payment Reminder (Manual)
```
1. Go to Admin Dashboard
2. Click "Applications" tab
3. Find an approved application with unpaid status
4. Click "Send Email" button
5. ✅ Reminder email sent to student!
```

## 📋 Email Content Includes

### Course Details Section
- Course name
- Course fee
- Application ID
- Student name

### Payment Information
- Amount due
- Payment deadline (7 days from approval)
- Payment portal link
- Payment instructions

### Call-to-Action
- Prominent "Pay Now" button
- Direct link to payment portal
- Clear next steps

## 🔧 Configuration

### Payment Portal URL
Edit `backend/authconfig.env`:
```env
PAYMENT_PORTAL_URL=https://yourapp.com/payment
```

The payment link will be:
```
https://yourapp.com/payment?application_id=123&amount=₹5000
```

### Email Sender
Edit `backend/authconfig.env`:
```env
FROM_EMAIL=onboarding@resend.dev
```

## ✨ Features

✅ **Automatic Sending** - No manual action needed for approval emails
✅ **Professional Design** - Beautiful HTML templates
✅ **Course Details** - All relevant information included
✅ **Payment Links** - Direct links to payment portal
✅ **Deadline Tracking** - Automatic 7-day deadline calculation
✅ **Error Handling** - Graceful error handling
✅ **Logging** - Backend logs all email activities

## 📊 Email Status

Check email sending status in backend logs:
```bash
docker logs project_backend | grep -i email
```

Look for messages like:
```
✅ Approval email sent successfully via Resend: email_123456
✅ Payment reminder email sent successfully via Resend: email_789012
```

## 🐛 Troubleshooting

### Email Not Received
1. Check student email address is correct
2. Check spam/junk folder
3. Verify Resend API key is valid
4. Check backend logs for errors

### Wrong Payment Amount
1. Verify course fee in database
2. Check application details
3. Ensure course_fee field is populated

### Payment Link Not Working
1. Update PAYMENT_PORTAL_URL in authconfig.env
2. Ensure payment portal is accessible
3. Test URL in browser

## 📞 Support

For Resend API issues:
- Documentation: https://resend.com/docs
- Status: https://status.resend.com
- Support: support@resend.com

## 🎓 Example Workflow

```
Student applies for course
        ↓
Admin reviews application
        ↓
Admin clicks "Approve"
        ↓
✅ Approval email sent automatically
        ↓
Student receives email with payment link
        ↓
Student clicks "Pay Now"
        ↓
Student completes payment
        ↓
Admin marks as paid
        ↓
✅ Enrollment complete!
```

## 📝 Notes

- Approval emails are sent **automatically** when you approve
- Payment reminders are sent **manually** when you click "Send Email"
- All emails include course details and payment portal links
- Emails are sent via Resend API (reliable delivery)
- Check backend logs to verify email sending

---

**Ready to use!** Start approving applications and watch the emails flow! 🚀

