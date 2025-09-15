// routes/employees.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const User = require("../models/user");
const Task = require("../models/tasks");
const Department = require("../models/department");
const Attendance = require("../models/attendance");
const Position = require("../models/Position");
const Leave = require("../models/leave");
const Payroll = require("../models/Payroll");
const cacheService = require("../Services/mockCacheService");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Test route to check if basic operations work
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Employee routes are working" });
});

// GET /api/employees - Get all employees (Admin only) - OPTIMIZED
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      console.log('Fetching employees...');
      
      // Simple query without complex services
      const employees = await Employee.find({ isActive: true })
        .populate('department', 'name')
        .populate('position', 'title')
        .populate('manager', 'firstName lastName')
        .select('firstName lastName employeeId email department position isActive joiningDate createdAt')
        .sort({ createdAt: -1 });

      console.log(`Found ${employees.length} employees`);

      res.json({
        success: true,
        data: employees,
        total: employees.length,
        message: "Employees fetched successfully"
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// GET /api/employees/me - Get current employee profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.employeeId)
      .populate("userId", "name email profilePicture role")
      .populate("department", "name")
      .populate("position", "title")
      .populate("manager", "firstName lastName");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const empObj = employee.toObject();

    // flatten userId fields into main object
    const flattened = {
      ...empObj,
      email: empObj.userId?.email,
      name: empObj.userId?.name,
      profilePicture: empObj.userId?.profilePicture,
      role: empObj.userId?.role,
    };

    // remove userId object completely
    delete flattened.userId;

    res.json({
      success: true,
      data: flattened,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/employees/:id - Get specific employee
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate("userId", "name email profilePicture")
        .populate("department", "name")
        .populate("position", "title")
        .populate("manager", "firstName lastName");

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.json({
        success: true,
        data: employee,
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

// POST /api/employees - Create new employee (Admin only)

router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        salary,
        joiningDate,
        address,
        emergencyContact,
      } = req.body;

      // 1️⃣ Validate department
      const departmentDoc = await Department.findOne({
        name: new RegExp(`^${department}$`, "i"),
      });
      if (!departmentDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid department" });
      }

      // 2️⃣ Validate position
      const positionDoc = await Position.findOne({
        title: new RegExp(`^${position}$`, "i"),
      });
      if (!positionDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid position" });
      }

      // 3️⃣ Create user account
      const user = new User({
        name: `${firstName} ${lastName}`,
        email,
        password: "123456", // Default password
        role: "employee",
      });
      await user.save();

      // 4️⃣ Generate employee ID
      const employees = await Employee.find({}, "employeeId").lean();
      let newIdNum = 1;

      if (employees.length > 0) {
        // Extract all numeric parts
        const usedIds = employees.map((e) =>
          parseInt(e.employeeId.replace("EMP", ""), 10)
        );

        // Find smallest missing number
        usedIds.sort((a, b) => a - b);
        newIdNum = 1;
        for (let i = 0; i < usedIds.length; i++) {
          if (usedIds[i] !== newIdNum) break;
          newIdNum++;
        }
      }

      const employeeId = `EMP${String(newIdNum).padStart(3, "0")}`;

      // 5️⃣ Create employee profile
      const employee = new Employee({
        userId: user._id,
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        department: departmentDoc._id, // ✅ Reference ID
        position: positionDoc._id, // ✅ Reference ID
        salary,
        joiningDate,
        address,
        emergencyContact,
      });

      await employee.save();

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee,
      });
    } catch (error) {
      console.error("Error creating employee:", error);

      // Handle duplicate ID race condition
      if (error.code === 11000 && error.keyPattern?.employeeId) {
        return res.status(409).json({
          success: false,
          message: "Duplicate employee ID, please try again.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Employee updates their own profile
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Only allow self-update
    if (req.user.role === "employee" && req.user.employeeId !== req.params.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      bloodGroup,
      address = {},
      emergencyContact = {},
    } = req.body;

    const updateData = {
      firstName: firstName ?? employee.firstName,
      lastName: lastName ?? employee.lastName,
      email: email ?? employee.email,
      phone: phone ?? employee.phone,
      dateOfBirth: dateOfBirth ?? employee.dateOfBirth,
      bloodGroup: bloodGroup ?? employee.bloodGroup,
      address: { ...employee.address, ...address },
      emergencyContact: { ...employee.emergencyContact, ...emergencyContact },
    };

    // Also update linked user account if needed
    const userUpdate = {};
    if (firstName || lastName)
      userUpdate.name = `${firstName ?? employee.firstName} ${
        lastName ?? employee.lastName
      }`;
    if (email) userUpdate.email = email;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(employee.userId, userUpdate, { new: true });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("userId", "name email profilePicture isActive");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ Admin update route
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const employeeId = req.params.id;

      const employee = await Employee.findById(employeeId).populate("userId");
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      }

      let {
        firstName,
        lastName,
        email,
        phone,
        salary,
        department,
        position,
        joinDate,
        address = {},
        emergencyContact = {},
        isActive,
      } = req.body;

      // 🔑 If department is provided → fetch its ObjectId
      let departmentId = employee.department;
      if (department) {
        const departmentDoc = await Department.findOne({
          name: new RegExp(`^${department}$`, "i"),
        });
        if (!departmentDoc) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid department" });
        }
        departmentId = departmentDoc._id;
      }

      // 🔑 If position is provided → fetch its ObjectId
      let positionId = employee.position;
      if (position) {
        const positionDoc = await Position.findOne({
          title: new RegExp(`^${position}$`, "i"),
        });
        if (!positionDoc) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid position" });
        }
        positionId = positionDoc._id;
      }

      // ✅ Employee updates
      const updateData = {
        firstName: firstName ?? employee.firstName,
        lastName: lastName ?? employee.lastName,
        email: email ?? employee.email,
        phone: phone ?? employee.phone,
        salary: salary ?? employee.salary,
        department: departmentId,
        position: positionId,
        joinDate: joinDate ?? employee.joinDate,
        address: { ...employee.address, ...address },
        emergencyContact: { ...employee.emergencyContact, ...emergencyContact },
        isActive: isActive ?? employee.isActive,
      };

      await Employee.findByIdAndUpdate(employeeId, updateData, {
        new: true,
        runValidators: true,
      });

      // ✅ User updates
      const userUpdate = {};
      if (firstName || lastName) {
        userUpdate.name = `${firstName || employee.firstName} ${
          lastName || employee.lastName
        }`;
      }
      if (email) userUpdate.email = email;
      if (isActive !== undefined) userUpdate.isActive = isActive;

      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(employee.userId._id, userUpdate, {
          new: true,
        });
      }

      const finalEmployee = await Employee.findById(employeeId)
        .populate("userId", "name email profilePicture isActive")
        .populate("department", "name") // so frontend gets full info
        .populate("position", "title");

      res.json({
        success: true,
        message: "Employee updated successfully",
        data: finalEmployee,
      });
    } catch (error) {
      console.error("Admin update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// DELETE /api/employees/:id - Delete employee (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      console.log('Deleting employee with ID:', req.params.id);
      
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      console.log('Found employee:', employee.firstName, employee.lastName);

      // Just delete the employee record for now - simplified approach
      console.log('Deleting employee record...');
      await Employee.findByIdAndDelete(req.params.id);

      console.log('Employee deleted successfully');
      res.json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);



// GET /api/employees/stats/:id - Get employee statistics
router.get("/stats/:id", authenticateToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.id);

    // Run both aggregations in parallel
    const [attendanceStats, taskStats] = await Promise.all([
      Attendance.aggregate([
        { $match: { employee: employeeId } },
        {
          $group: {
            _id: null,
            totalDays: { $sum: 1 },
            presentDays: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
            absentDays: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
            lateDays: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        { $match: { assignedTo: employeeId } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            activeTasks: {
              $sum: { $cond: [{ $in: ["$status", ["pending", "in-progress"]] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        attendance: attendanceStats[0] || {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
        },
        tasks: taskStats[0] || {
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});



module.exports = router;
