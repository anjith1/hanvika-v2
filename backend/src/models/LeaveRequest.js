const mongoose = require('mongoose');
const { conn } = require('../db');

const leaveRequestSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    leaveType: { type: String, enum: ['sick', 'casual', 'earned', 'other'], default: 'casual' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = conn.models.LeaveRequest ||
    conn.model('LeaveRequest', leaveRequestSchema, 'leaverequests');
