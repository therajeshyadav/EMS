import React, { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
import TopBar from '../Layout/TopBar';
import EmployeeDashboardStats from './EmployeeDashboardStats';
import EmployeeProfile from '../Employee/EmployeeProfile';
import EmployeeAttendance from '../Attendance/EmployeeAttendance';
import EmployeeLeaves from '../Leave/EmployeeLeaves';
import EmployeePayroll from '../Payroll/EmployeePayroll';
import EmployeeTasks from '../Tasks/EmployeeTasks';
import NotificationCenter from '../Notifications/NotificationCenter';

const EmployeeDashboard = ({ changeUser, data }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    changeUser('');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <EmployeeDashboardStats data={data} />;
      case 'profile':
        return <EmployeeProfile data={data} />;
      case 'attendance':
        return <EmployeeAttendance data={data} />;
      case 'leaves':
        return <EmployeeLeaves data={data} />;
      case 'payroll':
        return <EmployeePayroll data={data} />;
      case 'tasks':
        return <EmployeeTasks data={data} />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return <EmployeeDashboardStats data={data} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole="employee"
        onLogout={handleLogout}
      />
      <div className="flex-1">
        <TopBar user={data} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;