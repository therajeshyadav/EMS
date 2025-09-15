import React, { useEffect, useState } from "react";
import { Calendar, Filter, AlertCircle } from "lucide-react";
import { TasksApi } from "../../api/api"; // adjust import path

const EmployeeTasks = ({ data }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (pageNum = 1, statusFilter = "all") => {
    if (!data?.employeeId) return;

    try {
      setLoading(true);
      const res = await TasksApi.mine(data.employeeId, {
        page: pageNum,
        limit: 6, // Increased limit to show more tasks
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.data.success) {
        // Sort tasks to prioritize new tasks first
        const sortedTasks = res.data.data.sort((a, b) => {
          // Priority order: pending/assigned -> in-progress -> completed -> failed
          const statusPriority = {
            'pending': 1,
            'assigned': 1,
            'in-progress': 2,
            'completed': 3,
            'failed': 4
          };
          
          if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
          }
          
          // If same status, sort by creation date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setTasks(sortedTasks);
        setStats(res.data.stats);
        setPagination(res.data.pagination);
        setPage(res.data.pagination.page);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(page, filterStatus);
  }, [data?.employeeId, page, filterStatus]);

  const handleTaskAction = async (taskId, action) => {
    try {
      let status;
      if (action === "accept") status = "in-progress";
      if (action === "complete") status = "completed";
      if (action === "fail") status = "failed";

      await TasksApi.setStatus(taskId, status);
      fetchTasks(page); // Refresh current page after action
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === "completed")
      return { status: "Completed", color: "green" };
    if (task.status === "in-progress")
      return { status: "Active", color: "yellow" };
    if (task.status === "failed") return { status: "Failed", color: "red" };
    if (task.status === "pending" || task.status === "assigned") 
      return { status: "New", color: "blue" };
    return { status: "New", color: "blue" };
  };

  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">
          Manage your assigned tasks and track progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {stats.total || 0}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {stats.new || 0}
          </div>
          <div className="text-sm text-gray-600">New</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {stats.active || 0}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {stats.completed || 0}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {stats.failed || 0}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Quick Actions & Filter */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1); // Reset to first page when filtering
                fetchTasks(1, e.target.value);
              }}
              className="input-field w-auto"
            >
              <option value="all">All Tasks</option>
              <option value="pending">🆕 New Tasks</option>
              <option value="assigned">📋 Assigned Tasks</option>
              <option value="in-progress">⚡ Active Tasks</option>
              <option value="completed">✅ Completed</option>
              <option value="failed">❌ Failed</option>
            </select>
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setFilterStatus("pending");
                setPage(1);
                fetchTasks(1, "pending");
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filterStatus === "pending" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50"
              }`}
            >
              New ({stats.new || 0})
            </button>
            <button
              onClick={() => {
                setFilterStatus("in-progress");
                setPage(1);
                fetchTasks(1, "in-progress");
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filterStatus === "in-progress" 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
              }`}
            >
              Active ({stats.active || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Task Cards */}
      {loading ? (
        <p className="text-center text-gray-500">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600">
            {filterStatus === "all"
              ? "You don't have any tasks assigned yet."
              : `No ${filterStatus} tasks found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const taskStatus = getTaskStatus(task);
            return (
              <div
                key={task._id}
                className="bg-white rounded-xl p-6 card-shadow hover-scale"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-${taskStatus.color}-100 text-${taskStatus.color}-800`}
                  >
                    {task.category || "General"}
                  </div>
                  <span
                    className={`status-badge status-${taskStatus.status.toLowerCase()}`}
                  >
                    {taskStatus.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {task.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {task.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(task.dueDate).toLocaleDateString("en-GB")}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* New tasks show Accept button */}
                  {(task.status === "pending" || task.status === "assigned") && (
                    <button
                      onClick={() => handleTaskAction(task._id, "accept")}
                      className="btn-primary text-sm flex-1"
                    >
                      Accept Task
                    </button>
                  )}

                  {/* Active tasks show Complete/Fail buttons */}
                  {task.status === "in-progress" && (
                    <>
                      <button
                        onClick={() => handleTaskAction(task._id, "complete")}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleTaskAction(task._id, "fail")}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1"
                      >
                        Mark Failed
                      </button>
                    </>
                  )}

                  {/* Completed/Failed tasks show status only */}
                  {(task.status === "completed" || task.status === "failed") && (
                    <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm flex-1 cursor-not-allowed">
                      {task.status === "completed" ? "Completed" : "Failed"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            disabled={page === 1}
            onClick={() => {
              const newPage = page - 1;
              setPage(newPage);
              fetchTasks(newPage, filterStatus);
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              fetchTasks(newPage, filterStatus);
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
