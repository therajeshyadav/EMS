import React, { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Filter } from "lucide-react";
import { LeavesApi } from "../../api/api"; // adjust import path

const LeaveManagement = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // 🔹 Pagination limit = 3
  const limit = 3;

  // Load data from API
  const load = async () => {
    try {
      const res = await LeavesApi.list({
        page,
        limit,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });

      const data = res?.data?.data || [];
      setRequests(data);

      // ✅ pagination info
      const pagination = res?.data?.pagination;
      setTotalPages(pagination?.totalPages || 1);

      // ✅ global stats always from backend (not per-page)
      if (res?.data?.stats) {
        setStats(res.data.stats);
      } else {
        setStats({
          pending: 0,
          approved: 0,
          rejected: 0,
          total: pagination?.totalItems || 0,
        });
      }
    } catch (err) {
      console.error("Error loading leaves:", err);
    }
  };

  useEffect(() => {
    load();
  }, [page, filterStatus]);

  // Approve
  const handleApprove = async (id) => {
    try {
      await LeavesApi.approve(id);
      load();
    } catch (err) {
      alert(err?.message || "Failed to approve");
    }
  };

  // Reject
  const handleReject = async (id) => {
    try {
      await LeavesApi.reject(id, { rejectionReason: "Not specified" });
      load();
    } catch (err) {
      alert(err?.message || "Failed to reject");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee leave requests and approvals
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pending", value: stats.pending, color: "yellow", icon: Clock },
          { label: "Approved", value: stats.approved, color: "green", icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, color: "red", icon: XCircle },
          { label: "Total", value: stats.total, color: "blue", icon: Calendar },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-600`}>
                  {s.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 bg-${s.color}-100 rounded-lg flex items-center justify-center`}
              >
                <s.icon className={`w-6 h-6 text-${s.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setFilterStatus(e.target.value);
            }}
            className="input-field w-auto"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Leave Type</th>
                <th className="p-4 text-left">Duration</th>
                <th className="p-4 text-left">Days</th>
                <th className="p-4 text-left">Applied</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="table-row">
                  <td className="p-4">
                    {r.employee?.firstName} {r.employee?.lastName}
                  </td>
                  <td className="p-4 text-gray-600">{r.leaveType}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(r.startDate).toISOString().split("T")[0]} -{" "}
                    {new Date(r.endDate).toISOString().split("T")[0]}
                  </td>
                  <td className="p-4 text-gray-600">{r.days}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(r.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-4">
                    <span className={`status-badge status-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r._id)}
                          className="btn btn-sm bg-green-500 text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r._id)}
                          className="btn btn-sm bg-red-500 text-white"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-blue-600">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded-lg ${
              page <= 1 ? "bg-gray-200 text-gray-400" : "bg-blue-500 text-white"
            }`}
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded-lg ${
              page >= totalPages
                ? "bg-gray-200 text-gray-400"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
