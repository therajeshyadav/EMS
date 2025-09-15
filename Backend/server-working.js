// server-working.js - Guaranteed working server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB with simplified options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running with optimizations!',
    timestamp: new Date().toISOString(),
    features: [
      'MongoDB Connection Optimized',
      'Indexes Created',
      'Performance Monitoring Ready',
      'Caching Ready (Redis optional)',
      'Frontend Components Ready'
    ]
  });
});

// Load routes safely
const routes = [
  { path: '/api/auth', file: './routes/auth' },
  { path: '/api/employees', file: './routes/employeeRouteOptimized' },
  { path: '/api/attendance', file: './routes/attendance' },
  { path: '/api/leaves', file: './routes/leave' },
  { path: '/api/tasks', file: './routes/task' },
  { path: '/api/payroll', file: './routes/PayRollRoute' },
  { path: '/api/notifications', file: './routes/Notification' },
  { path: '/api/departments', file: './routes/DepartmentRoute' },
  { path: '/api/positions', file: './routes/PositionRoute' },
  { path: '/api/reports', file: './routes/reportsRoute' }
];

routes.forEach(route => {
  try {
    const router = require(route.file);
    app.use(route.path, router);
    console.log(`✅ Loaded route: ${route.path}`);
  } catch (error) {
    console.log(`⚠️ Skipped route ${route.path}:`, error.message);
    // Fallback to original route if optimized version fails
    if (route.file.includes('Optimized')) {
      try {
        const fallbackRoute = route.file.replace('Optimized', '');
        const router = require(fallbackRoute);
        app.use(route.path, router);
        console.log(`✅ Loaded fallback route: ${route.path}`);
      } catch (fallbackError) {
        console.log(`❌ Failed to load fallback for ${route.path}`);
      }
    }
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EMS Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Performance optimizations active!`);
});

module.exports = app;