require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

console.log('🚀 Starting EMS Server...');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Missing');

const app = express();

// Environment-based CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean)
  : [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EMS Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Load routes
const routes = [
  { path: "/api/auth", file: "./routes/auth", name: "Authentication" },
  { path: "/api/employees", file: "./routes/employeeRoute", name: "Employees" },
  { path: "/api/attendance", file: "./routes/attendance", name: "Attendance" },
  { path: "/api/leaves", file: "./routes/leave", name: "Leaves" },
  { path: "/api/tasks", file: "./routes/task", name: "Tasks" },
  { path: "/api/payroll", file: "./routes/PayRollRoute", name: "Payroll" },
  { path: "/api/notifications", file: "./routes/Notification", name: "Notifications" },
  { path: "/api/reports", file: "./routes/reportsRoute", name: "Reports" }
];

console.log('🔄 Loading routes...');
routes.forEach(route => {
  try {
    console.log(`📂 Loading: ${route.file}`);
    const router = require(route.file);
    app.use(route.path, router);
    console.log(`✅ ${route.name} routes loaded`);
  } catch (error) {
    console.log(`⚠️ ${route.name} routes failed:`, error.message);

    // Create fallback route
    app.use(route.path, (req, res) => {
      res.status(503).json({
        success: false,
        message: `${route.name} service temporarily unavailable`
      });
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Create server
const server = http.createServer(app);

// Initialize Socket.IO
try {
  const { initSocket } = require("./socket");
  initSocket(server);
  console.log("✅ Socket.IO initialized");
} catch (error) {
  console.log("⚠️ Socket.IO failed:", error.message);
}

// Start server
const PORT = process.env.PORT || 5003;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('✅ Server started successfully!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Kill existing process: taskkill /f /im node.exe');
  } else {
    console.error('❌ Server error:', err);
  }
});

module.exports = app;