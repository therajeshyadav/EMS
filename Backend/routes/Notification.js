// routes/notifications.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const Department = require("../models/department");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { sendNotification } = require("../socket");

// GET /api/notifications - Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, read } = req.query;

    const query = { recipient: req.user.employeeId };
    if (type) query.type = type;
    if (read !== undefined) query.read = read === "true";

    const notifications = await Notification.find(query)
      .populate("sender", "firstName lastName")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
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

// POST /api/notifications - Send notifications
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "manager"]),
  async (req, res) => {
    try {
      console.log(req.body);
      const { recipients, title, message, type, priority, actionUrl } =
        req.body;

      if (!recipients || recipients.length === 0 || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Recipients, title and message are required",
        });
      }

      let finalRecipients = [];

      if (recipients.includes("all")) {
        const employees = await Employee.find({}, "_id");
        finalRecipients = employees.map((e) => e._id.toString());
      } else {
        // Handle department codes and individual recipients
        for (const recipient of recipients) {
          if (recipient === "all") {
            // Already handled above
            continue;
          } else if (typeof recipient === "string" && recipient.length < 24) {
            // Likely a department code, try to find department
            const dept = await Department.findOne({ 
              $or: [
                { code: { $regex: new RegExp(`^${recipient}$`, "i") } },
                { name: { $regex: new RegExp(`^${recipient}$`, "i") } }
              ]
            });
            if (dept) {
              const employees = await Employee.find({ department: dept._id }, "_id");
              finalRecipients.push(...employees.map((e) => e._id.toString()));
            }
          } else {
            // Assume it's an employee ID
            finalRecipients.push(recipient);
          }
        }
      }

      if (finalRecipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid recipients found",
        });
      }

      // ✅ Create one notification per recipient
      const notifications = await Promise.all(
        finalRecipients.map( async (recipientId) => {
          const notif = await Notification.create({
            recipient: recipientId, // 👈 single recipient
            title,
            message,
            type: type || "general",
            priority: priority || "medium", // 👈 fixed enum (medium default)
            actionUrl: actionUrl || null,
            sender: req.user.employeeId,
          });
          sendNotification(recipientId, notif);

          return notif;
        })
      );

      res.status(201).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.employeeId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.employeeId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
