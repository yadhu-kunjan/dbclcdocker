import { Router } from 'express';
import { getDbPool } from '../config/db.js';
import { verifyToken } from './auth.js';
import { sendPaymentRequestEmail, sendStatusUpdateEmail } from '../services/emailService.js';

const router = Router();

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const pool = getDbPool();
    
    // Get application counts by status
    const [statusCounts] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM temp_student 
      GROUP BY status
    `);
    
    // Get payment status counts for approved applications
    const [paymentCounts] = await pool.execute(`
      SELECT 
        payment_status,
        COUNT(*) as count
      FROM temp_student 
      WHERE status = 'approved'
      GROUP BY payment_status
    `);
    
    // Calculate total revenue
    const [revenueResult] = await pool.execute(`
      SELECT 
        SUM(CAST(REPLACE(REPLACE(course_fee, '₹', ''), ',', '') AS UNSIGNED)) as total_revenue,
        COUNT(*) as paid_count
      FROM temp_student 
      WHERE payment_status = 'paid'
    `);
    
    const totalRevenue = revenueResult[0]?.total_revenue || 0;
    const paidCount = revenueResult[0]?.paid_count || 0;
    
    // Convert status counts to object
    const statusCountsObj = {};
    statusCounts.forEach(row => {
      statusCountsObj[row.status] = row.count;
    });
    
    // Convert payment counts to object
    const paymentCountsObj = {};
    paymentCounts.forEach(row => {
      paymentCountsObj[row.payment_status] = row.count;
    });
    
    const stats = {
      pending: statusCountsObj.pending || 0,
      approved: statusCountsObj.approved || 0,
      rejected: statusCountsObj.rejected || 0,
      awaitingPayment: paymentCountsObj.unpaid || 0,
      fullyEnrolled: paymentCountsObj.paid || 0,
      totalRevenue: totalRevenue,
      paidCount: paidCount
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics', error: error.message });
  }
});

// Get all applications with filtering and pagination
router.get('/applications', verifyToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const { 
      page = 1, 
      limit = 50, 
      status = 'all', 
      payment = 'all', 
      search = '' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    
    if (status !== 'all') {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (payment !== 'all') {
      whereConditions.push('payment_status = ?');
      queryParams.push(payment);
    }
    
    if (search) {
      whereConditions.push(`(
        candidate_name LIKE ? OR 
        email LIKE ? OR 
        mobile_no LIKE ? OR 
        course_name LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM temp_student 
      ${whereClause}
    `, queryParams);
    
    const total = countResult[0].total;
    
    // Get applications
    const [applications] = await pool.execute(`
      SELECT 
        id,
        candidate_name,
        course_name,
        course_fee,
        email,
        mobile_no,
        father_name,
        nationality,
        religion_caste,
        date_of_birth,
        educational_qualification,
        full_address,
        superintendent_of_server,
        status,
        payment_status,
        submitted_at,
        approved_at,
        rejected_at,
        paid_at,
        photo_path
      FROM temp_student 
      ${whereClause}
      ORDER BY submitted_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);
    
    // Transform data to match frontend expectations
    const transformedApplications = applications.map(app => ({
      id: app.id,
      candidateName: app.candidate_name,
      courseName: app.course_name,
      courseFee: app.course_fee,
      email: app.email,
      mobileNo: app.mobile_no,
      fatherName: app.father_name,
      nationality: app.nationality,
      religionCaste: app.religion_caste,
      dateOfBirth: app.date_of_birth,
      educationalQualification: app.educational_qualification,
      fullAddress: app.full_address,
      superintendentOfServer: app.superintendent_of_server,
      status: app.status,
      paymentStatus: app.payment_status,
      submittedAt: app.submitted_at,
      approvedAt: app.approved_at,
      rejectedAt: app.rejected_at,
      paidAt: app.paid_at,
      photoPath: app.photo_path
    }));
    
    res.json({
      success: true,
      applications: transformedApplications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

// Update application status
router.patch('/applications/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be pending, approved, or rejected' 
      });
    }
    
    const pool = getDbPool();
    
    // Update status and relevant timestamp
    let updateQuery = 'UPDATE temp_student SET status = ?';
    let queryParams = [status];
    
    if (status === 'approved') {
      updateQuery += ', approved_at = CURRENT_TIMESTAMP';
    } else if (status === 'rejected') {
      updateQuery += ', rejected_at = CURRENT_TIMESTAMP';
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(id);
    
    await pool.execute(updateQuery, queryParams);
    
    // Get updated application
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    const application = rows[0];
    
    // Transform application data for response
    const transformedApplication = {
      id: application.id,
      candidateName: application.candidate_name,
      courseName: application.course_name,
      courseFee: application.course_fee,
      email: application.email,
      mobileNo: application.mobile_no,
      fatherName: application.father_name,
      nationality: application.nationality,
      religionCaste: application.religion_caste,
      dateOfBirth: application.date_of_birth,
      educationalQualification: application.educational_qualification,
      fullAddress: application.full_address,
      superintendentOfServer: application.superintendent_of_server,
      status: application.status,
      paymentStatus: application.payment_status,
      submittedAt: application.submitted_at,
      approvedAt: application.approved_at,
      rejectedAt: application.rejected_at,
      paidAt: application.paid_at,
      photoPath: application.photo_path
    };
    
    // Send automated email based on status
    try {
      if (status === 'approved') {
        // Send payment request email for approved applications
        const emailResult = await sendPaymentRequestEmail(transformedApplication);
        console.log('Payment request email result:', emailResult);
      } else if (status === 'rejected') {
        // Send status update email for rejected applications
        const emailResult = await sendStatusUpdateEmail(transformedApplication, status);
        console.log('Status update email result:', emailResult);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails, just log it
    }
    
    res.json({ 
      success: true, 
      application: transformedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
  }
});

// Update payment status
router.patch('/applications/:id/payment', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment status. Must be paid or unpaid' 
      });
    }
    
    const pool = getDbPool();
    
    // Update payment status and timestamp
    let updateQuery = 'UPDATE temp_student SET payment_status = ?';
    let queryParams = [paymentStatus];
    
    if (paymentStatus === 'paid') {
      updateQuery += ', paid_at = CURRENT_TIMESTAMP';
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(id);
    
    await pool.execute(updateQuery, queryParams);
    
    // Get updated application
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    const application = rows[0];
    
    res.json({ 
      success: true, 
      application: {
        id: application.id,
        candidateName: application.candidate_name,
        courseName: application.course_name,
        courseFee: application.course_fee,
        email: application.email,
        mobileNo: application.mobile_no,
        fatherName: application.father_name,
        nationality: application.nationality,
        religionCaste: application.religion_caste,
        dateOfBirth: application.date_of_birth,
        educationalQualification: application.educational_qualification,
        fullAddress: application.full_address,
        superintendentOfServer: application.superintendent_of_server,
        status: application.status,
        paymentStatus: application.payment_status,
        submittedAt: application.submitted_at,
        approvedAt: application.approved_at,
        rejectedAt: application.rejected_at,
        paidAt: application.paid_at,
        photoPath: application.photo_path
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment status', error: error.message });
  }
});

// Get admin settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM admin_settings');
    
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin settings', error: error.message });
  }
});

