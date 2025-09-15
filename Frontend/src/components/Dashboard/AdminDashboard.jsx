import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import TopBar from "../Layout/TopBar";
import DashboardStats from "./DashboardStats";
import EmployeeManagement from "../Employee/EmployeeManagement";
import AttendanceManagement from "../Attendance/AttendanceManagement";
import LeaveManagement from "../Leave/LeaveManagement";
import PayrollManagement from "../Payroll/PayrollManagement";
import ReportsSection from "../Reports/ReportsSection";
import TaskManagement from "../Tasks/TaskManagement";
import NotificationCenter from "../Notifications/NotificationCenter";
import SettingsPanel from "../Settings/SettingsPanel";

const AdminDashboard = ({ changeUser }) => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    changeUser("");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardStats />;
      case "employees":
        return <EmployeeManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "leaves":
        return <LeaveManagement />;
      case "payroll":
        return <PayrollManagement />;
      case "reports":
        return <ReportsSection />;
      case "tasks":
        return <TaskManagement />;
      case "notifications":
        return <NotificationCenter />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={storedUser?.role || "admin"}
        onLogout={handleLogout}
      />
      <div className="flex-1">
        <TopBar
          user={storedUser.profile || { firstName: "Admin", role: "admin" }}
        />
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
