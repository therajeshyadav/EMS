// routes/tasks.js
const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
const Employee = require("../models/Employee");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { sendTaskUpdate } = require("../socket");

// GET /api/tasks - Get all tasks
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        assignedTo,
        assignedBy,
      } = req.query;

      let query = {};

      // If not admin, only show assigned tasks
      if (req.user.role !== "admin") {
        query.assignedTo = req.user.employeeId;
      } else {
        if (assignedTo) query.assignedTo = assignedTo;
        if (assignedBy) query.assignedBy = assignedBy;
      }

      if (status) query.status = status;
      if (priority) query.priority = priority;

      const tasks = await Task.find(query)
        .populate("assignedTo", "firstName lastName employeeId")
        .populate("assignedBy", "firstName lastName")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Task.countDocuments(query);

      res.json({
        success: true,
        data: tasks,
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
  }
);

router.get("/me/:id", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 3, status } = req.query;
    const { id } = req.params;
    // const tasks = await Task.find({ assignedTo: id });
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    // Build query with optional status filter
    const query = { assignedTo: id };
    if (status && status !== "all") {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1, status: 1 }); // Recent tasks first, then by status priority

    const totalTasks = await Task.countDocuments(query);

    if (!tasks)
      return res
        .status(404)
        .json({ success: false, message: "No tasks found" });

    const totalNew = await Task.countDocuments({
      assignedTo: id,
      status: "pending",
    });
    const totalActive = await Task.countDocuments({
      assignedTo: id,
      status: "in-progress",
    });
    const totalCompleted = await Task.countDocuments({
      assignedTo: id,
      status: "completed",
    });
    const totalFailed = await Task.countDocuments({
      assignedTo: id,
      status: "failed",
    });

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalTasks,
        totalPages: Math.ceil(totalTasks / limitNum),
      },
      stats: {
        total: totalTasks,
        new: totalNew,
        active: totalActive,
        completed: totalCompleted,
        failed: totalFailed,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// POST /api/tasks - Create new task
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      console.log(req.body);
      const { title, description, assignedTo, priority, category, dueDate } =
        req.body;

      const employee = await Employee.findById(assignedTo);
      console.log(employee);

      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      }

      const task = new Task({
        title,
        description,
        assignedTo,
        assignedBy: req.user.employeeId,
        priority,
        category,
        dueDate,
      });
      console.log(task);
      await task.save();
      sendTaskUpdate(assignedTo, task);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
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

// PUT /api/tasks/:id - Update task
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only assigned person or admin can update
    if (
      task.assignedTo.toString() !== req.user.employeeId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "firstName lastName")
      .populate("assignedBy", "firstName lastName");

    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// PUT /api/tasks/:id/status - Update task status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
      task.progress = 100;
    }
    if (status === "in-progress") task.progress = 50;
    if (status === "failed") task.progress = 0;
    await task.save();

    res.json({
      success: true,
      message: "Task status updated successfully",
      data: task,
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
