import React, { useState } from 'react';
import { Clock, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeAttendance = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  const attendanceHistory = [
    { date: '2025-01-15', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'present', hours: '8h 45m' },
    { date: '2025-01-14', checkIn: '09:45 AM', checkOut: '06:15 PM', status: 'late', hours: '8h 30m' },
    { date: '2025-01-13', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hours: '9h 00m' },
    { date: '2025-01-12', checkIn: '-', checkOut: '-', status: 'absent', hours: '-' },
    { date: '2025-01-11', checkIn: '09:30 AM', checkOut: '06:45 PM', status: 'present', hours: '8h 45m' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours</p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-600 mb-4">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Check In</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Check Out</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Status</span>
              </div>
              <span className={`status-badge ${isCheckedIn ? 'status-present' : 'status-absent'}`}>
                {isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>

            {isCheckedIn && (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Check In Time</span>
                  </div>
                  <span className="font-medium">
                    {checkInTime?.toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Location</span>
                  </div>
                  <span className="font-medium">Office</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">22</div>
          <div className="text-sm text-gray-600">Days Present</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">2</div>
          <div className="text-sm text-gray-600">Days Absent</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">3</div>
          <div className="text-sm text-gray-600">Late Arrivals</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">95%</div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Check In</th>
                <th className="text-left p-4">Check Out</th>
                <th className="text-left p-4">Working Hours</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="table-row">
                  <td className="p-4 font-medium text-gray-900">{record.date}</td>
                  <td className="p-4 text-gray-600">{record.checkIn}</td>
                  <td className="p-4 text-gray-600">{record.checkOut}</td>
                  <td className="p-4 text-gray-600">{record.hours}</td>
                  <td className="p-4">
                    <span className={`status-badge status-${record.status}`}>
                      {record.status}
                    </span>
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

export default EmployeeAttendance;