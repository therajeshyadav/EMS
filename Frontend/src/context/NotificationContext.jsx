import React, { createContext, useEffect, useState } from "react";
import socket from "../socket";
import useAuth from "./Authprovider"; // assume this gives you authState.profile

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { authState } = useAuth(); // from AuthProvider
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (authState?.profile?._id) {
      // ✅ Register with employee MongoId (_id)
      socket.emit("register", authState.profile._id);

      // ✅ Listen for notifications
      socket.on("notification", (notif) => {
        console.log("📩 New notification received:", notif);
        setNotifications((prev) => [notif, ...prev]);
      });
    }

    return () => {
      socket.off("notification");
    };
  }, [authState]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
