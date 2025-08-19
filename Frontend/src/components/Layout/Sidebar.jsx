import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Settings, 
  Bell,
  UserCheck,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, userRole, onLogout }) => {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'leaves', label: 'Leave Management', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'tasks', label: 'Task Management', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: Users },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'leaves', label: 'My Leaves', icon: Calendar },
    { id: 'payroll', label: 'Payslips', icon: DollarSign },
    { id: 'tasks', label: 'My Tasks', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div className="w-64 min-h-screen gradient-bg text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          EMS Pro
        </h1>
        <p className="text-sm opacity-75 mt-1">Employee Management System</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div
          className="sidebar-item text-red-300 hover:text-red-200"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;