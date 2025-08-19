import React, { useState } from 'react';
import { Download, Calendar, BarChart3, Users, Clock, TrendingUp } from 'lucide-react';

const ReportsSection = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Clock },
    { id: 'leave', name: 'Leave Report', icon: Calendar },
    { id: 'payroll', name: 'Payroll Report', icon: TrendingUp },
    { id: 'performance', name: 'Performance Report', icon: BarChart3 },
    { id: 'employee', name: 'Employee Report', icon: Users }
  ];

  const generateReport = () => {
    console.log('Generating report:', selectedReport, dateRange);
  };

  const exportReport = (format) => {
    console.log('Exporting report as:', format);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Types */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
            <div className="space-y-2">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      selectedReport === report.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{report.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-6 card-shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateReport}
                  className="btn-primary w-full"
                >
                  Generate Report
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => exportReport('pdf')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            
            {selectedReport === 'attendance' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Average Attendance</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-600">Present Today</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <div className="text-sm text-gray-600">Absent Today</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-gray-600">Late Arrivals</div>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Attendance chart would appear here</p>
                </div>
              </div>
            )}

            {selectedReport === 'leave' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <div className="text-sm text-gray-600">Pending Requests</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">8</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Leave analytics chart would appear here</p>
                </div>
              </div>
            )}

            {selectedReport === 'payroll' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">₹12.5L</div>
                    <div className="text-sm text-gray-600">Total Payroll</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">₹45K</div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">₹2.1L</div>
                    <div className="text-sm text-gray-600">Total Deductions</div>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Payroll breakdown chart would appear here</p>
                </div>
              </div>
            )}

            {(selectedReport === 'performance' || selectedReport === 'employee') && (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  {selectedReport === 'performance' ? 'Performance metrics' : 'Employee statistics'} would appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;