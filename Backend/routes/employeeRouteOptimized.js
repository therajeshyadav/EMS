// routes/employeeRouteOptimized.js - Fallback optimized version
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const User = require("../models/user");
const Task = require("../models/tasks");
const Department = require("../models/department");
const Attendance = require("../models/attendance");
const Position = require("../models/Position");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// GET /api/employees - Optimized employee list
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search, department, status } = req.query;
      
      // Build optimized query
      let query = {};
      
      if (search) {
        // Use text search if available, otherwise regex
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }

      if (department) {
        query.department = department;
      }

      if (status) {
        query.isActive = status === "active";
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      // Use aggregation for better performance
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData",
            pipeline: [{ $project: { name: 1, email: 1, profilePicture: 1 } }]
          }
        },
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "departmentData",
            pipeline: [{ $project: { name: 1 } }]
          }
        },
        {
          $lookup: {
            from: "positions",
            localField: "position",
            foreignField: "_id",
            as: "positionData",
            pipeline: [{ $project: { title: 1 } }]
          }
        },
        {
          $lookup: {
            from: "employees",
            localField: "manager",
            foreignField: "_id",
            as: "managerData",
            pipeline: [{ $project: { firstName: 1, lastName: 1 } }]
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            employeeId: 1,
            email: 1,
            isActive: 1,
            createdAt: 1,
            userData: { $arrayElemAt: ["$userData", 0] },
            department: { $arrayElemAt: ["$departmentData", 0] },
            position: { $arrayElemAt: ["$positionData", 0] },
            manager: { $arrayElemAt: ["$managerData", 0] }
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [
              { $skip: (pageNum - 1) * limitNum },
              { $limit: limitNum }
            ],
            count: [{ $count: "total" }]
          }
        }
      ];

      const [result] = await Employee.aggregate(pipeline);
      const employees = result.data || [];
      const total = result.count[0]?.total || 0;

      res.json({
        success: true,
        data: employees,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error("Employee list error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// GET /api/employees/search - Optimized search endpoint
router.get(
  "/search",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const searchQuery = {
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          { employeeId: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ],
        isActive: true
      };

      const employees = await Employee.find(searchQuery, {
        firstName: 1,
        lastName: 1,
        employeeId: 1,
        email: 1
      })
      .limit(parseInt(limit))
      .lean();

      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error("Employee search error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// GET /api/employees/stats - Optimized stats endpoint
router.get(
  "/stats",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const stats = await Employee.aggregate([
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            activeEmployees: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            },
            inactiveEmployees: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
            }
          }
        }
      ]);

      const departmentStats = await Employee.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "dept"
          }
        },
        { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$dept.name",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalEmployees: 0,
            activeEmployees: 0,
            inactiveEmployees: 0
          },
          departmentBreakdown: departmentStats
        }
      });
    } catch (error) {
      console.error("Employee stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;