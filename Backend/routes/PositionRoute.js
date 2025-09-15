// routes/positions.js
const express = require('express');
const router = express.Router();
const Position = require('../models/Position');
const Department = require('../models/department');
const Employee = require('../models/Employee');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/positions - Get all positions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const positions = await Position.find(query)
      .populate('department', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ level: 1, title: 1 });
    
    const total = await Position.countDocuments(query);
    
    res.json({
      success: true,
      data: positions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/positions/:id - Get specific position
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('department', 'name code');
    
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    // Get employees in this position
    const employees = await Employee.find({ 
      position: req.params.id,
      isActive: true 
    })
    .populate('department', 'name')
    .select('firstName lastName employeeId department joiningDate');
    
    res.json({
      success: true,
      data: {
        ...position.toObject(),
        employees
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/positions - Create new position (Admin only)
router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { title, code, description, department, level } = req.body;
    
    // Check if position code already exists
    const existingPosition = await Position.findOne({ code });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message: 'Position code already exists'
      });
    }
    
    // Verify department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const position = new Position({
      title,
      code,
      description,
      department,
      level: level || 1
    });
    
    await position.save();
    
    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/positions/:id - Update position (Admin only)
router.put('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { title, code, description, department, level, isActive } = req.body;
    
    // Check if code is being changed and if it already exists
    if (code) {
      const existingPosition = await Position.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });
      if (existingPosition) {
        return res.status(400).json({
          success: false,
          message: 'Position code already exists'
        });
      }
    }
    
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { title, code, description, department, level, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name code');
    
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Position updated successfully',
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/positions/:id - Delete position (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    // Check if position has employees
    const employeeCount = await Employee.countDocuments({ 
      position: req.params.id,
      isActive: true 
    });
    
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete position. ${employeeCount} employees are still assigned to this position.`
      });
    }
    
    await Position.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;