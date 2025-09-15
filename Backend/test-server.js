// test-server.js - Minimal server for debugging
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString()
  });
});

// Test each route individually
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Test endpoint: http://localhost:${PORT}/api/test`);
});