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
  services: {
    type: [String],
    enum: [
      "acRepair",
      "mechanicRepair",
      "electricalRepair",
      "electronicRepair",
      "plumber",
      "packersMovers",
      ""
    ],
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
  // ────────────────────────────────────────────────────────────
}, { timestamps: true }); // adds createdAt, updatedAt automatically

module.exports = (connection) => {
  return connection.models.Worker || connection.model("Worker", workerSchema);
};
