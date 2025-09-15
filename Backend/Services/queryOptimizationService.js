// Services/queryOptimizationService.js
const Employee = require('../models/Employee');
const Attendance = require('../models/attendance');
const Payroll = require('../models/Payroll');

class QueryOptimizationService {
  // Optimized employee queries with projections
  static async getEmployeesOptimized(filters = {}, pagination = {}, projection = null) {
    const { page = 1, limit = 10 } = pagination;
    const { search, department, status } = filters;

    // Build query with indexes
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    // Default projection for list views (exclude heavy fields)
    const defaultProjection = projection || {
      firstName: 1,
      lastName: 1,
      employeeId: 1,
      email: 1,
      department: 1,
      position: 1,
      isActive: 1,
      createdAt: 1
    };

    const [employees, total] = await Promise.all([
      Employee.find(query, defaultProjection)
        .populate('department', 'name')
        .populate('position', 'title')
        .populate('manager', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Employee.countDocuments(query)
    ]);

    return {
      employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Optimized attendance queries with aggregation
  static async getAttendanceOptimized(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const { employee, status, startDate, endDate } = filters;

    const matchStage = {};
    
    if (employee) matchStage.employee = employee;
    if (status) {
      if (status === 'present') {
        matchStage.status = { $in: ['present', 'late'] };
      } else {
        matchStage.status = status;
      }
    }
    
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                employeeId: 1,
                department: 1
              }
            }
          ]
        }
      },
      { $unwind: '$employeeData' },
      {
        $project: {
          date: 1,
          status: 1,
          workingHours: 1,
          overtime: 1,
          'checkIn.time': 1,
          'checkOut.time': 1,
          employeeData: 1
        }
      },
      { $sort: { date: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          count: [{ $count: 'total' }],
          stats: [
            {
              $group: {
                _id: null,
                present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Attendance.aggregate(pipeline);
    const total = result.count[0]?.total || 0;
    const stats = result.stats[0] || { present: 0, absent: 0, late: 0 };

    return {
      data: result.data,
      stats: { ...stats, total },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Optimized payroll queries
  static async getPayrollOptimized(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const { employee, month, year, status } = filters;

    const matchStage = {};
    if (employee) matchStage.employee = employee;
    if (month) matchStage.month = parseInt(month);
    if (year) matchStage.year = parseInt(year);
    if (status) matchStage.status = status;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                employeeId: 1
              }
            }
          ]
        }
      },
      { $unwind: '$employeeData' },
      {
        $project: {
          month: 1,
          year: 1,
          basicSalary: 1,
          netSalary: 1,
          status: 1,
          paidAt: 1,
          employeeData: 1,
          createdAt: 1
        }
      },
      { $sort: { year: -1, month: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          count: [{ $count: 'total' }]
        }
      }
    ];

    const [result] = await Payroll.aggregate(pipeline);
    const total = result.count[0]?.total || 0;

    return {
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Bulk operations for better performance
  static async bulkUpdateAttendance(updates) {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update._id },
        update: { $set: update.data }
      }
    }));

    return await Attendance.bulkWrite(bulkOps);
  }

  // Aggregation for dashboard stats
  static async getDashboardStats(employeeId = null) {
    const matchStage = employeeId ? { employee: employeeId } : {};
    
    const [attendanceStats, payrollStats] = await Promise.all([
      Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            presentDays: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
            absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
            totalWorkingHours: { $sum: '$workingHours' },
            totalOvertime: { $sum: '$overtime' }
          }
        }
      ]),
      employeeId ? Payroll.aggregate([
        { $match: { employee: employeeId } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$netSalary' },
            avgSalary: { $avg: '$netSalary' },
            totalPayrolls: { $sum: 1 }
          }
        }
      ]) : []
    ]);

    return {
      attendance: attendanceStats[0] || {},
      payroll: payrollStats[0] || {}
    };
  }
}

module.exports = QueryOptimizationService;