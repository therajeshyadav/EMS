import React, { useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import ApplyLeaveModal from './ApplyLeaveModal';

const EmployeeLeaves = ({ data }) => {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const leaveBalance = {
    annual: 15,
    sick: 10,
    casual: 8,
    maternity: 90
  };

  const leaveHistory = [
    {
      id: 1,
      type: 'Sick Leave',
      startDate: '2025-01-10',
      endDate: '2025-01-12',
      days: 3,
      status: 'approved',
      reason: 'Fever and cold',
      appliedDate: '2025-01-08'
    },
    {
      id: 2,
      type: 'Casual Leave',
      startDate: '2025-01-20',
      endDate: '2025-01-20',
      days: 1,
      status: 'pending',
      reason: 'Personal work',
      appliedDate: '2025-01-15'
    },
    {
      id: 3,
      type: 'Annual Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-31',
      days: 7,
      status: 'approved',
      reason: 'Christmas vacation',
      appliedDate: '2024-12-01'
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-600 mt-1">Manage your leave requests and balance</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">{leaveBalance.annual}</div>
          <div className="text-sm text-gray-600">Annual Leave</div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 mb-2">{leaveBalance.sick}</div>
          <div className="text-sm text-gray-600">Sick Leave</div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">{leaveBalance.casual}</div>
          <div className="text-sm text-gray-600">Casual Leave</div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-2">{leaveBalance.maternity}</div>
          <div className="text-sm text-gray-600">Maternity Leave</div>
        </div>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
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
                <tr key={leave.id} className="table-row">
                  <td className="p-4 font-medium text-gray-900">{leave.type}</td>
                  <td className="p-4 text-gray-600">
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td className="p-4 text-gray-600">{leave.days} days</td>
                  <td className="p-4 text-gray-600">{leave.appliedDate}</td>
                  <td className="p-4">
                    <span className={`status-badge status-${leave.status}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{leave.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onApply={(leaveData) => {
            console.log('Applied for leave:', leaveData);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeLeaves;