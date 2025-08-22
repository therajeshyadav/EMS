import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import { AttendanceApi } from "../../api/api";

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });

  // default to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterStatus, setFilterStatus] = useState("all");

  // -------- helpers --------
  const getDateLabel = (isoDate) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (isoDate === today) return "Today";
    if (isoDate === yesterday) return "Yesterday";

    const d = new Date(isoDate);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (isNaN(dt)) return "-";
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatWorkingFromMinutes = (minutes) => {
    if (minutes == null || isNaN(minutes) || minutes <= 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // -------- fetch --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: 1,
          limit: 10,
          date: selectedDate,
        };
        if (filterStatus !== "all") params.status = filterStatus;

        const res = await AttendanceApi.adminget(params);
        const { data, stats, pagination } = res.data;
        console.log(data[0].employee.employeeId);

        setAttendanceData(data || []);
        setStats(stats || { present: 0, absent: 0, late: 0, total: 0 });
        setPagination(pagination || {});
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceData([]);
        setStats({ present: 0, absent: 0, late: 0, total: 0 });
      }
    };
    fetchData();
  }, [filterStatus, selectedDate]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Present {getDateLabel(selectedDate)}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.present}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Absent {getDateLabel(selectedDate)}
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Late {getDateLabel(selectedDate)}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total > 0
                  ? Math.round((stats.present / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-auto"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Check In</th>
                <th className="text-left p-4">Check Out</th>
                <th className="text-left p-4">Working Hours</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record._id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {record.employee?.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.employee?.firstName}{" "}
                          {record.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.employee?.department.name || "IT"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`status-badge status-${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatTime(record?.checkIn?.time)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatTime(record?.checkOut?.time)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatWorkingFromMinutes(record?.workingMinutes)}
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
