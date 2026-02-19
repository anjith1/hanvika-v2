// db.js — Single MongoDB connection using MONGODB_URI
require("dotenv").config();
const mongoose = require("mongoose");

const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

// ─── SINGLE CONNECTION ───────────────────────────────────────────────────────
const conn = mongoose.createConnection(process.env.MONGODB_URI, connectionOptions);

conn.on("connected", () => {
  console.log(`✅ MongoDB connected — DB: ${conn.db.databaseName}`);
});

conn.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});
// ────────────────────────────────────────────────────────────────────────────

// Register models on the single connection
const OrderSchema = require('./models/Order');
const Order = conn.model('Order', OrderSchema);

// Export the single connection and all models
module.exports = { conn, Order };
