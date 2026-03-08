const mongoose = require('mongoose');
const { conn } = require('../db');

const evidenceSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = conn.models.Evidence ||
    conn.model('Evidence', evidenceSchema, 'evidence');
