const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Mood routes
router.get('/mood', optionalAuth, wellnessController.getMoods);
router.post('/mood', optionalAuth, wellnessController.addMood);

// Activity routes (steps, water, workout)
router.get('/activity', optionalAuth, wellnessController.getActivitySummary);
router.post('/activity', optionalAuth, wellnessController.logActivity);

// Journal routes
router.get('/journal', optionalAuth, wellnessController.getJournals);
router.post('/journal', optionalAuth, wellnessController.addJournal);
router.delete('/journal/:id', optionalAuth, wellnessController.deleteJournal);

// Affirmations & Tips
router.get('/affirmations', wellnessController.getAffirmations);

module.exports = router;
