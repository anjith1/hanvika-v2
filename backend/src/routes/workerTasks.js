// backend/src/routes/workerTasks.js
const express = require('express');
const router = express.Router();
const authenticateWorker = require('../middleware/workerAuth');
const WorkerTask = require('../models/WorkerTask');

// GET /api/tasks — worker sees their tasks
router.get('/', authenticateWorker, async (req, res) => {
    try {
        const tasks = await WorkerTask.find({ workerId: req.workerId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: tasks });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// POST /api/tasks — admin creates task for a worker
router.post('/', authenticateWorker, async (req, res) => {
    try {
        const { workerId, siteId, taskTitle, description, priority } = req.body;
        if (!taskTitle) return res.status(400).json({ error: 'taskTitle is required.' });
        const task = await WorkerTask.create({
            workerId: workerId || req.workerId,
            siteId: siteId || '',
            taskTitle,
            description: description || '',
            priority: priority || 'medium',
            assignedBy: req.workerId,
        });
        return res.status(201).json({ success: true, data: task });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.', detail: err.message });
    }
});

// PATCH /api/tasks/:id/status — worker updates task status
router.patch('/:id/status', authenticateWorker, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'in-progress', 'completed'].includes(status))
            return res.status(400).json({ error: 'Invalid status.' });
        const updated = await WorkerTask.findOneAndUpdate(
            { _id: req.params.id, workerId: req.workerId }, // worker can only update own tasks
            { status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Task not found.' });
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
