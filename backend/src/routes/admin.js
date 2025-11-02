import { Router } from "express";
import { getDbPool } from "../config/db.js";
import { verifyToken } from "./auth.js";

const adminRouter = Router();
const dbConnection = getDbPool();

adminRouter.get("/applications", verifyToken, async (req, res) => {
  try {
    // Check if table exists first
    const [tables] = await dbConnection.execute(
      "SHOW TABLES LIKE 'temp_student'"
    );
    
    if (tables.length === 0) {
      // Table doesn't exist, return empty result
      return res.json({ 
        success: true, 
        applications: [],
        message: 'No applications table found'
      });
    }

    const [rows] = await dbConnection.execute(
      "SELECT * FROM temp_student ORDER BY created_at DESC"
    );
    
    // Transform database snake_case to camelCase for frontend
    const applications = (Array.isArray(rows) ? rows : []).map(app => ({
      id: app.id?.toString() || '',
      candidateName: app.candidate_name || '',
      courseName: app.course_name || '',
      courseFee: app.course_fee || '₹0',
      email: app.email || '',
      mobileNo: app.mobile_no || '',
      fatherName: app.father_name || '',
      nationality: app.nationality || '',
      religionCaste: app.religion_caste || '',
      dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth).toISOString().split('T')[0] : '',
      educationalQualification: app.educational_qualification || '',
      fullAddress: app.full_address || '',
      superintendentOfServer: app.superintendent_of_server || '',
      status: app.status || 'pending',
      paymentStatus: app.payment_status || 'unpaid',
      submittedAt: app.submitted_at || app.created_at || null,
      approvedAt: app.approved_at || null,
      rejectedAt: app.rejected_at || null,
      paidAt: app.paid_at || null,
      photoPath: app.photo_path || null
    }));
    
    res.json({ 
      success: true, 
      applications,
      count: applications.length 
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications',
      details: error.message,
      applications: [] // Always provide applications array
    });
  }
});

adminRouter.get("/stats", verifyToken, async (req, res) => {
  try {
    // Check if table exists
    const [tables] = await dbConnection.execute(
      "SHOW TABLES LIKE 'temp_student'"
    );

    // Default stats object
    const defaultStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      awaitingPayment: 0,
      fullyEnrolled: 0,
      paidCount: 0,
      totalRevenue: 0
    };

    if (tables.length === 0) {
      // Table doesn't exist, return default stats
      return res.json({ 
        success: true, 
        stats: defaultStats,
        message: 'No applications table found'
      });
    }

    const [applications] = await dbConnection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'approved' AND payment_status = 'unpaid' THEN 1 ELSE 0 END) as awaitingPayment,
        SUM(CASE WHEN status = 'approved' AND payment_status = 'paid' THEN 1 ELSE 0 END) as fullyEnrolled,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paidCount,
        0 as totalRevenue
      FROM temp_student`
    );
    
    // Transform the stats and ensure all values are numbers
    const stats = {
      pending: parseInt(applications[0].pending || 0),
      approved: parseInt(applications[0].approved || 0),
      rejected: parseInt(applications[0].rejected || 0),
      awaitingPayment: parseInt(applications[0].awaitingPayment || 0),
      fullyEnrolled: parseInt(applications[0].fullyEnrolled || 0),
      totalRevenue: parseFloat(applications[0].totalRevenue || 0),
      paidCount: parseInt(applications[0].paidCount || 0)
    };
    
    res.json({ 
      success: true, 
      stats,
      raw: applications[0] // Include raw data for debugging
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics',
      details: error.message,
      stats: defaultStats // Return default stats even on error
    });
  }
});

// Get admin settings
adminRouter.get("/settings", verifyToken, async (req, res) => {
  try {
    const settings = {
      institution_name: process.env.INSTITUTION_NAME || 'DBCLC Institute of Theology',
      admin_name: 'Dr. Sarah Johnson',
      admin_role: 'Super Administrator',
      admin_email: 'sarah.johnson@dbclc.edu'
    };
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (approve/reject)
adminRouter.patch('/applications/:id/status', verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    // Basic validation
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Update application status and timestamps
    let updateQuery = '';
    let params = [];

    if (status === 'approved') {
      updateQuery = `UPDATE temp_student SET status = ?, approved_at = NOW(), payment_status = COALESCE(payment_status, 'unpaid') WHERE id = ?`;
      params = [status, applicationId];
    } else if (status === 'rejected') {
      updateQuery = `UPDATE temp_student SET status = ?, rejected_at = NOW() WHERE id = ?`;
      params = [status, applicationId];
    } else {
      updateQuery = `UPDATE temp_student SET status = ? WHERE id = ?`;
      params = [status, applicationId];
    }

    const [result] = await dbConnection.execute(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Fetch updated application record
    const [rows] = await dbConnection.execute('SELECT * FROM temp_student WHERE id = ?', [applicationId]);
    const appRow = rows[0];

    const application = {
      id: appRow.id?.toString() || '',
      candidateName: appRow.candidate_name || '',
      courseName: appRow.course_name || '',
      courseFee: appRow.course_fee || '₹0',
      email: appRow.email || '',
      mobileNo: appRow.mobile_no || '',
      status: appRow.status || 'pending',
      paymentStatus: appRow.payment_status || 'unpaid'
    };

    res.json({ success: true, message: 'Status updated', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

export default adminRouter;

