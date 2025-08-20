// routes/notifications.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { sendNotification } = require("../server");

// GET /api/notifications - Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, read } = req.query;

    let query = { recipient: req.user.employeeId };

    if (type) query.type = type;
    if (read !== undefined) query.read = read === "true";

    const notifications = await Notification.find(query)
      .populate("sender", "firstName lastName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
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

// POST /api/notifications - Send notification
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "manager"]),
  async (req, res) => {
    try {
      const { recipients, title, message, type, priority, actionUrl } =
        req.body;

      const notifications = [];

      for (const recipientId of recipients) {
        const notification = new Notification({
          recipient: recipientId,
          sender: req.user.employeeId,
          title,
          message,
          type,
          priority,
          actionUrl,
        });

        notifications.push(notification);
      }

      await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: "Notifications sent successfully",
        data: notifications,
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

// PUT /api/notifications/:id/read - Mark notification as read
router.put(
  "/:id/approve",
  authenticateToken,
  authorizeRoles(["admin", "manager"]),
  async (req, res) => {
    try {
      const leave = await Leave.findById(req.params.id).populate("employee");

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      // Update leave status
      leave.status = "approved";
      leave.approvedBy = req.user.employeeId;
      leave.approvedAt = new Date();
      await leave.save();

      // Deduct leave balance
      const employee = await Employee.findById(leave.employee._id);
      if (employee.leaveBalance[leave.leaveType] !== undefined) {
        employee.leaveBalance[leave.leaveType] -= leave.days;
        await employee.save();
      }

      // Save notification in DB
      const notification = await Notification.create({
        recipient: leave.employee._id,
        sender: req.user._id,
        title: "Leave Approved",
        message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved.`,
        type: "leave",
        priority: "medium",
      });

      // Send real-time notification
      sendNotification(leave.employee._id, notification);

      res.json({
        success: true,
        message: "Leave request approved successfully",
        data: leave,
        notification,
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
