import { Router } from 'express';
import { getDbPool } from '../config/db.js';
import { verifyToken } from './auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ==================== DASHBOARD STATS ====================

router.get('/dashboard/stats', verifyToken, async (req, res) => {
  console.log('Academic dashboard stats request received');
  try {
    const dbConnection = getDbPool();
    const defaultStats = {
      assignments: {
        total_assignments: 0,
        graded_assignments: 0,
        pending_assignments: 0
      },
      attendance: {
        total_records: 0,
        present_count: 0,
        absent_count: 0
      },
      students: {
        total_students: 0,
        active_students: 0
      }
    };

    // Simple query to test database connection
    console.log('Testing database connection...');
    await dbConnection.execute('SELECT 1');
    console.log('Database connection successful');

    // Return default stats for now
    console.log('Sending default stats response');
    res.json({
      success: true,
      stats: defaultStats,
      message: 'Using default stats while database setup is in progress'
    });

  } catch (error) {
    console.error('Error in academic dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch academic statistics',
      details: error.message,
      stats: defaultStats
    });
  }
});

// Export the router
export default router;