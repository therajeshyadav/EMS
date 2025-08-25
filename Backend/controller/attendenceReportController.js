// controllers/attendanceReportController.js
const { generateAttendanceReport } = require("../Services/attendanceReportService");

const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }

    const data = await generateAttendanceReport({ startDate, endDate, departmentId });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Attendance report error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { getAttendanceReport };
