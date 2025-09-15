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
// POST /api/payroll/generate - Generate payslip
router.get("/payslip/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Month and Year are required",
      });
    }

    // Find employee by employeeId (EMP001)
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    // Find payroll entry for employee
    const payslip = await Payroll.findOne({
      employee: employee._id,
      month: Number(month),
      year: Number(year),
    }).populate("employee");

    if (!payslip) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Payslip not found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: payslip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Server error",
      error: error.message,
    });
  }
});

// ---------------- Existing routes ----------------

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
// routes/payroll.js
router.post("/process", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { month, year } = req.body;

    // find all employees
    const employees = await Employee.find();

    const payrolls = [];
    for (let emp of employees) {
      const basicSalary = emp.salary;
      const deductions = { pf: 2000, tax: 5000 }; // your logic here
      const allowances = { hra: 3000, da: 2000 };

      const netSalary = basicSalary + allowances.hra + allowances.da - (deductions.pf + deductions.tax);

      const payroll = await Payroll.findOneAndUpdate(
        { employee: emp._id, month, year },
        {
          employee: emp._id,
          month,
          year,
          basicSalary,
          deductions,
          allowances,
          netSalary,
          status: "processed", // 👈 important
        },
        { upsert: true, new: true }
      );

      payrolls.push(payroll);
    }

    res.json({ success: true, data: payrolls });
  } catch (err) {
    console.error("❌ Error processing payroll:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Mark payroll as paid
router.put(
  "/:employeeId/mark-paid",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.params);
      const { employeeId } = req.params;
      const { month, year, transactionId } = req.body;

      const payroll = await Payroll.findOneAndUpdate(
        {
          employee: employeeId, // ✅ match ObjectId
          month: Number(month), // ✅ convert from string if needed
          year: Number(year),
        },
        {
          status: "paid",
          paidAt: new Date(),
          transactionId: transactionId || `TXN-${Date.now()}`,
        },
        { new: true }
      );

      if (!payroll) {
        return res
          .status(404)
          .json({ success: false, message: "Payroll not found" });
      }

      res.json({ success: true, data: payroll });
    } catch (err) {
      console.error("❌ Error marking payroll as paid:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
