// backend/src/models/Worker.js
// UPDATED: Added status field for admin approval flow

const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
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
  serviceType: {
    type: String,
    enum: ["Technical", "Non-Technical", "Housekeeping", ""],
    default: "",
  },
  rejectionReason: {
    type: String,
    default: "",
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  // ────────────────────────────────────────────────────────────
}, { timestamps: true }); // adds createdAt, updatedAt automatically

module.exports = (connection) => {
  return connection.models.Worker || connection.model("Worker", workerSchema);
};
