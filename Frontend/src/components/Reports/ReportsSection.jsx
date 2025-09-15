import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  Download,
  Calendar,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import { ReportsApi } from "../../api/api";
import { AuthContext } from "../../context/Authprovider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ReportsSection = () => {
  const { authState } = useContext(AuthContext);
  const [selectedReport, setSelectedReport] = useState("attendance");
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  const reportTypes = [
    { id: "attendance", name: "Attendance Report", icon: Clock },
    { id: "leave", name: "Leave Report", icon: Calendar },
    { id: "payroll", name: "Payroll Report", icon: TrendingUp },
    { id: "performance", name: "Performance Report", icon: BarChart3 },
    { id: "employee", name: "Employee Report", icon: Users },
  ];

  const fetchAttendance = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await ReportsApi.getAttendance(
        dateRange.startDate,
        dateRange.endDate,
        authState.token
      );
      console.log(res.data.data);
      console.log(res.data);
      console.log(res);
      if (res.data.success) {
        setReportData(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch report");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when selectedReport = attendance
  useEffect(() => {
    if (selectedReport === "attendance" && authState?.token) {
      fetchAttendance();
    } else {
      setReportData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedReport,
    dateRange.startDate,
    dateRange.endDate,
    authState?.token,
  ]);

  const exportReport = async (format) => {
    try {
      const res = await ReportsApi.exportAttendance(
        dateRange.startDate,
        dateRange.endDate,
        format
      );

      const blob = new Blob([res.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : format === "csv"
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const series = useMemo(() => reportData?.series || [], [reportData]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports and insights
          </p>
        </div>
        {selectedReport === "attendance" && (
          <button
            onClick={fetchAttendance}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Types */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Types
            </h3>
            <div className="space-y-2">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      selectedReport === report.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "hover:bg-gray-50 text-gray-700"
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

        {/* Config + Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-6 card-shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((d) => ({ ...d, startDate: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setDateRange((d) => ({ ...d, endDate: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (selectedReport === "attendance") fetchAttendance();
                    // else: call other report APIs when you build them
                  }}
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => exportReport("pdf")}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => exportReport("excel")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => exportReport("csv")}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Preview
            </h3>

            {selectedReport === "attendance" && (
              <>
                {error && (
                  <div className="p-3 mb-4 rounded bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                {reportData ? (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.kpis.averageAttendance}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Average Attendance
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.kpis.presentCount}
                        </div>
                        <div className="text-sm text-gray-600">Present</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {reportData.kpis.absentCount}
                        </div>
                        <div className="text-sm text-gray-600">Absent</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {reportData.kpis.lateCount}
                        </div>
                        <div className="text-sm text-gray-600">Late</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Present" />
                          <Line type="monotone" dataKey="Absent" />
                          <Line type="monotone" dataKey="Late" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      {loading
                        ? "Loading..."
                        : "Generate a report to see results"}
                    </p>
                  </div>
                )}
              </>
            )}

            {selectedReport !== "attendance" && (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Build similar APIs for: {selectedReport}
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
