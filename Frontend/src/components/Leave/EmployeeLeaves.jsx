import React, { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import ApplyLeaveModal from "./ApplyLeaveModal";
import { LeavesApi } from "../../api/api"; // adjust import

// Map leave types to styles (color-coded calendars)
const leaveTypeStyles = {
  annual: { bg: "bg-blue-100", text: "text-blue-600" },
  sick: { bg: "bg-red-100", text: "text-red-600" },
  casual: { bg: "bg-green-100", text: "text-green-600" },
  maternity: { bg: "bg-purple-100", text: "text-purple-600" },
};

// Map leave status to badge styles
const statusStyles = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

// Helper to format dates as d/m/yy
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

const EmployeeLeaves = ({ data }) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const employeeId = data.employeeId;

  // Fetch balance
  const fetchBalance = async () => {
    try {
      const res = await LeavesApi.balance(employeeId);
      if (res.data.success) {
        setLeaveBalance(res.data.data.balance || {});
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Fetch paginated history
  const fetchHistory = async (pageNum = 1) => {
    try {
      const res = await LeavesApi.me({ page: pageNum, limit: 3 });
      if (res.data.success) {
        setLeaveHistory(res.data.data.history || []);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchBalance();
      await fetchHistory(page);
      setLoading(false);
    };
    if (employeeId) fetchData();
  }, [employeeId]);

  const handleApplyLeave = async (leaveData) => {
    try {
      // Format dates as YYYY-MM-DD
      const formatDate = (date) => new Date(date).toISOString().split("T")[0];

      const payload = {
        leaveType: leaveData.leaveType.toLowerCase().replace(" leave", ""),
        startDate: formatDate(leaveData.startDate),
        endDate: formatDate(leaveData.endDate),
        reason: leaveData.reason,
        documents: leaveData.documents || [],
      };

      console.log("Submitting leave:", payload); // Debug

      await LeavesApi.create(payload);

      setShowApplyModal(false);
      await fetchBalance();
      await fetchHistory(1);
    } catch (error) {
      console.error(
        "Error applying for leave:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading leave data...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-600 mt-1">
            Manage your leave requests and balance
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {Object.entries(leaveBalance).map(([type, value]) => {
          const style = leaveTypeStyles[type.toLowerCase()] || {
            bg: "bg-gray-100",
            text: "text-gray-600",
          };

          return (
            <div
              key={type}
              className="bg-white rounded-xl p-6 card-shadow text-center"
            >
              <div
                className={`w-12 h-12 ${style.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}
              >
                <Calendar className={`w-6 h-6 ${style.text}`} />
              </div>
              <div className={`text-2xl font-bold ${style.text} mb-2`}>
                {value}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {type} Leave
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave History Table */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Leave Type</th>
                <th className="text-left p-4">Duration</th>
                <th className="text-left p-4">Days</th>
                <th className="text-left p-4">Applied Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((leave) => (
                <tr key={leave._id} className="table-row">
                  <td className="p-4 font-medium text-gray-900 capitalize">
                    {leave.leaveType}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </td>
                  <td className="p-4 text-gray-600">{leave.days} days</td>
                  <td className="p-4 text-gray-600">
                    {formatDate(leave.createdAt)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[leave.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {leave.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{leave.reason}</td>
                </tr>
              ))}
              {leaveHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No leave history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t">
          <button
            disabled={page <= 1}
            onClick={() => fetchHistory(page - 1)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchHistory(page + 1)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onApply={handleApplyLeave}
        />
      )}
    </div>
  );
};

export default EmployeeLeaves;
