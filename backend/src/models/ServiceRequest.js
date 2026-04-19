const mongoose = require("mongoose");
const SERVICES = require("../constants/services");

const serviceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceType: {
        type: String,
        enum: SERVICES,
        required: true
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
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
    // Drop cached model so the new schema takes effect
    if (connection.models.ServiceRequest) {
        delete connection.models.ServiceRequest;
    }
    return connection.model("ServiceRequest", serviceRequestSchema);
};
