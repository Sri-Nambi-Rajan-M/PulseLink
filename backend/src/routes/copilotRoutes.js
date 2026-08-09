const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { copilotLimiter } = require('../middleware/rateLimit');
const { ask, status } = require('../controllers/copilotController');

router.post('/ask', auth, copilotLimiter, ask);
router.get('/status', auth, status);

module.exports = router;
