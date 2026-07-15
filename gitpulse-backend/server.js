const express = require('express');
const cors = require('cors');
const { connect } = require('./services/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Analyze Router
const analyzeRoute = require('./routes/analyze');
app.use('/api/analyze', analyzeRoute);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Attempt database connection on startup
    await connect();
    
    app.listen(PORT, () => {
      console.log(`GitPulse Backend server is running on port ${PORT}`);
    });
  } catch (dbError) {
    console.error('Failed to start server due to database connection issue:', dbError.message);
    console.log('Starting server in fallback mode (no cache database)...');
    
    // In fallback mode we can still run, queries will just fail cache lookup/save
    app.listen(PORT, () => {
      console.log(`GitPulse Backend (Fallback Mode) is running on port ${PORT}`);
    });
  }
}

startServer();
