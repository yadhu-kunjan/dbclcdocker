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
    
    // Ensure we always return an array, even if empty
    const applications = Array.isArray(rows) ? rows : [];
    
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
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as awaitingPayment,
        SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) as fullyEnrolled,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paidCount,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as totalRevenue
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

export default adminRouter;
