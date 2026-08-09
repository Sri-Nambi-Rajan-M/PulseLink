const UsageHistory = require('../models/UsageHistory');
const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');

// Shortage-forecasting engine. Unlike recommendationService.js, which checks
// current stock against a fixed PAR level, this projects the consumption
// TREND forward so a bank that looks fine today but is burning through
// stock fast still gets flagged before it runs dry.
//
//   1. EWMA of daily consumption over EWMA_WINDOW_DAYS — smoothed burn rate.
//   2. OLS linear regression over TREND_WINDOW_DAYS — accelerating, flat,
//      or decelerating demand.
//   3. Combine both to project cumulative demand over the next 1 and 3 days.
//   4. Compare projected demand to current stock for a days-until-stockout
//      estimate and risk tier.
//   5. Confidence is derived from the coefficient of variation of the
//      history — noisier series yield lower-confidence forecasts.

const EWMA_ALPHA = 0.3;
const EWMA_WINDOW_DAYS = 21;
const TREND_WINDOW_DAYS = 14;
const HISTORY_LOOKBACK_DAYS = 60;

function ewma(values, alpha) {
  if (values.length === 0) return 0;
  let avg = values[0];
  for (let i = 1; i < values.length; i++) {
    avg = alpha * values[i] + (1 - alpha) * avg;
  }
  return avg;
}

