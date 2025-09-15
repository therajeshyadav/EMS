import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { EmployeesApi, LeavesApi } from "../../api/api";

const EmployeeDashboardStats = ({ data }) => {
  const [statsData, setStatsData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data?.employeeId) return;

    const fetchStats = async () => {
      try {
        // Fetch both APIs in parallel
        const [resStats, resBalance] = await Promise.all([
          EmployeesApi.stats(data.employeeId),
          LeavesApi.balance(data.employeeId),
        ]);

        if (resStats.data.success) setStatsData(resStats.data.data);
        if (resBalance.data.success)
          setLeaveBalance(resBalance.data.data.balance);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [data?.employeeId]);

  // Loading state
  if (loading && !statsData) {
    return <p>Loading stats...</p>;
  }

  // Extract backend data safely
  const completedTasks = statsData?.tasks?.completedTasks || 0;
  const activeTasks = statsData?.tasks?.activeTasks || 0;
  const attendanceRate =
    statsData?.attendance?.totalDays > 0
      ? `${Math.round(
          (statsData.attendance.presentDays / statsData.attendance.totalDays) *
            100
        )}%`
      : "0%";

  // Stats array
  const stats = [
    {
      title: "Tasks Completed",
      value: completedTasks,
      icon: CheckCircle,
      bg: "bg-gradient-to-r from-green-400 to-green-600",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: Clock,
      bg: "bg-gradient-to-r from-blue-400 to-blue-600",
      change: "+5%",
      changeType: "positive",
    },
    {
      title: "Leave Balance",
      value:
        leaveBalance && typeof leaveBalance === "object"
          ? Object.values(leaveBalance).reduce((a, b) => a + b, 0)
          : "Loading...",
      icon: Calendar,
      bg: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      change: "-2 days",
      changeType: "neutral",
    },
    {
      title: "Attendance Rate",
      value: attendanceRate,
      icon: TrendingUp,
      bg: "bg-gradient-to-r from-purple-400 to-purple-600",
      change: "+2%",
      changeType: "positive",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {data?.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your performance overview for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 card-shadow hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
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

      {/* Schedule and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Schedule
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Team Meeting</p>
                <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
              </div>
              <span className="status-badge bg-blue-100 text-blue-800">
                Upcoming
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Project Review</p>
                <p className="text-sm text-gray-600">2:00 PM - 3:30 PM</p>
              </div>
              <span className="status-badge bg-green-100 text-green-800">
                Scheduled
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Client Call</p>
                <p className="text-sm text-gray-600">4:00 PM - 5:00 PM</p>
              </div>
              <span className="status-badge bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="btn-primary text-left flex items-center space-x-3">
              <Clock className="w-5 h-5" />
              <span>Mark Attendance</span>
            </button>
            <button className="btn-secondary text-left flex items-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Apply for Leave</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" />
              <span>View Payslip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardStats;
