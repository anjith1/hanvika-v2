// backend/src/routes/regularization.js
const express = require('express');
const router = express.Router();
const authenticateWorker = require('../middleware/workerAuth');
const ServiceRequest = require('../models/ServiceRequest');
const AttendanceRegularization = require('../models/AttendanceRegularization');

// GET /api/regularization — worker sees their regularization requests
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const requests = await AttendanceRegularization.find({ workerId: req.workerId }).sort({ date: -1 });
        return res.json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// GET /api/regularization/all — admin sees all requests
router.get('/all', async (req, res) => {
    try {
        const requests = await AttendanceRegularization.find()
            .populate('workerId', 'username email phone')
            .sort({ createdAt: -1 });
        return res.json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/regularization/attendance — worker's attendance from ServiceRequests
router.get('/attendance', authenticateWorker, async (req, res) => {
    try {
        const records = await ServiceRequest.find({
            assignedWorker: req.workerId,
            $or: [{ checkInTime: { $ne: null } }, { checkOutTime: { $ne: null } }],
        }).select('serviceType location checkInTime checkOutTime status preferredDate')
            .sort({ checkInTime: -1 })
            .limit(50);

        const attendance = records.map(r => {
            const inTime = r.checkInTime ? new Date(r.checkInTime) : null;
            const outTime = r.checkOutTime ? new Date(r.checkOutTime) : null;
            let duration = null;
            if (inTime && outTime) {
                const diffMs = outTime - inTime;
                const hrs = Math.floor(diffMs / 3600000);
                const mins = Math.floor((diffMs % 3600000) / 60000);
                duration = `${hrs}h ${mins}m`;
            }
            return {
                _id: r._id,
                date: r.preferredDate || r.checkInTime,
                service: r.serviceType,
                location: r.location,
                checkIn: inTime ? inTime.toLocaleTimeString() : '—',
                checkOut: outTime ? outTime.toLocaleTimeString() : '—',
                duration: duration || '—',
                status: r.status,
            };
        });

        return res.json({ success: true, data: attendance });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// GET /api/regularization/missed — assigned jobs where no check-in recorded
router.get('/missed', authenticateWorker, async (req, res) => {
    try {
        const missed = await ServiceRequest.find({
            assignedWorker: req.workerId,
            checkInTime: null,
            status: { $in: ['assigned', 'pending'] },
            preferredDate: { $lt: new Date() }, // date has passed
        }).select('serviceType location preferredDate status')
            .sort({ preferredDate: -1 });
        return res.json({ success: true, data: missed });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// POST /api/regularization — worker submits correction request
router.post('/', authenticateWorker, async (req, res) => {
    try {
        const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;
        if (!date || !reason)
            return res.status(400).json({ error: 'date and reason are required.' });
        const request = await AttendanceRegularization.create({
            workerId: req.workerId,
            date: new Date(date),
            requestedCheckIn: requestedCheckIn || '',
            requestedCheckOut: requestedCheckOut || '',
            reason,
        });
        return res.status(201).json({ success: true, data: request });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// PATCH /api/regularization/:id/status — admin approves/rejects
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['approved', 'rejected'].includes(status))
            return res.status(400).json({ error: 'Invalid status.' });
        const updated = await AttendanceRegularization.findByIdAndUpdate(
            req.params.id,
            { status, adminNote: adminNote || '' },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Request not found.' });
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
