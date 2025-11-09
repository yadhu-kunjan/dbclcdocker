import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDbPool } from '../config/db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  try {
    const pool = getDbPool();
    
    // Determine which table to query based on role
    let tableName = 'login'; // Default to student login table
    if (role === 'faculty') {
      // Since faculty table doesn't have login credentials, we'll use admin_login for now
      // You can create a separate faculty_login table later
      tableName = 'admin_login';
    } else if (role === 'admin') {
      tableName = 'admin_login';
    }
    
    const [rows] = await pool.execute(
      `SELECT id, username, password FROM ${tableName} WHERE username = ?`,
      [username]
    );
    const user = rows?.[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Since passwords in your database are stored in plain text, we'll do direct comparison
    // In production, you should hash passwords with bcrypt
    const passwordOk = (password === user.password);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Use the role from the request or determine from table
    const userRole = role || (tableName === 'faculty' ? 'faculty' : tableName === 'admin_login' ? 'admin' : 'student');
    
    const payload = { id: user.id, role: userRole, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      user: { 
        id: String(user.id), 
        username: user.username, 
        role: userRole 
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', (req, res) => {
  return res.json({ success: true, user: null });
});

export default router;

