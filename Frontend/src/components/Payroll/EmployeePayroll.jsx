import React, { useState, useEffect } from "react";
import { Download, Eye, Calendar } from "lucide-react";
import { PayrollApi } from "../../api/api";

const EmployeePayroll = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5; // fixed limit

  // fetch payrolls for employee
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const res = await PayrollApi.getme(currentPage, pageSize, selectedYear);

        if (res.data.success) {
          setPayslips(res.data.payrolls);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching payrolls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, [currentPage, selectedYear]);

  // get latest payslip for current salary card
  const currentSalary = payslips.length > 0 ? payslips[0] : null;

  const downloadPayslip = (payslip) => {
    console.log("Downloading payslip:", payslip);
    // TODO: call backend endpoint to download PDF
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-gray-600 mt-1">
          View and download your salary information
        </p>
      </div>

      {/* Current Salary Breakdown */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Current Salary Structure ({selectedYear})
        </h3>

        {currentSalary ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-4 text-green-600">
                  Earnings
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-medium">
                      ₹{currentSalary.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">HRA</span>
                    <span className="font-medium">
                      ₹{currentSalary.allowances.hra.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DA</span>
                    <span className="font-medium">
                      ₹{currentSalary.allowances.da.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TA</span>
                    <span className="font-medium">
                      ₹{currentSalary.allowances.ta.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Allowance</span>
                    <span className="font-medium">
                      ₹{currentSalary.allowances.other.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus</span>
                    <span className="font-medium">
                      ₹{currentSalary.bonus.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Total Earnings</span>
                      <span>
                        ₹
                        {(
                          currentSalary.basicSalary +
                          currentSalary.allowances.hra +
                          currentSalary.allowances.da +
                          currentSalary.allowances.ta +
                          currentSalary.allowances.other +
                          currentSalary.bonus
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4 text-red-600">
                  Deductions
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provident Fund</span>
                    <span className="font-medium">
                      ₹{currentSalary.deductions.pf.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income Tax</span>
                    <span className="font-medium">
                      ₹{currentSalary.deductions.tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-medium">
                      ₹{currentSalary.deductions.insurance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other</span>
                    <span className="font-medium">
                      ₹{currentSalary.deductions.other.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-red-600">
                      <span>Total Deductions</span>
                      <span>
                        ₹
                        {(
                          currentSalary.deductions.pf +
                          currentSalary.deductions.tax +
                          currentSalary.deductions.insurance +
                          currentSalary.deductions.other
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  Net Salary
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{currentSalary.netSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            No payroll data available for {selectedYear}
          </p>
        )}
      </div>

      {/* Payslip History */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Payslip History
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
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
              {payslips.length > 0 ? (
                payslips.map((payslip, index) => {
                  const totalDeductions =
                    payslip.deductions.pf +
                    payslip.deductions.tax +
                    payslip.deductions.insurance +
                    payslip.deductions.other;

                  return (
                    <tr key={index} className="table-row">
                      <td className="p-4 font-medium text-gray-900">
                        {new Date(
                          payslip.year,
                          payslip.month - 1
                        ).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-gray-600">
                        ₹{payslip.basicSalary.toLocaleString()}
                      </td>
                      <td className="p-4 text-green-600">
                        ₹{payslip.bonus.toLocaleString()}
                      </td>
                      <td className="p-4 text-red-600">
                        ₹{totalDeductions.toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ₹{payslip.netSalary.toLocaleString()}
                      </td>
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
                            onClick={() => downloadPayslip(payslip)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No payslips found for {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 p-4 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePayroll;