// Update admin settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required' });
    }
    
    const pool = getDbPool();
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin settings', error: error.message });
  }
});

// Export applications to CSV
router.get('/applications/export', verifyToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const { status = 'all', payment = 'all' } = req.query;
    
    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    
    if (status !== 'all') {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (payment !== 'all') {
      whereConditions.push('payment_status = ?');
      queryParams.push(payment);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const [applications] = await pool.execute(`
      SELECT 
        id,
        candidate_name,
        course_name,
        course_fee,
        email,
        mobile_no,
        status,
        payment_status,
        submitted_at
      FROM temp_student 
      ${whereClause}
      ORDER BY submitted_at DESC
    `, queryParams);
    
    // Generate CSV
    const headers = ['ID', 'Name', 'Course', 'Email', 'Mobile', 'Status', 'Payment Status', 'Submitted Date'];
    const csvData = applications.map(app => [
      app.id,
      app.candidate_name,
      app.course_name,
      app.email,
      app.mobile_no,
      app.status,
      app.payment_status,
      new Date(app.submitted_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=applications_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ success: false, message: 'Failed to export applications', error: error.message });
  }
});

// Send payment request email
router.post('/applications/:id/send-payment-email', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDbPool();
    
    // Get application details
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    const application = rows[0];
    
    // Transform application data
    const transformedApplication = {
      id: application.id,
      candidateName: application.candidate_name,
      courseName: application.course_name,
      courseFee: application.course_fee,
      email: application.email,
      mobileNo: application.mobile_no,
      fatherName: application.father_name,
      nationality: application.nationality,
      religionCaste: application.religion_caste,
      dateOfBirth: application.date_of_birth,
      educationalQualification: application.educational_qualification,
      fullAddress: application.full_address,
      superintendentOfServer: application.superintendent_of_server,
      status: application.status,
      paymentStatus: application.payment_status,
      submittedAt: application.submitted_at,
      approvedAt: application.approved_at,
      rejectedAt: application.rejected_at,
      paidAt: application.paid_at,
      photoPath: application.photo_path
    };
    
    // Send payment request email
    const emailResult = await sendPaymentRequestEmail(transformedApplication);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'Payment request email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send payment request email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Error sending payment email:', error);
    res.status(500).json({ success: false, message: 'Failed to send payment email', error: error.message });
  }
});

export default router;
