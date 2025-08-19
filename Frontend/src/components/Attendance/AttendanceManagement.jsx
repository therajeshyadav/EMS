import React, { useState, useContext } from 'react';
import { Calendar, Clock, Users, TrendingUp, Download, Filter } from 'lucide-react';
import { AuthContext } from '../../context/Authprovider';

const AttendanceManagement = () => {
  const [userData] = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  const attendanceData = userData.employees?.map(emp => ({
    ...emp,
    todayAttendance: {
      status: Math.random() > 0.2 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM',
      workingHours: '8h 45m'
    }
  })) || [];

  const filteredData = filterStatus === 'all' 
    ? attendanceData 
    : attendanceData.filter(emp => emp.todayAttendance.status === filterStatus);

  const stats = {
    present: attendanceData.filter(emp => emp.todayAttendance.status === 'present').length,
    absent: attendanceData.filter(emp => emp.todayAttendance.status === 'absent').length,
    late: attendanceData.filter(emp => emp.todayAttendance.status === 'late').length,
    total: attendanceData.length
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
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
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent Today</p>
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
              <p className="text-sm text-gray-600">Late Today</p>
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
                {Math.round((stats.present / stats.total) * 100)}%
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
              {filteredData.map((employee) => (
                <tr key={employee.id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.firstName}</p>
                        <p className="text-sm text-gray-500">{employee.department || 'IT'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`status-badge status-${employee.todayAttendance.status}`}>
                      {employee.todayAttendance.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {employee.todayAttendance.status !== 'absent' ? employee.todayAttendance.checkIn : '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {employee.todayAttendance.status !== 'absent' ? employee.todayAttendance.checkOut : '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {employee.todayAttendance.status !== 'absent' ? employee.todayAttendance.workingHours : '-'}
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;