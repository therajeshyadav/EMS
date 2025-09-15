// models/CompanySettings.js
const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
    },
    companyPhone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
      breakTime: { type: Number, default: 60 }, // in minutes
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    currency: {
      type: String,
      default: "INR",
    },
    leavePolicies: {
      casualLeave: { type: Number, default: 12 },
      sickLeave: { type: Number, default: 15 },
      annualLeave: { type: Number, default: 20 },
    },
    attendanceSettings: {
      lateThreshold: { type: Number, default: 15 }, // minutes
      halfDayThreshold: { type: Number, default: 240 }, // minutes
      biometricRequired: { type: Boolean, default: false },
    },
    logo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
