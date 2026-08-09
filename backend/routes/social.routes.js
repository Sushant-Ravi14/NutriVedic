const express = require('express');
const router = express.Router();
const { addFriendRequest, getFriendsList, shareProgress, getLeaderboard, createChallenge } = require('../controllers/social.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/friend-request', addFriendRequest);
router.get('/friends', getFriendsList);
router.post('/share', shareProgress);
router.get('/leaderboard', getLeaderboard);
router.post('/challenge', createChallenge);

module.exports = router;
