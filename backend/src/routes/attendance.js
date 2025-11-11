import { Router } from 'express';
import { getDbPool } from '../config/db.js';
import { verifyToken } from './auth.js';

const router = Router();

// ==================== ATTENDANCE MANAGEMENT ====================

// GET /api/attendance - Get all attendance records (Admin/Faculty only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or faculty
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const pool = getDbPool();
    const { studentId, courseId, startDate, endDate } = req.query;

    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];

    if (studentId) {
      query += ' AND student_id = ?';
      params.push(studentId);
    }

    if (startDate) {
      query += ' AND attendance_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND attendance_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY attendance_date DESC';

    const [records] = await pool.execute(query, params);

    res.json({
      success: true,
      records,
      count: records.length
    });
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: err.message
    });
  }
});

// POST /api/attendance - Mark attendance for a student
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or faculty
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { studentId, attendanceDate, status, remarks } = req.body;

    if (!studentId || !attendanceDate || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, attendanceDate, status'
      });
    }

    const pool = getDbPool();

    // Insert or update attendance record
    const [result] = await pool.execute(
      `INSERT INTO attendance (student_id, attendance_date, status, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, remarks = ?`,
      [studentId, attendanceDate, status, remarks || null, status, remarks || null]
    );

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      recordId: result.insertId
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: err.message
    });
  }
});

// POST /api/attendance/bulk - Mark attendance for multiple students
router.post('/bulk', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or faculty
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { attendanceDate, records } = req.body;

    if (!attendanceDate || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: attendanceDate, records (array)'
      });
    }

    const pool = getDbPool();
    let successCount = 0;
    let errorCount = 0;

    // Process each attendance record
    for (const record of records) {
      try {
        const { studentId, status, remarks } = record;

        if (!studentId || !status) {
          errorCount++;
          continue;
        }

        await pool.execute(
          `INSERT INTO attendance (student_id, attendance_date, status, remarks)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = ?, remarks = ?`,
          [studentId, attendanceDate, status, remarks || null, status, remarks || null]
        );

        successCount++;
      } catch (err) {
        console.error('Error marking attendance for student:', err);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk attendance marked: ${successCount} successful, ${errorCount} failed`,
      successCount,
      errorCount
    });
  } catch (err) {
    console.error('Error in bulk attendance marking:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bulk attendance',
      error: err.message
    });
  }
});

// GET /api/attendance/:id - Get specific attendance record
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDbPool();

    const [records] = await pool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      record: records[0]
    });
  } catch (err) {
    console.error('Error fetching attendance record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance record',
      error: err.message
    });
  }
});

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or faculty
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: status'
      });
    }

    const pool = getDbPool();

    const [result] = await pool.execute(
      'UPDATE attendance SET status = ?, remarks = ? WHERE id = ?',
      [status, remarks || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record updated successfully'
    });
  } catch (err) {
    console.error('Error updating attendance record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: err.message
    });
  }
});

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or faculty
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const pool = getDbPool();

    const [result] = await pool.execute(
      'DELETE FROM attendance WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting attendance record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: err.message
    });
  }
});

// GET /api/attendance/student/:studentId - Get attendance for a specific student
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const pool = getDbPool();

    const [records] = await pool.execute(
      `SELECT * FROM attendance 
       WHERE student_id = ? 
       ORDER BY attendance_date DESC`,
      [studentId]
    );

    // Calculate statistics
    const totalClasses = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const excusedCount = records.filter(r => r.status === 'excused').length;
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    res.json({
      success: true,
      studentId,
      statistics: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        percentage
      },
      records
    });
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance',
      error: err.message
    });
  }
});

export default router;
