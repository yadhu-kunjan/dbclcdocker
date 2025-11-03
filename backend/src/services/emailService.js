// services/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './authconfig.env' });

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generatePaymentLink = (applicationId, courseFee) => {
  const baseUrl = process.env.PAYMENT_PORTAL_URL || 'https://yourapp.com/payment';
  return `${baseUrl}?application_id=${applicationId}&amount=${courseFee}`;
};

export const sendApprovalEmail = async (application) => {
  try {
    const paymentLink = generatePaymentLink(application.id, application.courseFee);
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const formattedDeadline = deadline.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .payment-box { background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
          .amount { font-size: 32px; font-weight: bold; color: #1976d2; margin: 10px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Application Approved!</h1>
            <p>Congratulations on your admission</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${application.candidateName}</strong>,</p>
            
            <p>We are delighted to inform you that your application for <strong>${application.courseName}</strong> has been <strong>approved</strong>!</p>
            
            <div class="payment-box">
              <h3 style="color: #1976d2; margin-top: 0;">💳 Payment Required</h3>
              <p>To complete your enrollment, please pay the course fee:</p>
              <div class="amount">${application.courseFee}</div>
              <p style="color: #f44336; font-weight: bold;">Payment Deadline: ${formattedDeadline}</p>
              <a href="${paymentLink}" class="button">Pay Now</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Please complete the payment within 7 days to secure your seat.
            </div>
            
            <h3>📝 Next Steps:</h3>
            <ol>
              <li>Click the "Pay Now" button above</li>
              <li>Complete the payment</li>
              <li>You will receive confirmation email</li>
              <li>Your enrollment will be finalized</li>
            </ol>
            
            <p>Best regards,<br>
            <strong>Admissions Office</strong><br>
            DBCLC Institute of Theology</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || 'DBCLC Admissions <noreply@dbclc.edu>',
      to: application.email,
      subject: `🎓 Application Approved - Payment Required for ${application.courseName}`,
      html: emailHtml,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, emailId: info.messageId };
    
  } catch (error) {
    console.error('Error in sendApprovalEmail:', error);
    throw error;
  }
};

export const sendPaymentReminderEmail = async (application) => {
  try {
    const paymentLink = generatePaymentLink(application.id, application.courseFee);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
          .amount { font-size: 28px; font-weight: bold; color: #f5576c; margin: 10px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Payment Reminder</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${application.candidateName}</strong>,</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">Payment Pending</h3>
              <p>Your course fee payment is still pending:</p>
              <div class="amount">${application.courseFee}</div>
              <p>Course: <strong>${application.courseName}</strong></p>
              <a href="${paymentLink}" class="button">Complete Payment Now</a>
            </div>
            
            <p>Please complete your payment at the earliest to avoid cancellation.</p>
            
            <p>Best regards,<br>
            <strong>Admissions Office</strong><br>
            DBCLC Institute of Theology</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || 'DBCLC Admissions <noreply@dbclc.edu>',
      to: application.email,
      subject: `⏰ Payment Reminder - ${application.courseName}`,
      html: emailHtml,
    });

    return { success: true, emailId: info.messageId };
    
  } catch (error) {
    console.error('Error in sendPaymentReminderEmail:', error);
    throw error;
  }
};