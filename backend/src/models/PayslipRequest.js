const mongoose = require("mongoose");

const payslipRequestSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    workerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "uploaded", "expired"],
        default: "pending"
    },
    filePath: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function () {
            // 7 days from now
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    }
});

module.exports = (connection) => {
    return connection.models.PayslipRequest || connection.model("PayslipRequest", payslipRequestSchema);
};
