// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Employee = require("../models/Employee");
const { authenticateToken } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const employee = await Employee.findOne({ userId: user._id })
      .populate("department", "name")
      .populate("position", "title");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, employeeId: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        role: user.role,
        _id: user._id,
      },
      profile: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: user.email,
        department: employee.department?.name,
        position: employee.position?.title,
        employeeId: employee._id,
        role: user.role,
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

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP BODY ===>", req.body);

    const { firstName, lastName, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      // Force self-registered users to employee role only
      role,
    });

    await user.save();

    // Generate employee ID
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, "0")}`;

    // Create employee profile with default values
    const employee = new Employee({
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      email,
      phone: phone || "Not provided",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      department: null,
      position: null,
      salary: 0,
      joiningDate: new Date(),
      isActive: false,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please contact admin to complete your profile setup.",
      data: {
        userId: user._id,
        employeeId: employee.employeeId,
        firstName,
        lastName,
        email,
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

// POST /api/auth/logout
router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET /api/auth/verify-token
router.get("/verify-token", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

module.exports = router;
