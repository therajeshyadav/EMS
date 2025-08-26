// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://ems-48ug.onrender.com", {
  withCredentials: true,
  transports: ["websocket"], // fast connection
});

export default socket;
