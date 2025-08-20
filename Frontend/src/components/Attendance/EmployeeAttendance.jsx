import React, { useState, useEffect } from "react";
import { Clock, MapPin, CheckCircle } from "lucide-react";
import { AttendanceApi } from "../../api/api";

const EmployeeAttendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    rate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⏰ Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 📡 Fetch user attendance
  const fetchData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await AttendanceApi.me(pageNumber, 3); // ✅ 3 records per page
      const { summary, history } = res.data.data;
      const { totalPages } = res.data.pagination;

      // map history into UI friendly
      const mapped = history.map((r) => {
        const checkIn = r.checkIn?.time ? new Date(r.checkIn.time) : null;
        const checkOut = r.checkOut?.time ? new Date(r.checkOut.time) : null;
        const hours = r.workingHours
          ? `${Math.floor(r.workingHours / 60)}h ${r.workingHours % 60}m`
          : "-";

        return {
          date: new Date(r.date).toLocaleDateString("en-US"),
          checkIn: checkIn ? checkIn.toLocaleTimeString() : "-",
          checkOut: checkOut ? checkOut.toLocaleTimeString() : "-",
          status: r.status,
          hours,
        };
      });

      setAttendanceHistory(mapped);
      setStats(summary);
      setTotalPages(totalPages);

      // detect if user is checked in
      const today = new Date().toDateString();
      const todayRecord = history.find(
        (r) => new Date(r.date).toDateString() === today
      );
      if (
        todayRecord &&
        todayRecord.checkIn?.time &&
        !todayRecord.checkOut?.time
      ) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(todayRecord.checkIn.time));
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // 📍 Dummy office location
  const defaultLocation = {
    type: "Point",
    coordinates: [77.5946, 12.9716], // [lng, lat]
  };

  const handleCheckIn = async () => {
    try {
      await AttendanceApi.checkIn({ location: defaultLocation });
      await fetchData(page);
    } catch (err) {
      console.error("Check-in failed", err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await AttendanceApi.checkOut({ location: defaultLocation });
      await fetchData(page);
    } catch (err) {
      console.error("Check-out failed", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading attendance...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-1">
          Track your daily attendance and working hours
        </p>
      </div>

      {/* STATUS CARD */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-600 mb-4">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
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

          {/* STATUS DETAILS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Status</span>
              </div>
              <span
                className={`status-badge ${
                  isCheckedIn ? "status-present" : "status-absent"
                }`}
              >
                {isCheckedIn ? "Checked In" : "Not Checked In"}
              </span>
            </div>

            {isCheckedIn && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Check In Time</span>
                </div>
                <span className="font-medium">
                  {checkInTime?.toLocaleTimeString()}
                </span>
              </div>
            )}

            {isCheckedIn && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Location</span>
                </div>
                <span className="font-medium">Office</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {stats.present}
          </div>
          <div className="text-sm text-gray-600">Days Present</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {stats.absent}
          </div>
          <div className="text-sm text-gray-600">Days Absent</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {stats.late}
          </div>
          <div className="text-sm text-gray-600">Late Arrivals</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {stats.rate}%
          </div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance History
          </h3>
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
                  <td className="p-4 font-medium text-gray-900">
                    {record.date}
                  </td>
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
              {attendanceHistory.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-4 text-center text-gray-500 italic"
                  >
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center space-x-4 p-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
