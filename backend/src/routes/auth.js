import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDbPool } from '../config/db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body || {};
  console.log('=== LOGIN REQUEST ===');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('Role:', role);
  console.log('Request body:', req.body);
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  try {
    const pool = getDbPool();
    
    // Query the users table and join roles to get role information
    // The project's SQL uses a `users` table (id, username, password, role_id)
    // and a `roles` table (role_id, role). Use those instead of a non-existent
    // `login` table.
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.password, u.role_id, r.role 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.username = ?`,
      [username]
    );

    const user = rows?.[0];
    console.log('=== DATABASE QUERY RESULT ===');
    console.log('Rows found:', rows.length);
    console.log('User found:', !!user);
    console.log('User data:', user);
    
    if (!user) {
      console.log('❌ No user found with username:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
  // Since passwords in the imported SQL are plain text, compare directly.
  // In production, store hashed passwords and use bcrypt.compare.
  const passwordOk = (password === user.password);
    console.log('=== PASSWORD CHECK ===');
    console.log('Provided password:', password);
    console.log('Database password:', user.password);
    console.log('Password match:', passwordOk);
    
    if (!passwordOk) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Convert role to lowercase for consistency
    const normalizedRole = user.role.toLowerCase();
    const normalizedRequestRole = role ? role.toLowerCase() : null;
    
    console.log('=== ROLE COMPARISON ===');
    console.log('Database role:', user.role);
    console.log('Normalized role:', normalizedRole);
    console.log('Request role:', role);
    console.log('Normalized request role:', normalizedRequestRole);
    
    // If role is specified in request, verify it matches the user's role
    if (normalizedRequestRole && normalizedRequestRole !== normalizedRole) {
      console.log('❌ Role mismatch - rejecting login');
      return res.status(401).json({ success: false, message: 'Invalid role for this user' });
    }
    
    console.log('✅ Role validation passed');
    
    // Use the users.id both as id and userId (the SQL uses string ids like 'ITHA01')
    const payload = { 
      id: user.id, 
      userId: user.id,
      role: normalizedRole, 
      username: user.username 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const responseData = {
      success: true,
      user: { 
        id: String(user.id), 
        userId: String(user.id),
        username: user.username, 
        role: normalizedRole,
        name: user.username, // Use username as name since no display name column
        email: `${user.username}@dbclc.com` // Generated placeholder email
      },
      token,
    };
    
    console.log('=== LOGIN SUCCESS ===');
    console.log('Response data:', responseData);
    
    return res.json(responseData);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Middleware to verify JWT token and get user info
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = getDbPool();
    
    // Get user details from users and roles tables
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, r.role 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    req.user = {
      id: String(user.id),
      userId: String(user.id),
      username: user.username,
      role: user.role.toLowerCase(),
      name: user.username, // Use username as name since name column doesn't exist
      email: `${user.username}@dbclc.com` // Generate email since email column doesn't exist
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/me', verifyToken, (req, res) => {
  return res.json({ success: true, user: req.user });
});

export default router;

