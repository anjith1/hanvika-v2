// backend/src/routes/patrol.js
const express = require('express');
const router = express.Router();
const authenticateWorker = require('../middleware/workerAuth');
const PatrolLog = require('../models/PatrolLog');

// GET /api/patrol — worker sees their patrol logs (optionally filter by date)
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const filter = { workerId: req.workerId };
        if (req.query.siteId) filter.siteId = req.query.siteId;
        const logs = await PatrolLog.find(filter).sort({ timestamp: -1 }).limit(100);
        return res.json({ success: true, data: logs });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// POST /api/patrol — worker logs a patrol checkpoint
router.post('/', authenticateWorker, async (req, res) => {
    try {
        const { siteId, checkpoint, notes } = req.body;
        if (!siteId || !checkpoint)
            return res.status(400).json({ error: 'siteId and checkpoint are required.' });
        const log = await PatrolLog.create({
            workerId: req.workerId,
            siteId,
            checkpoint,
            timestamp: new Date(),
            notes: notes || '',
        });
        console.log(`🛡 Patrol logged: worker ${req.workerId} @ ${checkpoint}`);
        return res.status(201).json({ success: true, data: log });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

module.exports = router;
