const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// CORS configuration - allow requests from Angular frontend
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Body parser middleware for JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Customer Portal Middleware is running',
    timestamp: new Date().toISOString()
  });
});

// Import middleware
const authenticateToken = require('./middleware/auth.middleware');
const requireRole = require('./middleware/rbac.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const financialRoutes = require('./routes/financial.routes');
const profileRoutes = require('./routes/profile.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', financialRoutes);
app.use('/api', profileRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working correctly',
    sapConfig: {
      baseUrl: process.env.SAP_BASE_URL,
      client: process.env.SAP_CLIENT,
      userConfigured: !!process.env.SAP_USER
    }
  });
});

// Test endpoint for JWT token generation (for testing purposes)
app.post('/api/test/generate-token', (req, res) => {
  const jwt = require('jsonwebtoken');
  const { username, role, userId } = req.body;
  
  if (!username || !role || !userId) {
    return res.status(400).json({
      success: false,
      error: 'username, role, and userId are required'
    });
  }
  
  const token = jwt.sign(
    { 
      USER_ID: userId,
      username: username,
      role: role
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  res.json({
    success: true,
    token: token,
    message: 'Test token generated successfully'
  });
});

// Test protected endpoint (requires authentication)
app.get('/api/test/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'You have access to this protected route',
    user: req.user
  });
});

// Test admin-only endpoint (requires authentication + Admin role)
app.get('/api/test/admin', authenticateToken, requireRole(['Admin']), (req, res) => {
  res.json({
    success: true,
    message: 'You have admin access',
    user: req.user
  });
});

// Test user or admin endpoint (requires authentication + User or Admin role)
app.get('/api/test/user', authenticateToken, requireRole(['User', 'Admin']), (req, res) => {
  res.json({
    success: true,
    message: 'You have user or admin access',
    user: req.user
  });
});

// SOAP connectivity test endpoint
app.get('/api/test/soap', async (req, res) => {
  try {
    const soapClient = require('./services/soap-client.service');
    
    // Test SOAP client creation (without calling a method)
    const testService = 'ZRFC_CUSTOMER_PROFILE_863'; // Use a simple service for testing
    
    res.json({
      success: true,
      message: 'SOAP client service is loaded',
      config: {
        baseUrl: process.env.SAP_BASE_URL,
        client: process.env.SAP_CLIENT
      },
      note: 'To test actual SOAP call, use POST /api/auth/login with credentials'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// HTTPS server configuration
const PORT = process.env.PORT || 3443;

// Check if SSL certificates exist
const keyPath = './server.key';
const certPath = './server.cert';

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
    console.log(`Health check: https://localhost:${PORT}/api/health`);
  });
} else {
  console.error('SSL certificates not found. Please generate them first:');
  console.error('openssl genrsa -out server.key 2048');
  console.error('openssl req -new -key server.key -out server.csr');
  console.error('openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert');
  process.exit(1);
}
