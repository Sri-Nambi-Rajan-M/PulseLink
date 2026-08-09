const { generateForecasts, getForecastSeries } = require('../services/forecastService');

// GET /api/forecast — every (bank, bloodGroup) forecast, worst risk first.
// Optional ?riskLevel=critical|high|medium|low and ?bloodBank=<id> filters.
const getForecasts = async (req, res) => {
  try {
    const { riskLevel, bloodBank } = req.query;
    let forecasts = await generateForecasts();

    if (riskLevel) {
      forecasts = forecasts.filter((f) => f.riskLevel === riskLevel);
    }
    if (bloodBank) {
      forecasts = forecasts.filter((f) => String(f.bloodBank) === bloodBank);
    }

    const summary = {
      critical: forecasts.filter((f) => f.riskLevel === 'critical').length,
      high: forecasts.filter((f) => f.riskLevel === 'high').length,
      medium: forecasts.filter((f) => f.riskLevel === 'medium').length,
      low: forecasts.filter((f) => f.riskLevel === 'low').length,
    };

    res.json({ success: true, data: forecasts, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/forecast/:bloodBankId/:bloodGroup — drill-down series for one
// bank + blood group: historical daily usage, a 3-day projection, and the
// full computed forecast (used for the Analytics trend chart).
const getForecastDetail = async (req, res) => {
  try {
    const { bloodBankId, bloodGroup } = req.params;
    const result = await getForecastSeries(bloodBankId, bloodGroup);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getForecasts, getForecastDetail };
