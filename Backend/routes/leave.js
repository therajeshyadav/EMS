// routes/leaves.js
const express = require("express");
const router = express.Router();
const Leave = require("../models/leave");
const Employee = require("../models/Employee");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { sendNotification } = require("../server");
const Notification = require("../models/Notification");

// GET /api/leaves - Get all leave requests
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      // Force limit = 3 always
      const page = parseInt(req.query.page) || 1;
      const limit = 3;
      const status = req.query.status;

      // Build query object
      const q = {};
      if (status && status !== "all") {
        q.status = status;
      }

      // Fetch leaves with pagination
      const leaves = await Leave.find(q)
        .populate("employee", "firstName lastName")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      // Count total matching documents
      const total = await Leave.countDocuments(q);
      // --- NEW: Stats across ALL leaves (ignores pagination) ---
      const [pending, approved, rejected, grandTotal] = await Promise.all([
        Leave.countDocuments({ status: "pending" }),
        Leave.countDocuments({ status: "approved" }),
        Leave.countDocuments({ status: "rejected" }),
        Leave.countDocuments(),
      ]);
      // Send response with pagination info
      res.json({
        success: true,
        data: leaves,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
        stats: {
          pending,
          approved,
          rejected,
          total: grandTotal,
        },
      });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 📌 Approve leave
router.put(
  "/:id/approve",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status: "approved", approvedBy: req.user.id },
        { new: true }
      ).populate("employee", "firstName lastName");

      if (!leave)
        return res
          .status(404)
          .json({ success: false, message: "Leave not found" });

      res.json({ success: true, data: leave });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 📌 Reject leave
router.put(
  "/:id/reject",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { rejectionReason } = req.body;

      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status: "rejected", rejectionReason, approvedBy: req.user.id },
        { new: true }
      ).populate("employee", "firstName lastName");

      if (!leave)
        return res
          .status(404)
          .json({ success: false, message: "Leave not found" });

      res.json({ success: true, data: leave });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/leaves - Submit leave request
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, documents } = req.body;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const leaveBalance = employee.leaveBalance[leaveType];
    if (leaveBalance === undefined) {
      return res.status(400).json({
        success: false,
        message: `Invalid leave type: ${leaveType}`,
      });
    }
    if (days > leaveBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${leaveBalance} days`,
      });
    }

    const leave = new Leave({
      employee: req.user.employeeId,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      documents,
    });

    await leave.save();

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// // PUT /api/leaves/:id/approve - Approve leave request (Admin/Manager only)
// router.put(
//   "/:id/approve",
//   authenticateToken,
//   authorizeRoles(["admin", "manager"]),
//   async (req, res) => {
//     try {
//       const leave = await Leave.findById(req.params.id);

//       if (!leave) {
//         return res.status(404).json({
//           success: false,
//           message: "Leave request not found",
//         });
//       }

//       leave.status = "approved";
//       leave.approvedBy = req.user.employeeId;
//       leave.approvedAt = new Date();

//       // Deduct leave balance
//       const employee = await Employee.findById(leave.employee);
//       employee.leaveBalance[leave.leaveType] -= leave.days;
//       await employee.save();

//       await leave.save();

//       res.json({
//         success: true,
//         message: "Leave request approved successfully",
//         data: leave,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Server error",
//         error: error.message,
//       });
//     }
//   }
// );

// PUT /api/leaves/:id/reject - Reject leave request (Admin/Manager only)
// router.put(
//   "/:id/reject",
//   authenticateToken,
//   authorizeRoles(["admin", "manager"]),
//   async (req, res) => {
//     try {
//       const { rejectionReason } = req.body;

//       const leave = await Leave.findById(req.params.id);

//       if (!leave) {
//         return res.status(404).json({
//           success: false,
//           message: "Leave request not found",
//         });
//       }

//       leave.status = "rejected";
//       leave.approvedBy = req.user.employeeId;
//       leave.approvedAt = new Date();
//       leave.rejectionReason = rejectionReason;

//       await leave.save();

//       res.json({
//         success: true,
//         message: "Leave request rejected successfully",
//         data: leave,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Server error",
//         error: error.message,
//       });
//     }
//   }
// );

// GET /api/leaves/balance/:employeeId - Get leave balance
router.get("/balance/:employeeId", authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    console.log("employee", employee);

    const leaveBalance = employee.leaveBalance;
    console.log(leaveBalance);
    const leaves = await Leave.find({
      employee: employeeId,
      status: "approved",
    }).lean();

    console.log("leaves", leaves);

    const used = leaves.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + leave.days;
      return acc;
    }, {});

    console.log("used", used);

    const balance = {};
    for (let type in leaveBalance) {
      balance[type] = leaveBalance[type] - (used[type] || 0);
    }

    console.log("balance", balance);

    const history = await Leave.find({ employee: employeeId })
      .sort({ createdAt: -1 })
      .lean();
    console.log("history", history);
    res.json({
      success: true,
      data: {
        balance,
        history,
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

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId; // from JWT
    const { page = 1, limit = 3 } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Query leaves for this employee
    const query = { employee: employeeId };

    const totalRecords = await Leave.countDocuments(query);

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 }) // latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        history: leaves,
      },
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    });
  } catch (err) {
    console.error("Error fetching leave history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
