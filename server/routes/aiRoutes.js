const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/chat', optionalAuth, aiController.chat);
router.get('/history', optionalAuth, aiController.getHistory);
router.post('/clear', optionalAuth, aiController.clearHistory);

module.exports = router;
