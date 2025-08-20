// routes/payroll.js
const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { calculateAndSavePayroll } = require("../Services/payrollService");

// ---------------- Existing routes ----------------

// GET /api/payroll - Get all payroll records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, month, year, employee } = req.query;

    let query = {};

    if (req.user.role !== "admin") {
      query.employee = req.user.employeeId;
    } else if (employee) {
      query.employee = employee;
    }

    if (month) query.month = month;
    if (year) query.year = year;

    const payroll = await Payroll.find(query)
      .populate("employee", "firstName lastName employeeId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1, month: -1 });

    const total = await Payroll.countDocuments(query);

    res.json({
      success: true,
      data: payroll,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ---------------- NEW ROUTE ----------------

// GET /api/payroll/my - Get payrolls for logged-in employee
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const year = parseInt(req.query.year);

    // build query
    const query = { employee: req.user.employeeId };
    if (year) query.year = year;

    // count
    const total = await Payroll.countDocuments(query);

    // fetch
    const payrolls = await Payroll.find(query)
      .populate("employee", "firstName lastName employeeId")
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      payrolls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


// ---------------- Existing routes ----------------

// POST /api/payroll/generate - Generate payslip
router.post(
  "/generate",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { employeeId, month, year } = req.body;

      const existingPayroll = await Payroll.findOne({
        employee: employeeId,
        month,
        year,
      });

      if (existingPayroll) {
        return res.status(400).json({
          success: false,
          message: "Payroll already exists for this month",
        });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const result = await calculateAndSavePayroll(employee, month, year);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "Payroll generated successfully",
        data: result.payroll, // 🔥 fixed: use result.payroll instead of undefined
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// POST /api/payroll/process - Process monthly payroll
router.post(
  "/process",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { month, year } = req.body;

      const employees = await Employee.find({ isActive: true });
      const processedPayrolls = [];

      for (const employee of employees) {
        const result = await calculateAndSavePayroll(employee, month, year);
        if (result.success) {
          processedPayrolls.push(employee.employeeId);
        }
      }

      res.json({
        success: true,
        message: `Payroll processed for ${processedPayrolls.length} employees`,
        data: processedPayrolls,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;
