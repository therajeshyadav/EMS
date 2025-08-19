import React, { useState, useContext } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Filter, Plus } from 'lucide-react';
import { AuthContext } from '../../context/Authprovider';

const LeaveManagement = () => {
  const [userData] = useContext(AuthContext);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock leave data
  const leaveRequests = [
    {
      id: 1,
      employeeName: 'Amit',
      leaveType: 'Sick Leave',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      days: 3,
      status: 'pending',
      reason: 'Fever and cold',
      appliedDate: '2025-01-15'
    },
    {
      id: 2,
      employeeName: 'Priya',
      leaveType: 'Casual Leave',
      startDate: '2025-01-25',
      endDate: '2025-01-26',
      days: 2,
      status: 'approved',
      reason: 'Personal work',
      appliedDate: '2025-01-10'
    },
    {
      id: 3,
      employeeName: 'Rajesh',
      leaveType: 'Annual Leave',
      startDate: '2025-02-01',
      endDate: '2025-02-05',
      days: 5,
      status: 'rejected',
      reason: 'Family vacation',
      appliedDate: '2025-01-12'
    }
  ];

  const filteredRequests = filterStatus === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status === filterStatus);

  const handleApprove = (id) => {
    // Handle approval logic
    console.log('Approved leave request:', id);
  };

  const handleReject = (id) => {
    // Handle rejection logic
    console.log('Rejected leave request:', id);
  };

  const stats = {
    pending: leaveRequests.filter(req => req.status === 'pending').length,
    approved: leaveRequests.filter(req => req.status === 'approved').length,
    rejected: leaveRequests.filter(req => req.status === 'rejected').length,
    total: leaveRequests.length
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage employee leave requests and approvals</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Leave Type</th>
                <th className="text-left p-4">Duration</th>
                <th className="text-left p-4">Days</th>
                <th className="text-left p-4">Applied Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {request.employeeName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.employeeName}</p>
                        <p className="text-sm text-gray-500">{request.reason}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{request.leaveType}</td>
                  <td className="p-4 text-gray-600">
                    {request.startDate} to {request.endDate}
                  </td>
                  <td className="p-4 text-gray-600">{request.days} days</td>
                  <td className="p-4 text-gray-600">{request.appliedDate}</td>
                  <td className="p-4">
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    )}
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

export default LeaveManagement;