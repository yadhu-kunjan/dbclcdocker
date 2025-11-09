// services/email.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: './authconfig.env' });

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const generatePaymentLink = (applicationId, courseFee) => {
  const baseUrl = process.env.PAYMENT_PORTAL_URL || 'http://localhost:8080/payment';
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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .course-details { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px; }
          .course-details h3 { margin-top: 0; color: #667eea; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .payment-box { background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border: 2px solid #2196f3; padding: 30px; margin: 25px 0; border-radius: 10px; text-align: center; }
          .payment-box h3 { color: #1976d2; margin-top: 0; font-size: 20px; }
          .amount { font-size: 36px; font-weight: bold; color: #1976d2; margin: 15px 0; }
          .deadline { color: #d32f2f; font-weight: bold; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 45px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; font-size: 16px; transition: transform 0.2s; }
          .button:hover { transform: scale(1.05); }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; font-size: 14px; }
          .steps { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .steps h3 { margin-top: 0; color: #333; }
          .steps ol { margin: 10px 0; padding-left: 20px; }
          .steps li { margin: 8px 0; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; margin-top: 30px; }
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

            <p>We are delighted to inform you that your application has been <strong style="color: #667eea;">APPROVED</strong>! 🎉</p>

            <div class="course-details">
              <h3>📚 Course Details</h3>
              <div class="detail-row">
                <span class="detail-label">Course Name:</span>
                <span class="detail-value"><strong>${application.courseName}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Course Fee:</span>
                <span class="detail-value"><strong>${application.courseFee}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">#${application.id}</span>
              </div>
            </div>

            <div class="payment-box">
              <h3>💳 Payment Required</h3>
              <p>To complete your enrollment, please pay the course fee:</p>
              <div class="amount">${application.courseFee}</div>
              <p class="deadline">⏰ Payment Deadline: ${formattedDeadline}</p>
              <a href="${paymentLink}" class="button">💰 Pay Now</a>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> Please complete the payment within 7 days to secure your seat. After the deadline, your application may be cancelled.
            </div>

            <div class="steps">
              <h3>📝 Next Steps:</h3>
              <ol>
                <li>Click the <strong>"Pay Now"</strong> button above</li>
                <li>Complete the payment securely</li>
                <li>You will receive a confirmation email</li>
                <li>Your enrollment will be finalized</li>
              </ol>
            </div>

            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>

            <div class="footer">
              <p>Best regards,<br>
              <strong>Admissions Office</strong><br>
              DBCLC Institute of Theology<br>
              <em>This is an automated email. Please do not reply to this address.</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: application.email,
      subject: `🎓 Application Approved - Payment Required for ${application.courseName}`,
      html: emailHtml,
    });

    console.log('✅ Approval email sent successfully via Resend:', result.id);
    return { success: true, emailId: result.id };

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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .alert-box { background: linear-gradient(135deg, #fff3cd 0%, #ffe082 100%); border: 2px solid #ffc107; padding: 30px; margin: 25px 0; border-radius: 10px; text-align: center; }
          .alert-box h3 { margin-top: 0; color: #f57f17; font-size: 20px; }
          .course-info { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .course-info p { margin: 8px 0; }
          .amount { font-size: 36px; font-weight: bold; color: #f5576c; margin: 15px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 45px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; font-size: 16px; transition: transform 0.2s; }
          .button:hover { transform: scale(1.05); }
          .urgent { background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 5px; color: #c62828; font-weight: 500; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Payment Reminder</h1>
          </div>

          <div class="content">
            <p>Dear <strong>${application.candidateName}</strong>,</p>

            <p>This is a friendly reminder that your course fee payment is still <strong style="color: #f5576c;">PENDING</strong>.</p>

            <div class="alert-box">
              <h3>💳 Payment Required</h3>
              <div class="course-info">
                <p><strong>Course:</strong> ${application.courseName}</p>
                <p><strong>Amount Due:</strong></p>
              </div>
              <div class="amount">${application.courseFee}</div>
              <a href="${paymentLink}" class="button">💰 Complete Payment Now</a>
            </div>

            <div class="urgent">
              <strong>⚠️ Urgent:</strong> Please complete your payment as soon as possible to avoid cancellation of your admission. Your seat is reserved only until payment is received.
            </div>

            <p>If you have already made the payment, please disregard this email. If you face any issues with the payment, please contact our admissions office immediately.</p>

            <div class="footer">
              <p>Best regards,<br>
              <strong>Admissions Office</strong><br>
              DBCLC Institute of Theology<br>
              <em>This is an automated email. Please do not reply to this address.</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: application.email,
      subject: `⏰ Payment Reminder - ${application.courseName}`,
      html: emailHtml,
    });

    console.log('✅ Payment reminder email sent successfully via Resend:', result.id);
    return { success: true, emailId: result.id };

  } catch (error) {
    console.error('Error in sendPaymentReminderEmail:', error);
    throw error;
  }
};