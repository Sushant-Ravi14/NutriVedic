const express = require('express');
const router = express.Router();
const { downloadData, deleteData } = require('../controllers/privacy.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/download', downloadData);
router.post('/delete', deleteData);

module.exports = router;
