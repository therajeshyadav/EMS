import React, { useState } from 'react';
import { Download, Eye, Calendar, DollarSign } from 'lucide-react';

const EmployeePayroll = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const payslips = [
    {
      month: 'January 2025',
      basicSalary: 50000,
      bonus: 5000,
      deductions: 2000,
      tax: 8000,
      netSalary: 45000,
      status: 'paid',
      paidDate: '2025-01-31'
    },
    {
      month: 'December 2024',
      basicSalary: 50000,
      bonus: 10000,
      deductions: 2000,
      tax: 9000,
      netSalary: 49000,
      status: 'paid',
      paidDate: '2024-12-31'
    },
    {
      month: 'November 2024',
      basicSalary: 50000,
      bonus: 3000,
      deductions: 1500,
      tax: 7500,
      netSalary: 44000,
      status: 'paid',
      paidDate: '2024-11-30'
    }
  ];

  const currentSalary = {
    basic: 50000,
    hra: 15000,
    transport: 2000,
    medical: 3000,
    bonus: 5000,
    pf: 6000,
    tax: 8000,
    insurance: 1000
  };

  const downloadPayslip = (month) => {
    console.log('Downloading payslip for:', month);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-gray-600 mt-1">View and download your salary information</p>
      </div>

      {/* Current Salary Breakdown */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Salary Structure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-900 mb-4 text-green-600">Earnings</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">₹{currentSalary.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HRA</span>
                <span className="font-medium">₹{currentSalary.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport Allowance</span>
                <span className="font-medium">₹{currentSalary.transport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Medical Allowance</span>
                <span className="font-medium">₹{currentSalary.medical.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus</span>
                <span className="font-medium">₹{currentSalary.bonus.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Total Earnings</span>
                  <span>₹{(currentSalary.basic + currentSalary.hra + currentSalary.transport + currentSalary.medical + currentSalary.bonus).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4 text-red-600">Deductions</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Provident Fund</span>
                <span className="font-medium">₹{currentSalary.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Income Tax</span>
                <span className="font-medium">₹{currentSalary.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance</span>
                <span className="font-medium">₹{currentSalary.insurance.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-red-600">
                  <span>Total Deductions</span>
                  <span>₹{(currentSalary.pf + currentSalary.tax + currentSalary.insurance).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Net Salary</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{(currentSalary.basic + currentSalary.hra + currentSalary.transport + currentSalary.medical + currentSalary.bonus - currentSalary.pf - currentSalary.tax - currentSalary.insurance).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payslip History */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Payslip History</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field w-auto"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Month</th>
                <th className="text-left p-4">Basic Salary</th>
                <th className="text-left p-4">Bonus</th>
                <th className="text-left p-4">Deductions</th>
                <th className="text-left p-4">Net Salary</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip, index) => (
                <tr key={index} className="table-row">
                  <td className="p-4 font-medium text-gray-900">{payslip.month}</td>
                  <td className="p-4 text-gray-600">₹{payslip.basicSalary.toLocaleString()}</td>
                  <td className="p-4 text-green-600">₹{payslip.bonus.toLocaleString()}</td>
                  <td className="p-4 text-red-600">₹{(payslip.deductions + payslip.tax).toLocaleString()}</td>
                  <td className="p-4 font-bold text-gray-900">₹{payslip.netSalary.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="status-badge status-approved">
                      {payslip.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => downloadPayslip(payslip.month)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
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

export default EmployeePayroll;