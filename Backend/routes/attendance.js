// routes/attendance.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// GET /api/attendance - Get all attendance records
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        employee,
        startDate,
        endDate,
        status,
      } = req.query;

      let query = {};

      if (employee) {
        query.employee = employee;
      }

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (status) {
        query.status = status;
      }

      const attendance = await Attendance.find(query)
        .populate("employee", "firstName lastName employeeId")
        .populate("approvedBy", "firstName lastName")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: -1 });

      const total = await Attendance.countDocuments(query);

      res.json({
        success: true,
        data: attendance,
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

router.post("/check-in", authenticateToken, async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || !location.type || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Location is required (type & coordinates)",
      });
    }

    // ✅ Fix date issue (always store as YYYY-MM-DD string)
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // e.g. "2025-08-20"

    // 🔎 Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: dateString, // 👈 ab yahan string compare hoga
    });

    if (existingAttendance && existingAttendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    let attendance;

    if (existingAttendance) {
      // 🔄 Update existing record
      attendance = existingAttendance;
    } else {
      // 🆕 Create new record
      attendance = new Attendance({
        employee: req.user.employeeId,
        date: dateString, // 👈 string assign
      });
    }

    attendance.checkIn = {
      time: new Date(),
      location: {
        type: location.type,
        coordinates: location.coordinates, // [longitude, latitude]
      },
    };

    // ✅ Mark status based on time
    const checkInTime = new Date();
    const workStartTime = new Date();
    workStartTime.setHours(9, 0, 0, 0); // 9 AM

    if (checkInTime > workStartTime) {
      attendance.status = "late";
    } else {
      attendance.status = "present";
    }

    await attendance.save();

    return res.json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// POST /api/attendance/check-out - Employee check-out
router.post("/check-out", authenticateToken, async (req, res) => {
  try {
    const { location } = req.body;

    // ✅ Always use YYYY-MM-DD string for date
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: dateString, // 👈 string match
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "No check-in record found for today",
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({
        success: false,
        message: "Already checked out today",
      });
    }

    attendance.checkOut = {
      time: new Date(),
      location: location || null,
    };

    // ⏱ Calculate working hours
    const checkInTime = new Date(attendance.checkIn.time);
    const checkOutTime = new Date(attendance.checkOut.time);
    const workingMinutes = Math.floor(
      (checkOutTime - checkInTime) / (1000 * 60)
    );

    attendance.workingHours = workingMinutes;

    // ⏰ Overtime if > 8 hours
    if (workingMinutes > 480) {
      attendance.overtime = workingMinutes - 480;
    } else {
      attendance.overtime = 0;
    }

    await attendance.save();

    return res.json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// PUT /api/attendance/:id - Update attendance record
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const attendance = await Attendance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate("employee", "firstName lastName employeeId");

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      res.json({
        success: true,
        message: "Attendance updated successfully",
        data: attendance,
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

// router.get("/me", authenticateToken, async (req, res) => {
//   try {
//     const employeeId = req.user.employeeId; // from JWT payload
//     const { page = 1, limit = 10, startDate, endDate } = req.query;

//     const query = { employee: employeeId };

//     // Apply date filter if given
//     if (startDate && endDate) {
//       query.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // Get paginated attendance records
//     const attendance = await Attendance.find(query)
//       .sort({ date: -1 }) // latest first
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const totalRecords = await Attendance.countDocuments(query);

//     // ✅ Calculate statistics
//     const allRecords = await Attendance.find(query);
//     console.log(allRecords);
//     const present = allRecords.filter(
//       (r) => r.status === "present" || r.status === "late"
//     ).length;
//     const absent = allRecords.filter((r) => r.status === "absent").length;

//     const late = allRecords.filter((r) => r.status === "late").length;
//     const totalDays = present + absent;
//     const rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

//     res.json({
//       success: true,
//       data: {
//         summary: { present, absent, late, rate },
//         history: attendance,
//       },
//       pagination: {
//         total: totalRecords,
//         page: Number(page),
//         limit: Number(limit),
//         totalPages: Math.ceil(totalRecords / limit),
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// });

const getWorkingDays = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();
    // skip weekends (0 = Sunday, 6 = Saturday)
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current).toDateString());
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const query = { employee: employeeId };

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalRecords = await Attendance.countDocuments(query);

    // Stats calculation
    const allRecords = await Attendance.find(query);

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const workingDays = getWorkingDays(start, end);

    const presentDays = allRecords
      .filter((r) => r.status === "present" || r.status === "late")
      .map((r) => new Date(r.date).toDateString());

    const absentDays = workingDays.filter((d) => !presentDays.includes(d));

    const late = allRecords.filter((r) => r.status === "late").length;
    const totalDays = workingDays.length;
    const rate =
      totalDays > 0 ? Math.round((presentDays.length / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          present: presentDays.length,
          absent: absentDays.length,
          late,
          rate,
        },
        history: attendance,
      },
      pagination: {
        total: totalRecords,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/attendance/reports - Get attendance reports
router.get("/reports", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const reports = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      { $unwind: "$employeeData" },
      {
        $group: {
          _id: "$employee",
          employeeName: {
            $first: {
              $concat: [
                "$employeeData.firstName",
                " ",
                "$employeeData.lastName",
              ],
            },
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          lateDays: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          totalWorkingHours: { $sum: "$workingHours" },
          totalOvertime: { $sum: "$overtime" },
        },
      },
      {
        $addFields: {
          attendanceRate: {
            $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: reports,
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
