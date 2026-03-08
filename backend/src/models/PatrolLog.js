const mongoose = require('mongoose');
const { conn } = require('../db');

const patrolSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    siteId: { type: String, required: true },
    checkpoint: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = conn.models.PatrolLog ||
    conn.model('PatrolLog', patrolSchema, 'patrrollogs');
