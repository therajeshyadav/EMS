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

  const fetchTasks = async (pageNum = 1) => {
    if (!data?.employeeId) return;

    try {
      setLoading(true);
      const res = await TasksApi.mine(data.employeeId, {
        page: pageNum,
        limit: 3,
      });
      if (res.data.success) {
        setTasks(res.data.data);
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
    fetchTasks(page);
  }, [data?.employeeId, page]);

  const handleTaskAction = async (taskId, action) => {
    try {
      let status;
      if (action === "accept") status = "in-progress";
      if (action === "complete") status = "completed";
      if (action === "fail") status = "failed";

      await TasksApi.setStatus(taskId, status);
      fetchTasks(); // Refresh after action
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

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in-progress">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
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
                  {task.status === "new" && (
                    <button
                      onClick={() => handleTaskAction(task._id, "accept")}
                      className="btn-primary text-sm flex-1"
                    >
                      Accept Task
                    </button>
                  )}

                  {task.status === "pending" && (
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

                  {(task.status === "completed" ||
                    task.status === "failed") && (
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
            onClick={() => fetchTasks(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => fetchTasks(page + 1)}
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
