const express = require('express');
const router = express.Router();
const { getUsers, editUser, deleteUser, getAnalytics, broadcastAnnouncement, getAuditLogs } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminGate } = require('../middleware/adminGate.middleware');

router.use(protect, adminGate);

router.get('/users', getUsers);
router.put('/users/:userId', editUser);
router.delete('/users/:userId', deleteUser);
router.get('/analytics', getAnalytics);
router.post('/announcement', broadcastAnnouncement);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
