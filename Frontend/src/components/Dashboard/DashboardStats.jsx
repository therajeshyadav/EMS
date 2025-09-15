import React, { useState, useEffect, useContext } from "react";
import { Users, UserCheck, Calendar, Clock, TrendingUp } from "lucide-react";
import { EmployeesApi, AttendanceApi, LeavesApi, TasksApi } from "../../api/api";
import { AuthContext } from "../../context/Authprovider";

const DashboardStats = () => {
  const { authState } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [employeesRes, attendanceRes, leavesRes, tasksRes] = await Promise.all([
          EmployeesApi.list(),
          AttendanceApi.adminget({ date: new Date().toISOString().split('T')[0] }),
          LeavesApi.list({ status: 'pending' }),
          TasksApi.list()
        ]);

        const employees = employeesRes.data.data || [];
        const todayAttendance = attendanceRes.data.data || [];
        const pendingLeaves = leavesRes.data.data || [];
        const allTasks = tasksRes.data.data || [];

        // Calculate stats
        const totalEmployees = employees.length;
        const presentToday = todayAttendance.filter(att => att.status === 'present').length;
        const pendingLeavesCount = pendingLeaves.length;
        const activeTasks = allTasks.filter(task => 
          task.status === 'assigned' || task.status === 'in-progress'
        ).length;

        setStats({
          totalEmployees,
          presentToday,
          pendingLeaves: pendingLeavesCount,
          activeTasks
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to default values
        setStats({
          totalEmployees: 0,
          presentToday: 0,
          pendingLeaves: 0,
          activeTasks: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (authState.token) {
      fetchDashboardStats();
    }
  }, [authState.token]);

  const statsData = [
    {
      title: "Total Employees",
      value: loading ? "..." : stats.totalEmployees,
      icon: Users,
      color: "gradient-primary",
      change: "+2.5%",
      changeType: "positive",
    },
    {
      title: "Present Today",
      value: loading ? "..." : stats.presentToday,
      icon: UserCheck,
      color: "gradient-success",
      change: "+5.2%",
      changeType: "positive",
    },
    {
      title: "Pending Leaves",
      value: loading ? "..." : stats.pendingLeaves,
      icon: Calendar,
      color: "gradient-warning",
      change: "-1.8%",
      changeType: "negative",
    },
    {
      title: "Active Tasks",
      value: loading ? "..." : stats.activeTasks,
      icon: Clock,
      color: "gradient-danger",
      change: "+8.1%",
      changeType: "positive",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back, {authState?.user?.firstName || authState?.profile?.firstName || "Admin"}! Here's what's
          happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 card-shadow hover-scale"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                John Doe marked attendance at 9:15 AM
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Sarah Smith submitted leave request
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Task "Website Redesign" completed
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Mike Johnson is late today
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-primary text-center">Add Employee</button>
            <button className="btn-secondary text-center">
              Generate Report
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
              Approve Leaves
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
