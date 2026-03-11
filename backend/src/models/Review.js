// backend/src/models/Review.js — MongoDB Review model
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    workerId: { type: String, required: true },          // Worker ObjectId as string
    workerName: { type: String, required: true },
    workerPhone: { type: String, default: "" },
    requestId: { type: String, required: true },           // ServiceRequest ObjectId as string
    serviceType: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    jobDate: { type: Date, default: null },
}, { timestamps: true });

// One review per completed request per customer
reviewSchema.index({ customerId: 1, requestId: 1 }, { unique: true });

module.exports = (connection) => connection.model("Review", reviewSchema, "reviews");
