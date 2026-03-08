// backend/src/routes/workerReviews.js
// POST /api/worker-reviews  — Submit a job-completion review for a worker
// GET  /api/worker-reviews/worker/:workerId — Get a worker's reviews + rating
// GET  /api/worker-reviews/request/:requestId — Get review for a specific request
// All existing /api/reviews routes (MySQL) are UNTOUCHED

const express = require('express');
const router = express.Router();
const { conn } = require('../db');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Models — use the connection-aware factory for ServiceRequest & Worker
const ServiceRequest = require('../models/ServiceRequest')(conn);
const Worker = require('../models/Worker')(conn);
const WorkerReview = require('../models/WorkerReview');   // already uses conn internally

// ── POST /api/worker-reviews ─────────────────────────────────────────────────
// Customers (or Admins) submit a review after job completion.
router.post('/', verifyToken, authorizeRoles('USER', 'ADMIN'), async (req, res) => {
    try {
        const { requestId, rating, comment } = req.body;

        // ── 1. Basic validation ──────────────────────────────────────────────────
        if (!requestId) return res.status(400).json({ error: 'requestId is required.' });
        const ratingNum = Number(rating);
        if (!ratingNum || ratingNum < 1 || ratingNum > 5)
            return res.status(400).json({ error: 'rating must be a number between 1 and 5.' });

        // ── 2. Fetch the service request ─────────────────────────────────────────
        const request = await ServiceRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: 'Service request not found.' });

        // ── 3. Gate: only allow review if worker has checked out ─────────────────
        if (!request.feedbackEligible) {
            return res.status(403).json({
                error: 'Feedback is only allowed after the worker has completed the job (check-out required).',
            });
        }

        // ── 4. Ownership: customer can only review their own requests ─────────────
        if (req.user.role === 'USER' && request.customer.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only review your own service requests.' });
        }

        // ── 5. Prevent duplicate reviews ─────────────────────────────────────────
        const existing = await WorkerReview.findOne({ requestId });
        if (existing) {
            return res.status(409).json({ error: 'A review has already been submitted for this job.' });
        }

        // ── 6. Save the review ───────────────────────────────────────────────────
        const review = await WorkerReview.create({
            workerId: request.assignedWorker,
            requestId: request._id,
            createdBy: req.user.id,
            rating: ratingNum,
            comment: comment || '',
        });

        // ── 7. Recalculate worker average rating ──────────────────────────────────
        const allReviews = await WorkerReview.find({ workerId: request.assignedWorker });
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Worker.findByIdAndUpdate(request.assignedWorker, {
            averageRating: Math.round(avg * 10) / 10, // 1 decimal place
            totalReviews: allReviews.length,
        });

        console.log(`⭐ New review for worker ${request.assignedWorker}: rating ${ratingNum}, avg ${avg.toFixed(1)}`);

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully.',
            data: review,
            workerRating: {
                averageRating: Math.round(avg * 10) / 10,
                totalReviews: allReviews.length,
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A review already exists for this request.' });
        }
        console.error('Worker review error:', err);
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// ── GET /api/worker-reviews/worker/:workerId ─────────────────────────────────
// Returns all reviews for a worker + current rating stats.
router.get('/worker/:workerId', async (req, res) => {
    try {
        const reviews = await WorkerReview.find({ workerId: req.params.workerId })
            .populate('createdBy', 'username')
            .populate('requestId', 'serviceType preferredDate completedAt')
            .sort({ createdAt: -1 });

        const worker = await Worker.findById(req.params.workerId)
            .select('username averageRating totalReviews');

        return res.json({
            success: true,
            data: reviews,
            stats: {
                averageRating: worker?.averageRating || 0,
                totalReviews: worker?.totalReviews || 0,
                workerName: worker?.username || 'Unknown',
            },
        });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// ── GET /api/worker-reviews/request/:requestId ───────────────────────────────
// Check if a review exists for a given request (used by frontend to show/hide form).
router.get('/request/:requestId', verifyToken, async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.requestId)
            .select('feedbackEligible status completedAt assignedWorker');
        if (!request) return res.status(404).json({ error: 'Request not found.' });

        const review = await WorkerReview.findOne({ requestId: req.params.requestId });

        return res.json({
            success: true,
            data: {
                feedbackEligible: request.feedbackEligible,
                status: request.status,
                completedAt: request.completedAt,
                reviewSubmitted: !!review,
                review: review || null,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

module.exports = router;
