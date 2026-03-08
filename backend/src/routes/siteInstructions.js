// backend/src/routes/siteInstructions.js
const express = require('express');
const router = express.Router();
const authenticateWorker = require('../middleware/workerAuth');
const SiteInstruction = require('../models/SiteInstruction');

// GET /api/site-instructions?type=today|post|job&siteId=xxx
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.instructionType = req.query.type;
        if (req.query.siteId) filter.siteId = req.query.siteId;
        const instructions = await SiteInstruction.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, data: instructions });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// POST /api/site-instructions — admin/supervisor creates instruction
router.post('/', authenticateWorker, async (req, res) => {
    try {
        const { siteId, instructionType, title, description } = req.body;
        if (!siteId || !instructionType || !title)
            return res.status(400).json({ error: 'siteId, instructionType, and title are required.' });
        const instruction = await SiteInstruction.create({
            siteId, instructionType, title,
            description: description || '',
            createdBy: req.workerId,
        });
        return res.status(201).json({ success: true, data: instruction });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// DELETE /api/site-instructions/:id
router.delete('/:id', authenticateWorker, async (req, res) => {
    try {
        await SiteInstruction.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
