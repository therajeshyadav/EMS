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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ✅ Create HTTP server
//const server = http.createServer(app);

// ✅ Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "*", // frontend ka origin lagao (http://localhost:3000)
//     methods: ["GET", "POST"],
//   },
// });

// ✅ Store connected users by employeeId (Mongo _id)
//let onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log("⚡ New client connected:", socket.id);

//   // When employee registers
//   socket.on("register", (employeeId) => {
//     onlineUsers.set(employeeId.toString(), socket.id);
//     console.log(
//       `✅ Employee ${employeeId} registered with socket ${socket.id}`
//     );
//   });

//   socket.on("disconnect", () => {
//     for (let [employeeId, id] of onlineUsers.entries()) {
//       if (id === socket.id) {
//         onlineUsers.delete(employeeId);
//         console.log(`❌ Employee ${employeeId} disconnected`);
//       }
//     }
//   });
// });

// ✅ Function to send notification
// const sendNotification = (recipientId, notification) => {
//   if (recipientId === "all") {
//     io.emit("notification", notification);
//     console.log("📢 Broadcast notification sent");
//     return;
//   }

//   const socketId = onlineUsers.get(recipientId.toString());
//   if (socketId) {
//     io.to(socketId).emit("notification", notification);
//     console.log("📩 Notification sent to employee:", recipientId);
//   }
// };

// Export notification sender function
//module.exports = { server, sendNotification };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
