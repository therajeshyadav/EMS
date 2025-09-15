// server-fixed.js - Fixed server without problematic dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");

const app = express();

// Connect DB
connectDB();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes - Load them individually to catch errors
try {
  console.log("Loading auth route...");
  app.use("/api/auth", require("./routes/auth"));
  console.log("✅ Auth route loaded");
} catch (error) {
  console.error("❌ Auth route failed:", error.message);
}

try {
  console.log("Loading employee route...");
  app.use("/api/employees", require("./routes/employeeRoute"));
  console.log("✅ Employee route loaded");
} catch (error) {
  console.error("❌ Employee route failed:", error.message);
}

try {
  console.log("Loading attendance route...");
  app.use("/api/attendance", require("./routes/attendance"));
  console.log("✅ Attendance route loaded");
} catch (error) {
  console.error("❌ Attendance route failed:", error.message);
}

try {
  console.log("Loading leaves route...");
  app.use("/api/leaves", require("./routes/leave"));
  console.log("✅ Leaves route loaded");
} catch (error) {
  console.error("❌ Leaves route failed:", error.message);
}

try {
  console.log("Loading tasks route...");
  app.use("/api/tasks", require("./routes/task"));
  console.log("✅ Tasks route loaded");
} catch (error) {
  console.error("❌ Tasks route failed:", error.message);
}

try {
  console.log("Loading payroll route...");
  app.use("/api/payroll", require("./routes/PayRollRoute"));
  console.log("✅ Payroll route loaded");
} catch (error) {
  console.error("❌ Payroll route failed:", error.message);
}

try {
  console.log("Loading departments route...");
  app.use("/api/departments", require("./routes/DepartmentRoute"));
  console.log("✅ Departments route loaded");
} catch (error) {
  console.error("❌ Departments route failed:", error.message);
}

try {
  console.log("Loading positions route...");
  app.use("/api/positions", require("./routes/PositionRoute"));
  console.log("✅ Positions route loaded");
} catch (error) {
  console.error("❌ Positions route failed:", error.message);
}

try {
  console.log("Loading reports route...");
  app.use("/api/reports", require("./routes/reportsRoute"));
  console.log("✅ Reports route loaded");
} catch (error) {
  console.error("❌ Reports route failed:", error.message);
}

// Load notifications route last (it has circular dependency issues)
try {
  console.log("Loading notifications route...");
  app.use("/api/notifications", require("./routes/Notification"));
  console.log("✅ Notifications route loaded");
} catch (error) {
  console.error("❌ Notifications route failed:", error.message);
}

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const server = http.createServer(app);

// Initialize socket if available (optional)
try {
  const { initSocket } = require("./socket");
  initSocket(server);
  console.log("✅ Socket.IO initialized");
} catch (error) {
  console.log("⚠️ Socket.IO not available:", error.message);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;