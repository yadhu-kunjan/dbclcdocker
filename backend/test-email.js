// Test email configuration
import { sendPaymentRequestEmail } from './src/services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './authconfig.env' });

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  
  // Check environment variables
  console.log('📋 Environment check:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
  console.log(`INSTITUTION_NAME: ${process.env.INSTITUTION_NAME || 'NOT SET'}`);
  
  // Test with sample application data
  const testApplication = {
    id: 1,
    candidateName: 'Test Student',
    courseName: 'Bachelor of Theology (B.Th)',
    courseFee: '₹50,000',
    email: process.env.SMTP_USER || 'test@example.com', // Send to yourself for testing
    mobileNo: '+91-9876543210',
    fatherName: 'Test Father',
    nationality: 'Indian',
    religionCaste: 'Christian',
    dateOfBirth: '1995-01-01',
    educationalQualification: '12th Grade',
    fullAddress: '123 Test Street, Test City, Test State',
    superintendentOfServer: 'Test Superintendent',
    status: 'approved',
    paymentStatus: 'unpaid',
    submittedAt: new Date(),
    approvedAt: new Date(),
    photoPath: null
  };
  
  try {
    console.log('\n📧 Sending test email...');
    const result = await sendPaymentRequestEmail(testApplication);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
      console.log('Check your inbox (and spam folder) for the test email.');
    } else {
      console.log('❌ Test email failed:');
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Test email error:');
    console.error(error.message);
  }
  
  console.log('\n🔧 If the test failed, check:');
  console.log('1. Email credentials in authconfig.env');
  console.log('2. 2FA enabled and app password generated');
  console.log('3. SMTP settings for your email provider');
  console.log('4. Firewall/network restrictions');
  
  process.exit(0);
}

testEmail();
