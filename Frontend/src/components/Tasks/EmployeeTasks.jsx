import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, Filter } from 'lucide-react';

const EmployeeTasks = ({ data }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const tasks = data?.tasks || [];
  
  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => {
        if (filterStatus === 'new') return task.newTask;
        if (filterStatus === 'active') return task.active;
        if (filterStatus === 'completed') return task.completed;
        if (filterStatus === 'failed') return task.failed;
        return false;
      });

  const stats = {
    total: tasks.length,
    new: tasks.filter(task => task.newTask).length,
    active: tasks.filter(task => task.active).length,
    completed: tasks.filter(task => task.completed).length,
    failed: tasks.filter(task => task.failed).length
  };

  const handleTaskAction = (taskIndex, action) => {
    console.log(`Task ${action}:`, tasks[taskIndex]);
    // Here you would update the task status
  };

  const getTaskStatus = (task) => {
    if (task.completed) return { status: 'completed', color: 'green' };
    if (task.active) return { status: 'active', color: 'yellow' };
    if (task.failed) return { status: 'failed', color: 'red' };
    if (task.newTask) return { status: 'new', color: 'blue' };
    return { status: 'pending', color: 'gray' };
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Manage your assigned tasks and track progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{stats.new}</div>
          <div className="text-sm text-gray-600">New Tasks</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">{stats.failed}</div>
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
            <option value="all">All Tasks</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task, index) => {
          const taskStatus = getTaskStatus(task);
          return (
            <div key={index} className="bg-white rounded-xl p-6 card-shadow hover-scale">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${taskStatus.color}-100 text-${taskStatus.color}-800`}>
                  {task.category}
                </div>
                <span className={`status-badge status-${taskStatus.status}`}>
                  {taskStatus.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {task.taskTitle}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {task.taskDescription}
              </p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                Due: {task.taskdate}
              </div>

              <div className="flex space-x-2">
                {task.newTask && (
                  <button
                    onClick={() => handleTaskAction(index, 'accept')}
                    className="btn-primary text-sm flex-1"
                  >
                    Accept Task
                  </button>
                )}
                
                {task.active && (
                  <>
                    <button
                      onClick={() => handleTaskAction(index, 'complete')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleTaskAction(index, 'fail')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1"
                    >
                      Mark Failed
                    </button>
                  </>
                )}

                {(task.completed || task.failed) && (
                  <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm flex-1 cursor-not-allowed">
                    {task.completed ? 'Completed' : 'Failed'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl p-12 card-shadow text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? "You don't have any tasks assigned yet." 
              : `No ${filterStatus} tasks found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;