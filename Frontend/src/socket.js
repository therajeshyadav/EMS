// src/socket.js
import { io } from "socket.io-client";
import config from "./config/config.js";

// Validate socket URL exists
if (!config.SOCKET_URL) {
  console.error('❌ VITE_SOCKET_URL environment variable is not set!');
}

const socket = io(config.SOCKET_URL, {
  withCredentials: true,
  transports: config.SOCKET_TRANSPORTS,
  timeout: config.SOCKET_TIMEOUT,
  forceNew: true,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5
});

// Add connection event listeners for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  console.log("🔗 Connected to:", config.SOCKET_URL);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("🔥 Socket connection error:", error.message);
  console.error("🔗 Attempted connection to:", config.SOCKET_URL);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("🔄 Socket reconnection failed:", error.message);
});

export default socket;
