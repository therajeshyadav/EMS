const express = require("express");
const {
  getAttendanceReport,
} = require("../controller/attendenceReportController.js");
const {
  exportAttendanceReport,
} = require("../controller/attendenceExportController.js");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.js");

const router = express.Router();

router.post(
  "/attendance",
  authenticateToken,
  authorizeRoles(["admin", "hr"]),
  getAttendanceReport
);
router.post(
  "/attendance/export/:format",
  authenticateToken,
  authorizeRoles(["admin", "hr"]),
  exportAttendanceReport
);
module.exports = router;
