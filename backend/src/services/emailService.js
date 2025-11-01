import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

// Send payment request email
export const sendPaymentRequestEmail = async (application) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}" <${process.env.SMTP_USER || 'noreply@dbclc.edu'}>`,
      to: application.email,
      subject: `Payment Request - ${application.courseName} Application Approved`,
      html: generatePaymentEmailHTML(application),
      text: generatePaymentEmailText(application)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment request email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending payment request email:', error);
    return { success: false, error: error.message };
  }
};

// Send application status update email
export const sendStatusUpdateEmail = async (application, status) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}" <${process.env.SMTP_USER || 'noreply@dbclc.edu'}>`,
      to: application.email,
      subject: `Application Status Update - ${application.courseName}`,
      html: generateStatusUpdateEmailHTML(application, status),
      text: generateStatusUpdateEmailText(application, status)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Status update email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML email for payment request
const generatePaymentEmailHTML = (application) => {
  const institutionName = process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology';
  const paymentDeadline = new Date();
  paymentDeadline.setDate(paymentDeadline.getDate() + 7); // 7 days from now
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .button { display: inline-block; background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .course-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .fee-amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <h2>Your Application Has Been Approved</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${application.candidateName}</strong>,</p>
          
          <p>We are pleased to inform you that your application for <strong>${application.courseName}</strong> has been approved by our admissions committee.</p>
          
          <div class="highlight">
            <h3>📋 Next Steps - Payment Required</h3>
            <p>To complete your enrollment, please proceed with the course fee payment as detailed below:</p>
          </div>
          
          <div class="course-details">
            <h3>Course Details</h3>
            <p><strong>Program:</strong> ${application.courseName}</p>
            <p><strong>Student Name:</strong> ${application.candidateName}</p>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Mobile:</strong> ${application.mobileNo}</p>
          </div>
          
          <div class="highlight">
            <h3>💰 Payment Information</h3>
            <p class="fee-amount">Course Fee: ${application.courseFee}</p>
            <p><strong>Payment Deadline:</strong> ${paymentDeadline.toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Payment Methods:</strong> Bank Transfer, UPI, Credit/Debit Card</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.PAYMENT_PORTAL_URL || '#'}" class="button">💳 Pay Now</a>
          </div>
          
          <div class="highlight">
            <h3>📞 Need Help?</h3>
            <p>If you have any questions about the payment process or need assistance, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'support@dbclc.edu'}</li>
              <li><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '+91-1234567890'}</li>
              <li><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</li>
            </ul>
          </div>
          
          <p>We look forward to welcoming you to our institution and supporting your academic journey.</p>
          
          <p>Best regards,<br>
          <strong>Admissions Office</strong><br>
          ${institutionName}</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate text email for payment request
const generatePaymentEmailText = (application) => {
  const paymentDeadline = new Date();
  paymentDeadline.setDate(paymentDeadline.getDate() + 7);
  
  return `
Congratulations! Your Application Has Been Approved

Dear ${application.candidateName},

We are pleased to inform you that your application for ${application.courseName} has been approved by our admissions committee.

NEXT STEPS - PAYMENT REQUIRED
To complete your enrollment, please proceed with the course fee payment:

Course Details:
- Program: ${application.courseName}
- Student Name: ${application.candidateName}
- Email: ${application.email}
- Mobile: ${application.mobileNo}

Payment Information:
- Course Fee: ${application.courseFee}
- Payment Deadline: ${paymentDeadline.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
- Payment Methods: Bank Transfer, UPI, Credit/Debit Card

Payment Portal: ${process.env.PAYMENT_PORTAL_URL || 'Contact us for payment details'}

Need Help?
If you have any questions about the payment process:
- Email: ${process.env.SUPPORT_EMAIL || 'support@dbclc.edu'}
- Phone: ${process.env.SUPPORT_PHONE || '+91-1234567890'}
- Office Hours: Monday - Friday, 9:00 AM - 5:00 PM

We look forward to welcoming you to our institution.

Best regards,
Admissions Office
${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}. All rights reserved.
  `;
};

// Generate HTML email for status updates
const generateStatusUpdateEmailHTML = (application, status) => {
  const institutionName = process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology';
  const statusMessages = {
    approved: {
      title: '🎉 Application Approved!',
      message: 'Congratulations! Your application has been approved.',
      nextSteps: 'Please check your email for payment instructions.'
    },
    rejected: {
      title: 'Application Status Update',
      message: 'We regret to inform you that your application was not approved.',
      nextSteps: 'You may reapply in the next intake period.'
    }
  };
  
  const statusInfo = statusMessages[status] || {
    title: 'Application Status Update',
    message: `Your application status has been updated to: ${status}`,
    nextSteps: 'Please contact us for more information.'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.title}</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${application.candidateName}</strong>,</p>
          
          <div class="status-box">
            <h3>${statusInfo.message}</h3>
            <p><strong>Course:</strong> ${application.courseName}</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
          </div>
          
          <p>${statusInfo.nextSteps}</p>
          
          <p>If you have any questions, please contact our admissions office:</p>
          <ul>
            <li><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'admissions@dbclc.edu'}</li>
            <li><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '+91-1234567890'}</li>
          </ul>
          
          <p>Best regards,<br>
          <strong>Admissions Office</strong><br>
          ${institutionName}</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate text email for status updates
const generateStatusUpdateEmailText = (application, status) => {
  const statusMessages = {
    approved: {
      title: 'Application Approved!',
      message: 'Congratulations! Your application has been approved.',
      nextSteps: 'Please check your email for payment instructions.'
    },
    rejected: {
      title: 'Application Status Update',
      message: 'We regret to inform you that your application was not approved.',
      nextSteps: 'You may reapply in the next intake period.'
    }
  };
  
  const statusInfo = statusMessages[status] || {
    title: 'Application Status Update',
    message: `Your application status has been updated to: ${status}`,
    nextSteps: 'Please contact us for more information.'
  };
  
  return `
${statusInfo.title}

Dear ${application.candidateName},

${statusInfo.message}

Course: ${application.courseName}
Status: ${status.toUpperCase()}

${statusInfo.nextSteps}

If you have any questions, please contact our admissions office:
- Email: ${process.env.SUPPORT_EMAIL || 'admissions@dbclc.edu'}
- Phone: ${process.env.SUPPORT_PHONE || '+91-1234567890'}

Best regards,
Admissions Office
${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology'}. All rights reserved.
  `;
};
