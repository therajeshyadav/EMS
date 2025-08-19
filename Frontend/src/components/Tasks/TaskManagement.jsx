import React, { useState, useContext } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/Authprovider';
import CreateTaskModal from './CreateTaskModal';

const TaskManagement = () => {
  const [userData, setUserData] = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allTasks = userData.employees?.reduce((tasks, emp) => {
    return tasks.concat((emp.tasks || []).map(task => ({
      ...task,
      employeeName: emp.firstName,
      employeeId: emp.id
    })));
  }, []) || [];

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && task.active) ||
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'new' && task.newTask) ||
                         (filterStatus === 'failed' && task.failed);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: allTasks.length,
    active: allTasks.filter(task => task.active).length,
    completed: allTasks.filter(task => task.completed).length,
    pending: allTasks.filter(task => task.newTask).length
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Assign and track tasks across your team</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
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
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Task</th>
                <th className="text-left p-4">Assigned To</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Due Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Priority</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={index} className="table-row">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{task.taskTitle}</p>
                      <p className="text-sm text-gray-500">{task.taskDescription}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {task.employeeName?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-900">{task.employeeName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {task.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{task.taskdate}</td>
                  <td className="p-4">
                    <span className={`status-badge ${
                      task.completed ? 'status-approved' :
                      task.active ? 'status-pending' :
                      task.newTask ? 'status-present' :
                      task.failed ? 'status-rejected' : 'status-pending'
                    }`}>
                      {task.completed ? 'Completed' :
                       task.active ? 'Active' :
                       task.newTask ? 'New' :
                       task.failed ? 'Failed' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Medium
                    </span>
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

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          employees={userData.employees || []}
          onCreateTask={(taskData) => {
            // Add task to employee
            const updatedEmployees = userData.employees.map(emp => {
              if (emp.firstName === taskData.assignTo) {
                return {
                  ...emp,
                  tasks: [...(emp.tasks || []), {
                    taskTitle: taskData.taskTitle,
                    taskDescription: taskData.taskDescription,
                    taskdate: taskData.taskDate,
                    category: taskData.category,
                    active: false,
                    newTask: true,
                    completed: false,
                    failed: false
                  }]
                };
              }
              return emp;
            });
            
            setUserData({ ...userData, employees: updatedEmployees });
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TaskManagement;