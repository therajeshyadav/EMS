// services/attendanceReportService.js
const Attendance = require("../models/attendance");
const Employee = require("../models/Employee");

async function generateAttendanceReport({ startDate, endDate, departmentId }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  let employeeIds = [];
  if (departmentId) {
    const employees = await Employee.find({ department: departmentId }).select(
      "_id"
    );
    employeeIds = employees.map((e) => e._id);
  }

  const match = { date: { $gte: start, $lte: end } };
  if (employeeIds.length) match.employee = { $in: employeeIds };

  // ✅ Summary counts
  const summaryAgg = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: { $toLower: "$status" }, count: { $sum: 1 } } },
  ]);

  const totals = summaryAgg.reduce(
    (acc, cur) => {
      acc.byStatus[cur._id] = cur.count;
      acc.total += cur.count;
      return acc;
    },
    { total: 0, byStatus: {} }
  );

  const present = totals.byStatus["present"] || 0;
  const absent = totals.byStatus["absent"] || 0;
  const late = totals.byStatus["late"] || 0;

  const averageAttendancePct =
    totals.total > 0 ? Number(((present / totals.total) * 100).toFixed(2)) : 0;

  // ✅ Series data (daily breakdown)
  const seriesAgg = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          y: { $year: "$date" },
          m: { $month: "$date" },
          d: { $dayOfMonth: "$date" },
          status: { $toLower: "$status" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { y: "$_id.y", m: "$_id.m", d: "$_id.d" },
        statuses: { $push: { status: "$_id.status", count: "$count" } },
        total: { $sum: "$count" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
  ]);

  const series = seriesAgg.map((item) => {
    const date = new Date(item._id.y, item._id.m - 1, item._id.d);
    const rec = {
      date: date.toISOString().slice(0, 10),
      Present: 0,
      Absent: 0,
      Late: 0,
      Total: item.total,
    };

    // ✅ Fixed mapping (was bug before)
    item.statuses.forEach((s) => {
      if (s.status === "present") rec.Present = s.count;
      if (s.status === "absent") rec.Absent = s.count;
      if (s.status === "late") rec.Late = s.count;
    });

    return rec;
  });

  return {
    kpis: {
      averageAttendance: averageAttendancePct,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      totalMarked: totals.total,
      employeeScope: employeeIds.length || "All",
    },
    series,
  };
}

module.exports = { generateAttendanceReport };
