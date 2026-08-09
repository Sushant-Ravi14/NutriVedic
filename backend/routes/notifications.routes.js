const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification, updateSettings, saveFCMToken } = require('../controllers/notifications.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllRead);
router.delete('/:id', deleteNotification);
router.put('/settings', updateSettings);
router.post('/fcm-token', saveFCMToken);

module.exports = router;
