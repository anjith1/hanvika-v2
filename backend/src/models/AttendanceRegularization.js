const mongoose = require('mongoose');
const { conn } = require('../db');

const regularizationSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    date: { type: Date, required: true },
    requestedCheckIn: { type: String, default: '' },  // "HH:MM" format
    requestedCheckOut: { type: String, default: '' },  // "HH:MM" format
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = conn.models.AttendanceRegularization ||
    conn.model('AttendanceRegularization', regularizationSchema, 'attendanceregularizations');
