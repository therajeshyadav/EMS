// routes/departments.js
const express = require("express");
const router = express.Router();
const Department = require("../models/department");
const Employee = require("../models/Employee");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// GET /api/departments - Get all departments
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const departments = await Department.find(query)
      .populate("head", "firstName lastName employeeId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Department.countDocuments(query);

    res.json({
      success: true,
      data: departments,
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

// GET /api/departments/:id - Get specific department
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "head",
      "firstName lastName employeeId email"
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Get employees in this department
    const employees = await Employee.find({
      department: req.params.id,
      isActive: true,
    })
      .populate("position", "title")
      .select("firstName lastName employeeId position joiningDate");

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        employees,
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

// POST /api/departments - Create new department (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { name, code, description, head } = req.body;

      // Check if department code already exists
      const existingDepartment = await Department.findOne({ code });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: "Department code already exists",
        });
      }

      const department = new Department({
        name,
        code,
        description,
        head,
      });

      await department.save();

      res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: department,
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

// PUT /api/departments/:id - Update department (Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { name, code, description, head, isActive } = req.body;

      // Check if code is being changed and if it already exists
      if (code) {
        const existingDepartment = await Department.findOne({
          code,
          _id: { $ne: req.params.id },
        });
        if (existingDepartment) {
          return res.status(400).json({
            success: false,
            message: "Department code already exists",
          });
        }
      }

      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { name, code, description, head, isActive },
        { new: true, runValidators: true }
      ).populate("head", "firstName lastName employeeId");

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      res.json({
        success: true,
        message: "Department updated successfully",
        data: department,
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

// DELETE /api/departments/:id - Delete department (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      // Check if department has employees
      const employeeCount = await Employee.countDocuments({
        department: req.params.id,
        isActive: true,
      });

      if (employeeCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete department. ${employeeCount} employees are still assigned to this department.`,
        });
      }

      await Department.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Department deleted successfully",
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

// GET /api/departments/:id/employees - Get employees in department
router.get("/:id/employees", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, position } = req.query;

    let query = {
      department: req.params.id,
      isActive: true,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    if (position) {
      query.position = position;
    }

    const employees = await Employee.find(query)
      .populate("position", "title")
      .populate("manager", "firstName lastName")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ firstName: 1 });

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
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

// GET /api/departments/:id/stats - Get department statistics
router.get("/:id/stats", authenticateToken, async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Employee count
    const employeeCount = await Employee.countDocuments({
      department: departmentId,
      isActive: true,
    });

    // Gender distribution
    const genderStats = await Employee.aggregate([
      {
        $match: {
          department: mongoose.Types.ObjectId(departmentId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    // Average salary
    const salaryStats = await Employee.aggregate([
      {
        $match: {
          department: mongoose.Types.ObjectId(departmentId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: "$salary" },
          minSalary: { $min: "$salary" },
          maxSalary: { $max: "$salary" },
          totalSalary: { $sum: "$salary" },
        },
      },
    ]);

    // Position distribution
    const positionStats = await Employee.aggregate([
      {
        $match: {
          department: mongoose.Types.ObjectId(departmentId),
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "positions",
          localField: "position",
          foreignField: "_id",
          as: "positionData",
        },
      },
      { $unwind: "$positionData" },
      {
        $group: {
          _id: "$positionData.title",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        employeeCount,
        genderStats,
        salaryStats: salaryStats[0] || {
          avgSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          totalSalary: 0,
        },
        positionStats,
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

// PUT /api/departments/:id/head - Assign department head (Admin only)
router.put(
  "/:id/head",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { headId } = req.body;

      // Verify employee exists and belongs to this department
      const employee = await Employee.findOne({
        _id: headId,
        department: req.params.id,
        isActive: true,
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found in this department",
        });
      }

      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { head: headId },
        { new: true }
      ).populate("head", "firstName lastName employeeId");

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      res.json({
        success: true,
        message: "Department head assigned successfully",
        data: department,
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
