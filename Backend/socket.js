// socket.js
let io;
let onlineUsers = new Map();

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [
            process.env.FRONTEND_URL,
            "https://ems-dsnx.vercel.app"
          ].filter(Boolean)
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
          ],
      credentials: true,
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("register", (employeeId) => {
      onlineUsers.set(employeeId.toString(), socket.id);
      console.log(`✅ Employee ${employeeId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (let [employeeId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(employeeId);
          console.log(`❌ Employee ${employeeId} disconnected`);
        }
      }
    });
  });
}

function sendNotification(recipientId, notification) {
  if (!io) return;

  if (recipientId === "all") {
    io.emit("notification", notification);
    console.log("📢 Broadcast notification sent");
    return;
  }

  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit("notification", notification);
    console.log("📩 Notification sent to employee:", recipientId);
  }
}

// socket.js (backend)
function sendTaskUpdate(recipientId, task) {
  if (!io) return;

  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit("taskUpdate", task);
    console.log("📩 Task sent to employee:", recipientId);
  } else {
    console.log("⚠️ Employee not online, task will sync on next fetch");
  }
}


module.exports = { initSocket, sendNotification , sendTaskUpdate};
