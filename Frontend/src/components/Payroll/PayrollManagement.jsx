import React, { useState, useEffect } from "react";
import { DollarSign, Download, Send, Calculator, Filter } from "lucide-react";
import { PayrollApi } from "../../api/api"; // 👈 backend API methods

const PayrollManagement = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch payroll data from backend
  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await PayrollApi.list({
        month: selectedMonth,
        year: selectedYear,
      });

      console.log("📌 Payroll API Response:", res.data);

      // ✅ Correct extraction
      const payrollArray = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : [];
      setPayrollData(payrollArray);

      setError("");
    } catch (err) {
      console.error("❌ Payroll API Error:", err);
      setError("Failed to load payroll data");
      setPayrollData([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  // 🔹 Process payroll for all employees
  const processPayroll = async () => {
    try {
      await PayrollApi.process({ month: selectedMonth, year: selectedYear });
      fetchPayroll(); // refresh
    } catch (err) {
      alert("Error processing payroll");
    }
  };

  // 🔹 Generate Payslip
  const downloadPayslip = async (employeeId, month, year) => {
    const res = await PayrollApi.payslip(employeeId, month, year);
    const data = res.data.data;

    // Convert into printable format
    const content = `
    Payslip for ${data.employee.firstName} ${data.employee.lastName} (${data.employee.employeeId})
    Month: ${data.month}/${data.year}

    Basic Salary: ${data.basicSalary}
    Allowances: HRA=${data.allowances.hra}, DA=${data.allowances.da}, TA=${data.allowances.ta}, Other=${data.allowances.other}
    Bonus: ${data.bonus}
    Overtime: ${data.overtime.amount}
    Deductions: PF=${data.deductions.pf}, Tax=${data.deductions.tax}, Insurance=${data.deductions.insurance}

    Net Salary: ${data.netSalary}
    Status: ${data.status}
    Paid At: ${data.paidAt}
    Transaction ID: ${data.transactionId}
  `;

    // Make it downloadable as text
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `payslip_${data.employee.employeeId}_${month}_${year}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary values
  const totalPayroll = Array.isArray(payrollData)
    ? payrollData.reduce((sum, emp) => sum + (emp.netSalary || 0), 0)
    : 0;

  // helper: sum all deductions
  const getTotalDeductions = (deductions) => {
    if (!deductions || typeof deductions !== "object") return 0;
    return Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
  };

  const avgSalary =
    payrollData.length > 0 ? totalPayroll / payrollData.length : 0;
  const pending = payrollData.filter((emp) => emp.status === "pending").length;

  const exportReport = () => {
    if (!payrollData.length) {
      alert("No payroll data to export");
      return;
    }

    const headers = [
      "Employee",
      "Basic Salary",
      "Bonus",
      "Deductions",
      "Tax",
      "Net Salary",
      "Status",
    ];
    const rows = payrollData.map((emp) => [
      `${emp.employee.firstName} ${emp.employee.lastName}`,
      emp.basicSalary,
      emp.bonus,
      getTotalDeductions(emp.deductions),
      emp.deductions?.tax || 0,
      emp.netSalary,
      emp.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `payroll_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markAsPaid = async (employeeId, month, year) => {
    console.log(employeeId, month, year);
    try {
      await PayrollApi.markPaid(employeeId, {
        month: String(month),
        year: String(year),
      });

      fetchPayroll(); // refresh UI
    } catch (err) {
      alert("❌ Failed to mark as paid");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employee salaries and payslips
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={processPayroll}
            className="btn-primary flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>Process Payroll</span>
          </button>
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Payroll"
          value={`₹${totalPayroll?.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <SummaryCard
          title="Employees"
          value={payrollData.length}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <SummaryCard
          title="Avg Salary"
          value={`₹${Math.round(avgSalary)?.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
        <SummaryCard
          title="Pending"
          value={pending}
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />

          {/* Month Select */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field w-auto"
          >
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field w-auto"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <p className="p-6">Loading payroll...</p>
        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>
        ) : (
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
                  <tr key={employee._id} className="table-row">
                    <td className="p-4">
                      {employee.employee?.firstName} {employee.employee?.lastName}
                    </td>
                    <td className="p-4">
                      ₹{employee.basicSalary?.toLocaleString()}
                    </td>
                    <td className="p-4 text-green-600">
                      ₹{employee.bonus?.toLocaleString()}
                    </td>
                    <td className="p-4 text-red-600">
                      ₹
                      {getTotalDeductions(employee.deductions).toLocaleString()}
                    </td>
                    <td className="p-4 text-red-600">
                      ₹{employee.deductions?.tax?.toLocaleString() || 0}
                    </td>

                    <td className="p-4 font-bold text-gray-900">
                      ₹{employee.netSalary?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`status-badge status-${employee.status}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            downloadPayslip(
                              employee.employee._id,
                              selectedMonth,
                              selectedYear
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Payslip</span>
                        </button>
                        <button
                          onClick={() =>
                            markAsPaid(
                              employee.employee._id,
                              selectedMonth,
                              selectedYear
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
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
        )}
      </div>
    </div>
  );
};

// Small card component for summary
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl p-6 card-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default PayrollManagement;
