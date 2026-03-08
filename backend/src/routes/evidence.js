// backend/src/routes/evidence.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateWorker = require('../middleware/workerAuth');
const Evidence = require('../models/Evidence');

// Ensure evidence uploads dir exists
const evidenceDir = path.join(__dirname, '../uploads/evidence');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, evidenceDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed.'));
    },
});

// GET /api/evidence — worker sees their submitted evidence
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const evidence = await Evidence.find({ workerId: req.workerId }).sort({ uploadedAt: -1 });
        return res.json({ success: true, data: evidence });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// POST /api/evidence — worker uploads photo evidence
router.post('/', authenticateWorker, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Image file is required.' });
        const imageUrl = `/uploads/evidence/${req.file.filename}`;
        const evidence = await Evidence.create({
            workerId: req.workerId,
            requestId: req.body.requestId || null,
            imageUrl,
            description: req.body.description || '',
            uploadedAt: new Date(),
        });
        return res.status(201).json({ success: true, data: evidence });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

module.exports = router;
