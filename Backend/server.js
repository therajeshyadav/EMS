// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
//const { Server } = require("socket.io");
const { initSocket } = require("./socket");

const app = express();

// Connect DB
connectDB();

// Initialize mock cache service (no Redis required)
const cacheService = require("./Services/mockCacheService");
console.log('✅ Using mock cache service (no Redis required)');

// CORS configuration for both local and deployed frontend
const corsOptions = {
  origin: [
    "http://localhost:3000",           // Local development
    "http://localhost:5173",           // Vite dev server
    "https://ems-kohl-alpha.vercel.app" // Deployed frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase JSON limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employeeRoute"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", require("./routes/leave"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/payroll", require("./routes/PayRollRoute"));
app.use("/api/notifications", require("./routes/Notification"));
app.use("/api/departments", require("./routes/DepartmentRoute"));
app.use("/api/positions", require("./routes/PositionRoute"));
app.use("/api/reports", require("./routes/reportsRoute"));

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
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

// ✅ Init socket
initSocket(server);





// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
