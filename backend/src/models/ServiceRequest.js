const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceType: {
        type: String,
        enum: [
            "acRepair",
            "mechanicRepair",
            "electricalRepair",
            "electronicRepair",
            "plumber",
            "packersMovers"
        ],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    preferredDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [
            "pending",
            "assigned",
            "in-progress",
            "completed",
            "cancelled"
        ],
        default: "pending"
    },
    assignedWorker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        default: null
    },
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = (connection) => {
    return connection.models.ServiceRequest || connection.model("ServiceRequest", serviceRequestSchema);
};
