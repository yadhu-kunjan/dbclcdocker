import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDbPool } from '../config/db.js';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Multer storage: keep uploads in uploads/ with field-based prefixes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'photo' ? 'student-photo-' : 'student-cert-';
    cb(null, `${prefix}${uniqueSuffix}${ext}`);
  }
});

// Use a generous global limit and validate per-file after upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB global cap
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Photo must be an image (jpg/png/gif)'));
      }
    } else if (file.fieldname === 'certificates') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Certificates must be a PDF'));
      }
    }
    cb(null, true);
  }
});

// POST / - accept multipart/form-data (photo + certificates optional) or regular form
router.post('/', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('=== POST /applications DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Form data keys:', Object.keys(req.body));
    
    const pool = getDbPool();
    const form = req.body || {};
    
    // Debug form data
    console.log('Parsed form data:', {
      candidateName: form.candidateName,
      fullAddress: form.fullAddress,
      selectedCourses: form.selectedCourses,
      email: form.email
    });

    // Normalize selectedCourses: could be JSON string or array or single value
    let courseName = null;
    if (form.selectedCourses) {
      try {
        const parsed = typeof form.selectedCourses === 'string' ? JSON.parse(form.selectedCourses) : form.selectedCourses;
        if (Array.isArray(parsed)) courseName = parsed.join(', ');
        else courseName = String(parsed);
      } catch (e) {
        courseName = Array.isArray(form.selectedCourses) ? form.selectedCourses.join(', ') : String(form.selectedCourses);
      }
    } else if (form.courseName) {
      courseName = form.courseName;
    }

    // Files (if any)
    const photoFile = req.files?.photo?.[0] || null;
    const certFile = req.files?.certificates?.[0] || null;

    // Validate per-file constraints
    if (photoFile && photoFile.size > 500 * 1024) {
      // remove files
      try { fs.unlinkSync(photoFile.path); } catch (err) { /* ignore */ }
      return res.status(400).json({ success: false, message: 'Photo must be <= 500KB' });
    }
    if (certFile && certFile.size > 5 * 1024 * 1024) {
      try { fs.unlinkSync(certFile.path); } catch (err) { /* ignore */ }
      return res.status(400).json({ success: false, message: 'Certificates PDF must be <= 5MB' });
    }

    // Map fields to DB columns - fix the field names
    const values = [
      form.candidateName || null,
      form.fullAddress || null,
      courseName || null,
      form.dateOfBirth || null,
      form.fatherName || null,
      form.religion || null,
      form.caste || null,
      form.nationality || null,
      form.education || form.educationalQualification || null, // Try both field names
      form.email || null,
      form.mobileNo || null,
      form.superintendantOfServer || form.superintendentOfServer || null,
      photoFile ? photoFile.filename : null,
      certFile ? certFile.filename : null
    ];

    console.log('Values to insert:', values);

    // Try inserting using the user's requested column layout first
    const preferredInsert = `
      INSERT INTO temp_student (
        candidate_name,
        full_address,
        course_name,
        date_of_birth,
        father_name,
        religion,
        caste,
        nationality,
        educational_qualification,
        email,
        mobile_no,
        superintendant_of_server,
        photo_path,
        certificate_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
      const [result] = await pool.execute(preferredInsert, values);
      const insertedId = result.insertId;
      const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [insertedId]);
      return res.status(201).json({ success: true, application: rows[0] });
    } catch (err) {
      console.warn('Preferred insert failed, attempting fallback insert:', err.message);

      // Fallback: many DBs in this project use religion_caste and superintendent_of_server
      // Combine religion and caste into religion_caste
      const religionCaste = [form.religion, form.caste].filter(Boolean).join(' | ');

      // Ensure certificate_path column exists (attempt add, ignore errors)
      try {
        await pool.execute('ALTER TABLE temp_student ADD COLUMN certificate_path VARCHAR(500) NULL');
        console.log('Added certificate_path column to temp_student');
      } catch (alterErr) {
        // ignore if exists
      }

      const fallbackValues = [
        form.candidateName || null,
        form.fullAddress || null,
        courseName || null,
        form.dateOfBirth || null,
        form.fatherName || null,
        religionCaste || null,
        form.nationality || null,
        form.educationalQualification || form.education || null,
        form.email || null,
        form.mobileNo || null,
        form.superintendentOfServer || form.superintendantOfServer || null,
        photoFile ? photoFile.filename : null,
        certFile ? certFile.filename : null
      ];

      const fallbackInsert = `
        INSERT INTO temp_student (
          candidate_name,
          full_address,
          course_name,
          date_of_birth,
          father_name,
          religion_caste,
          nationality,
          educational_qualification,
          email,
          mobile_no,
          superintendent_of_server,
          photo_path,
          certificate_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [result2] = await pool.execute(fallbackInsert, fallbackValues);
      const insertedId2 = result2.insertId;
      const [rows2] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [insertedId2]);
      return res.status(201).json({ success: true, application: rows2[0] });
    }
    const insertedId = result.insertId;

    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [insertedId]);
    return res.status(201).json({ success: true, application: rows[0] });
  } catch (err) {
    console.error('Error in /applications:', err);
    // Cleanup any uploaded files when error occurs
    if (req.files) {
      Object.values(req.files).flat().forEach(f => {
        try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit application', error: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute('SELECT * FROM temp_student ORDER BY id DESC');
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
    await pool.execute('UPDATE temp_student SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    return res.json({ success: true, application: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application', error: err.message });
  }
});

// Serve uploaded files by filename
router.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).json({ success: false, message: 'File not found' });
});

export default router;

