// backend/src/routes/leave.js
const express = require('express');
const router = express.Router();
const authenticateWorker = require('../middleware/workerAuth');
const LeaveRequest = require('../models/LeaveRequest');

// GET /api/leave — worker sees their leave requests
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ workerId: req.workerId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// GET /api/leave/all — admin sees all leave requests
router.get('/all', async (req, res) => {
    try {
        const requests = await LeaveRequest.find()
            .populate('workerId', 'username email phone')
            .sort({ createdAt: -1 });
        return res.json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/leave — worker submits a leave request
router.post('/', authenticateWorker, async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;
        if (!fromDate || !toDate || !reason)
            return res.status(400).json({ error: 'fromDate, toDate, and reason are required.' });
        const request = await LeaveRequest.create({
            workerId: req.workerId,
            leaveType: leaveType || 'casual',
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            reason,
        });
        return res.status(201).json({ success: true, data: request });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// PATCH /api/leave/:id/status — admin approves/rejects
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['approved', 'rejected'].includes(status))
            return res.status(400).json({ error: 'Invalid status. Use approved or rejected.' });
        const updated = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status, adminNote: adminNote || '' },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Leave request not found.' });
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
