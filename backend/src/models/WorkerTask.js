const mongoose = require('mongoose');
const { conn } = require('../db');

const taskSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    siteId: { type: String, default: '' },
    taskTitle: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = conn.models.Task ||
    conn.model('Task', taskSchema, 'tasks');