// Simple ordinary least squares: returns { slope, intercept } for y = slope*x + intercept,
// where x is the day index (0..n-1) and y is unitsConsumed that day.
function linearRegression(values) {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

function stdDev(values, mean) {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// Confidence (0-100): higher when we have enough history and the series is
// stable relative to its own mean (low coefficient of variation). Lower for
// thin or highly volatile histories rather than overstating certainty.
function computeConfidence(values, mean) {
  if (values.length < 7) return Math.round(30 + values.length * 4); // thin history -> low confidence
  const sd = stdDev(values, mean);
  const cv = mean > 0 ? sd / mean : 1;
  const stabilityScore = Math.max(0, 100 - cv * 100);
  const dataScore = Math.min(100, (values.length / HISTORY_LOOKBACK_DAYS) * 100);
  return Math.round(0.7 * stabilityScore + 0.3 * dataScore);
}

function riskLevelFor(daysUntilStockout) {
  if (daysUntilStockout < 1) return 'critical';
  if (daysUntilStockout < 2) return 'high';
  if (daysUntilStockout < 4) return 'medium';
  return 'low';
}

function trendDirection(slope) {
  if (slope > 0.15) return 'rising';
  if (slope < -0.15) return 'falling';
  return 'stable';
}

// Builds a forecast for a single (bloodBank, bloodGroup) pair from its
// historical usage series + its current live stock.
function buildForecast({ bank, bloodGroup, series, currentStock }) {
  const recent = series.slice(-EWMA_WINDOW_DAYS);
  const trendSlice = series.slice(-TREND_WINDOW_DAYS);

  const smoothedDaily = ewma(recent.map((r) => r.unitsConsumed), EWMA_ALPHA);
  const { slope } = linearRegression(trendSlice.map((r) => r.unitsConsumed));

  // Project forward: base rate + trend applied cumulatively per future day.
  const predicted24h = Math.max(0, smoothedDaily + slope);
  const predicted72h = Math.max(
    0,
    [1, 2, 3].reduce((sum, day) => sum + Math.max(0, smoothedDaily + slope * day), 0)
  );

  const effectiveDailyRate = Math.max(predicted24h, 0.1);
  const daysUntilStockout = currentStock / effectiveDailyRate;

  const mean = recent.length
    ? recent.reduce((a, r) => a + r.unitsConsumed, 0) / recent.length
    : 0;
  const confidence = computeConfidence(recent.map((r) => r.unitsConsumed), mean);

  return {
    bloodBank: bank._id,
    bloodBankName: bank.name,
    city: bank.city,
    bloodGroup,
    currentStock,
    avgDailyConsumption: Math.round(smoothedDaily * 10) / 10,
    trend: trendDirection(slope),
    trendSlope: Math.round(slope * 100) / 100,
    predicted24h: Math.round(predicted24h * 10) / 10,
    predicted72h: Math.round(predicted72h * 10) / 10,
    daysUntilStockout: Math.round(Math.min(daysUntilStockout, 99) * 10) / 10,
    riskLevel: riskLevelFor(daysUntilStockout),
    confidence,
    historyPoints: series.length,
  };
}

// Aggregates current available (non-expired) stock per bank+bloodGroup,
// across all components — matches the granularity the forecast is computed at.
async function getCurrentStockMap() {
  const rows = await Inventory.aggregate([
    { $match: { status: 'available', expiryDate: { $gte: new Date() } } },
    {
      $group: {
        _id: { bloodBank: '$bloodBank', bloodGroup: '$bloodGroup' },
        units: { $sum: '$units' },
      },
    },
  ]);
  const map = new Map();
  for (const row of rows) {
    map.set(`${row._id.bloodBank}|${row._id.bloodGroup}`, row.units);
  }
  return map;
}

// Full forecast run across every (bank, bloodGroup) combination that has
// at least some usage history. Sorted worst-risk-first so callers (API,
// dashboard) can just take the top N.
async function generateForecasts() {
  const since = new Date(Date.now() - HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const [banks, history, stockMap] = await Promise.all([
    BloodBank.find({ status: 'active' }),
    UsageHistory.find({ date: { $gte: since } }).sort({ date: 1 }),
    getCurrentStockMap(),
  ]);

  const seriesMap = new Map(); // key: bankId|bloodGroup -> [{date, unitsConsumed}]
  for (const row of history) {
    const key = `${row.bloodBank}|${row.bloodGroup}`;
    if (!seriesMap.has(key)) seriesMap.set(key, []);
    seriesMap.get(key).push({ date: row.date, unitsConsumed: row.unitsConsumed });
  }

  const banksById = new Map(banks.map((b) => [String(b._id), b]));
  const forecasts = [];

  for (const [key, series] of seriesMap.entries()) {
    const [bankId, bloodGroup] = key.split('|');
    const bank = banksById.get(bankId);
    if (!bank || series.length < 5) continue; // not enough active-bank history to trust a trend

    const currentStock = stockMap.get(key) || 0;
    forecasts.push(buildForecast({ bank, bloodGroup, series, currentStock }));
  }

  const RISK_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
  forecasts.sort((a, b) => {
    const rankDiff = (RISK_RANK[b.riskLevel] || 0) - (RISK_RANK[a.riskLevel] || 0);
    if (rankDiff !== 0) return rankDiff;
    return a.daysUntilStockout - b.daysUntilStockout;
  });

  return forecasts;
}

// Single-series lookup (used for the drill-down chart: actual history +
// projected trend line for one bank/bloodGroup pair).
async function getForecastSeries(bloodBankId, bloodGroup) {
  const since = new Date(Date.now() - HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const [bank, history, stockMap] = await Promise.all([
    BloodBank.findById(bloodBankId),
    UsageHistory.find({ bloodBank: bloodBankId, bloodGroup, date: { $gte: since } }).sort({ date: 1 }),
    getCurrentStockMap(),
  ]);

  if (!bank) return null;

  const series = history.map((r) => ({ date: r.date, unitsConsumed: r.unitsConsumed }));
  const currentStock = stockMap.get(`${bloodBankId}|${bloodGroup}`) || 0;
  const forecast = series.length >= 5 ? buildForecast({ bank, bloodGroup, series, currentStock }) : null;

  // Projected points for the next 3 days, for charting a continuation line.
  const projected = [];
  if (forecast) {
    const trendSlice = series.slice(-TREND_WINDOW_DAYS);
    const { slope } = linearRegression(trendSlice.map((r) => r.unitsConsumed));
    const base = forecast.avgDailyConsumption;
    const lastDate = series[series.length - 1]?.date ? new Date(series[series.length - 1].date) : new Date();
    for (let day = 1; day <= 3; day++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + day);
      projected.push({ date: d, predictedUnits: Math.max(0, Math.round((base + slope * day) * 10) / 10) });
    }
  }

  return {
    bloodBank: { id: bank._id, name: bank.name, city: bank.city },
    bloodGroup,
    history: series,
    projected,
    forecast,
  };
}

module.exports = {
  generateForecasts,
  getForecastSeries,
  HISTORY_LOOKBACK_DAYS,
  // Exported for unit testing (see src/services/__tests__/forecastService.test.js).
  ewma,
  linearRegression,
  stdDev,
  computeConfidence,
  riskLevelFor,
  trendDirection,
  buildForecast,
};
