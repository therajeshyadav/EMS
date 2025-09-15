import React, { useEffect, useState, useContext } from "react";
import { Bell, Send, X } from "lucide-react";
import { NotificationsApi } from "../../api/api";
import { AuthContext } from "../../context/Authprovider";
import socket from "../../socket"; // 👈 socket client import

const NotificationCenter = () => {
  const { authState } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("all");
  const [showSendModal, setShowSendModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all notifications (once on mount)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await NotificationsApi.list();
        if (res.data.success) {
          const sorted = res.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setNotifications(sorted);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // ✅ Setup socket.io realtime listener
  useEffect(() => {
    if (!authState?.profile?._id) return;

    // Register user with socket server
    socket.emit("register", authState.profile._id);

    // Listen for new notifications
    socket.on("notification", (notif) => {
      setNotifications((prev) => {
        // Prevent duplicate if same _id
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
    });

    return () => {
      socket.off("notification");
    };
  }, [authState]);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((notif) => notif.type === activeTab);

  // ✅ Mark as read
  const markAsRead = async (id) => {
    try {
      await NotificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // ✅ Delete notification
  const deleteNotification = async (id) => {
    try {
      await NotificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // ✅ Send notification (Admin/Manager only)
  const sendNotification = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newNotif = {
      title: formData.get("title"),
      message: formData.get("message"),
      recipients: [formData.get("recipient")],
      sender: authState?.profile?._id,
    };

    try {
      const res = await NotificationsApi.create(newNotif);
      if (res.data.success) {
        // Backend already pushes via socket
        setShowSendModal(false);
      }
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500">Loading notifications...</p>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with important announcements
          </p>
        </div>

        {/* 👇 Only show Send button for admins/managers */}
        {(authState?.role === "admin" ||
          authState?.profile?.role === "manager") && (
          <button
            onClick={() => setShowSendModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send Notification</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "all", name: "All Notifications" },
              { id: "leave", name: "Leave" },
              { id: "payroll", name: "Payroll" },
              { id: "task", name: "Tasks" },
              { id: "general", name: "General" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Notification Modal (Admin only) */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Send Notification
              </h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={sendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <select name="recipient" className="input-field">
                  <option value="all">All Employees</option>
                  <option value="it">IT Department</option>
                  <option value="hr">HR Department</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="input-field"
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  className="input-field"
                  rows="4"
                  placeholder="Notification message"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
