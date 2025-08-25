const Attendance = require("../models/attendance.js");
const Employee = require("../models/Employee.js");

/**
 * POST /api/reports/attendance
 * body: { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD", departmentId?: string }
 * Returns KPIs + timeseries for charts
 */
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.body;

    // ✅ 1. Validate request
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    // ✅ 2. Build time range
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include whole end day

    // ✅ 3. Restrict to employees in a department (if given)
    let employeeIds = [];
    if (departmentId) {
      const employees = await Employee.find({
        department: departmentId,
      }).select("_id");
      employeeIds = employees.map((e) => e._id);
    }

    // ✅ 4. Build MongoDB query filter
    const match = { date: { $gte: start, $lte: end } };
    if (employeeIds.length) match.employee = { $in: employeeIds };

    // ✅ 5. Summary counts (Present, Absent, Late)
    // 5. Summary counts (Present, Absent, Late)
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
      totals.total > 0
        ? Number(((present / totals.total) * 100).toFixed(2))
        : 0;

    // 6. Time-series grouping (day wise for charts)
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
      item.statuses.forEach((s) => {
        if (s.status === "present") rec.Present = s.count;
        if (s.status === "absent") rec.Absent = s.count;
        if (s.status === "late") rec.Late = s.count;
      });
      return rec;
    });

    // ✅ 7. Send response
    return res.json({
      success: true,
      data: {
        kpis: {
          averageAttendance: averageAttendancePct,
          presentCount: present,
          absentCount: absent,
          lateCount: late,
          totalMarked: totals.total,
          employeeScope: employeeIds.length || "All",
        },
        series, // ready for recharts
      },
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { getAttendanceReport };
