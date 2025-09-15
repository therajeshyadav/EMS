// services/payrollService.js
const Payroll = require('../models/Payroll');
const Attendance = require('../models/attendance');

async function calculateAndSavePayroll(employee, month, year) {
    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({
        employee: employee._id,
        month,
        year
    });
    if (existingPayroll) {
        return { success: false, message: 'Payroll already exists for this month' };
    }

    // Calculate attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
    });

    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalWorkingDays = new Date(year, month, 0).getDate();

    // Salary components
    const basicSalary = employee.salary;
    const hra = basicSalary * 0.4;
    const da = basicSalary * 0.2;
    const ta = 2000;

    const totalAllowances = hra + da + ta;

    // Deductions
    const pf = basicSalary * 0.12;
    const tax = basicSalary * 0.1;
    const insurance = 500;

    const totalDeductions = pf + tax + insurance;

    // Overtime
    const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);
    const overtimeRate = basicSalary / (totalWorkingDays * 8 * 60);
    const overtimeAmount = totalOvertime * overtimeRate;

    // Net salary
    const netSalary = basicSalary + totalAllowances + overtimeAmount - totalDeductions;

    // Save payroll
    const payroll = new Payroll({
        employee: employee._id,
        month,
        year,
        basicSalary,
        allowances: { hra, da, ta, other: 0 },
        deductions: { pf, tax, insurance, other: 0 },
        overtime: {
            hours: totalOvertime / 60,
            rate: overtimeRate * 60,
            amount: overtimeAmount
        },
        netSalary
    });

    await payroll.save();

    return { success: true, data: payroll };
}

module.exports = { calculateAndSavePayroll };
