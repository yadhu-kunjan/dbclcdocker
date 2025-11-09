// server.js
// server.js - AFTER
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import { verifyDbConnection } from './config/db.js';

// Load environment variables
dotenv.config({ path: './authconfig.env' });

const app = express();
const port = 3001; // A port for your backend server

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Verify database connection
verifyDbConnection()
  .then(() => {
    console.log('Successfully connected to the database.');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Create a simple API endpoint
// This endpoint will fetch all users from a 'users' table
app.get('/api/users', async (req, res) => {
  try {
    const { getDbPool } = await import('./config/db.js');
    const pool = getDbPool();
    const [results] = await pool.execute("SELECT * FROM login");
    res.json(results); // Send the results back as JSON
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Error fetching data from database' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});