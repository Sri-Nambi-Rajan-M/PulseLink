const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getForecasts, getForecastDetail } = require('../controllers/forecastController');

router.get('/', auth, getForecasts);
router.get('/:bloodBankId/:bloodGroup', auth, getForecastDetail);

module.exports = router;
