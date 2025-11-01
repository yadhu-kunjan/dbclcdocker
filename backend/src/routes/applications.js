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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination called for file:', file.originalname);
    console.log('Upload path:', uploadsDir);
    cb(null, uploadsDir) // Use absolute path
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'student-photo-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename generated:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 // 500KB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Route for applications without photo upload
router.post('/', async (req, res) => {
  const a = req.body || {};
  try {
    console.log('POST /applications called');
    console.log('Request body snippet:', {
      candidateName: a.candidateName,
      email: a.email,
      mobileNo: a.mobileNo,
      courseName: a.courseName
    });
    const pool = getDbPool();
    
    // First, try to add the photo_path column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN photo_path VARCHAR(255) NULL');
      console.log('Added photo_path column to temp_student table');
    } catch (alterError) {
      // Column might already exist, that's okay
      console.log('photo_path column already exists or error adding it:', alterError.message);
    }
    
    const [result] = await pool.execute(
      `INSERT INTO temp_student (
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
        course_fee,
        status,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        a.candidateName,
        a.fullAddress,
        a.courseName,
        a.dateOfBirth,
        a.fatherName,
        a.religionCaste,
        a.nationality,
        a.educationalQualification,
        a.email,
        a.mobileNo,
        a.superintendentOfServer,
        null, // No photo for this route
        a.courseFee || '₹50,000', // Default course fee
        'pending', // Default status
        'unpaid' // Default payment status
      ]
    );
    const id = result.insertId;
  console.log('New application inserted with id:', id);
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    return res.status(201).json({ success: true, application: { ...rows[0], id: String(id) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit application', error: err.message });
  }
});

// Route for applications with photo upload
router.post('/with-photo', (req, res, next) => {
  console.log('=== PHOTO UPLOAD ENDPOINT CALLED ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.log('Multer error:', err);
      return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  const a = req.body || {};
  const photoFile = req.file;
  
  console.log('=== PHOTO UPLOAD DEBUG ===');
  console.log('Request body:', a);
  console.log('Photo file:', photoFile);
  console.log('Request headers:', req.headers);
  console.log('Multer file details:', photoFile ? {
    fieldname: photoFile.fieldname,
    originalname: photoFile.originalname,
    encoding: photoFile.encoding,
    mimetype: photoFile.mimetype,
    destination: photoFile.destination,
    filename: photoFile.filename,
    path: photoFile.path,
    size: photoFile.size
  } : 'No file uploaded');
  
  try {
    const pool = getDbPool();
    
    // Get photo path if uploaded
    const photoPath = photoFile ? photoFile.filename : null;
    console.log('Photo path:', photoPath);
    
    // First, try to add the photo_path column if it doesn't exist
    try {
      await pool.execute('ALTER TABLE temp_student ADD COLUMN photo_path VARCHAR(255) NULL');
      console.log('Added photo_path column to temp_student table');
    } catch (alterError) {
      // Column might already exist, that's okay
      console.log('photo_path column already exists or error adding it:', alterError.message);
    }
    
    // Now insert with photo_path
    const [result] = await pool.execute(
      `INSERT INTO temp_student (
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
        course_fee,
        status,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        a.candidateName,
        a.fullAddress,
        a.courseName,
        a.dateOfBirth,
        a.fatherName,
        a.religionCaste,
        a.nationality,
        a.educationalQualification,
        a.email,
        a.mobileNo,
        a.superintendentOfServer,
        photoPath,
        a.courseFee || '₹50,000', // Default course fee
        'pending', // Default status
        'unpaid' // Default payment status
      ]
    );
    const id = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM temp_student WHERE id = ?', [id]);
    return res.status(201).json({ success: true, application: { ...rows[0], id: String(id) } });
  } catch (err) {
    // If there was an error and a file was uploaded, delete it
    if (photoFile) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(photoFile.path);
      } catch (deleteErr) {
        console.error('Error deleting uploaded file:', deleteErr);
      }
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

// Route to serve uploaded images
router.get('/photo/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  console.log('Serving photo:', filename);
  console.log('File path:', filePath);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('Photo not found:', filePath);
    res.status(404).json({ success: false, message: 'Photo not found' });
  }
});

export default router;

