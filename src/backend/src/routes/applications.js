import { Router } from 'express';
import { getDbPool } from '../config/db.js';

const router = Router();

router.post('/', async (req, res) => {
  const a = req.body || {};
  try {
    const pool = getDbPool();
    const [result] = await pool.execute(
      `INSERT INTO applications (candidate_name, full_address, course_name, date_of_birth, father_name, religion_caste, nationality, educational_qualification, email, mobile_no, superintendent_of_server)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [a.candidateName, a.fullAddress, a.courseName, a.dateOfBirth, a.fatherName, a.religionCaste, a.nationality, a.educationalQualification, a.email, a.mobileNo, a.superintendentOfServer]
    );
    const id = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [id]);
    return res.status(201).json({ success: true, application: { ...rows[0], id: String(id) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit application', error: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute('SELECT * FROM applications ORDER BY submitted_at DESC');
    return res.json({ success: true, applications: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch applications', error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  try {
    const pool = getDbPool();
    await pool.execute('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [id]);
    return res.json({ success: true, application: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application', error: err.message });
  }
});

export default router;

