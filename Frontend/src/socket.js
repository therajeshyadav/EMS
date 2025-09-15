// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5003", {
  withCredentials: true,
  transports: ["websocket"], // fast connection
});

export default socket;
