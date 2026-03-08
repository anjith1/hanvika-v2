const mongoose = require('mongoose');
const { conn } = require('../db');

const workerReviewSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // customer or admin
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
}, { timestamps: true });

// One review per request (prevent duplicates)
workerReviewSchema.index({ requestId: 1 }, { unique: true });

module.exports = conn.models.WorkerReview ||
    conn.model('WorkerReview', workerReviewSchema, 'workerreviews');
