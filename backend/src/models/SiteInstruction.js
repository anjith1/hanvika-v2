const mongoose = require('mongoose');
const { conn } = require('../db');

const siteInstructionSchema = new mongoose.Schema({
    siteId: { type: String, required: true },
    instructionType: { type: String, enum: ['today', 'post', 'job'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
}, { timestamps: true });

module.exports = conn.models.SiteInstruction ||
    conn.model('SiteInstruction', siteInstructionSchema, 'siteinstructions');
