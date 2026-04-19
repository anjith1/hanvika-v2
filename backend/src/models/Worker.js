// backend/src/models/Worker.js
// UPDATED: Uses centralized SERVICES constant for service enum

const mongoose = require("mongoose");
const SERVICES = require("../constants/services");

const workerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // ── NEW FIELDS ─────────────────────────────────────────────
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",   // every new worker starts as pending
  },
  services: {
    type: [String],
    enum: [...SERVICES, ""],
    default: [],
  },
  rejectionReason: {
    type: String,
    default: "",
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  availability: {
    type: String,
    enum: ["available", "busy"],
    default: "available"
  },
  availabilityStatus: {
    type: String,
    enum: ["available", "busy", "on_leave", "offline"],
    default: "offline"
  },
  // ────────────────────────────────────────────────────────────
}, { timestamps: true }); // adds createdAt, updatedAt automatically

module.exports = (connection) => {
  return connection.models.Worker || connection.model("Worker", workerSchema);
};
