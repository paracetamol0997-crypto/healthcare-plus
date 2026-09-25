const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wellness', wellnessRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Health Companion AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve Frontend Static Files from client/dist (Single unified application!)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all client routes (e.g. /dashboard, /mental-health, /chat, etc.)
  app.get('*', (req, res) => {
    // If it's an API route that didn't match, return 404 json
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 24px; border-radius: 16px; background: #eaf4ff; color: #1e3a8a;">
        <h1 style="margin-top: 0;">🌿 Health Companion AI</h1>
        <p>Please build the frontend using <code>npm run build</code> inside the client directory to view the complete unified application here.</p>
      </div>
    `);
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🌿 Health Companion AI - Fully Unified Web Application`);
  console.log(`   ➜ Open Complete Website: http://localhost:${PORT}`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Single Port: Frontend UI + Backend APIs + Database + AI`);
  console.log(`=================================================\n`);
});

module.exports = app;
