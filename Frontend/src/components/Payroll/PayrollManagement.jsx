import React, { useState, useContext } from 'react';
import { DollarSign, Download, Send, Calculator, Filter } from 'lucide-react';
import { AuthContext } from '../../context/Authprovider';

const PayrollManagement = () => {
  const [userData] = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const payrollData = userData.employees?.map(emp => ({
    ...emp,
    salary: emp.salary || 50000,
    bonus: 5000,
    deductions: 2000,
    tax: 8000,
    netSalary: (emp.salary || 50000) + 5000 - 2000 - 8000,
    status: 'pending'
  })) || [];

  const generatePayslip = (employee) => {
    console.log('Generating payslip for:', employee.firstName);
  };

  const processPayroll = () => {
    console.log('Processing payroll for all employees');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Manage employee salaries and payslips</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={processPayroll}
            className="btn-primary flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>Process Payroll</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-green-600">₹{payrollData.reduce((sum, emp) => sum + emp.netSalary, 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-blue-600">{payrollData.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{Math.round(payrollData.reduce((sum, emp) => sum + emp.netSalary, 0) / payrollData.length || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{payrollData.filter(emp => emp.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field w-auto"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Basic Salary</th>
                <th className="text-left p-4">Bonus</th>
                <th className="text-left p-4">Deductions</th>
                <th className="text-left p-4">Tax</th>
                <th className="text-left p-4">Net Salary</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((employee) => (
                <tr key={employee.id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.firstName}</p>
                        <p className="text-sm text-gray-500">{employee.position || 'Developer'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">₹{employee.salary.toLocaleString()}</td>
                  <td className="p-4 text-green-600">₹{employee.bonus.toLocaleString()}</td>
                  <td className="p-4 text-red-600">₹{employee.deductions.toLocaleString()}</td>
                  <td className="p-4 text-red-600">₹{employee.tax.toLocaleString()}</td>
                  <td className="p-4 font-bold text-gray-900">₹{employee.netSalary.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`status-badge status-${employee.status}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => generatePayslip(employee)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Payslip</span>
                      </button>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </div>
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

export default PayrollManagement;