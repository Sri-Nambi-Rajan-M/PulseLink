const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getRecommendations,
  getRecommendation,
  createRecommendation,
  generateRecommendationsHandler,
  approveRecommendation,
  rejectRecommendation,
  explainRecommendation,
} = require('../controllers/recommendationController');

router.get('/', auth, getRecommendations);
router.get('/:id', auth, getRecommendation);
router.post('/', adminAuth, createRecommendation);
router.post('/generate', auth, generateRecommendationsHandler);
router.post('/:id/approve', auth, approveRecommendation);
router.post('/:id/reject', auth, rejectRecommendation);
router.post('/:id/explain', auth, explainRecommendation);

module.exports = router;
