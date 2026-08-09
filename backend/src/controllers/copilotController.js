const BloodBank = require('../models/BloodBank');
const Inventory = require('../models/Inventory');
const Recommendation = require('../models/Recommendation');
const Transfer = require('../models/Transfer');
const { generateForecasts } = require('../services/forecastService');
const { askCopilot, isConfigured } = require('../services/llmService');

// Builds a plain-text snapshot of live backend state for the LLM to ground
// its answer in. Deliberately compact (top N of each thing, not a full dump)
// so the prompt stays small and fast — but every number in it is real,
// freshly queried data, not cached or hardcoded.
async function buildContextSnapshot() {
  const [banks, lowStock, pendingRecs, forecasts, recentTransfers] = await Promise.all([
    BloodBank.find({ status: 'active' }).select('name city').lean(),
    Inventory.aggregate([
      { $match: { status: 'available', expiryDate: { $gte: new Date() } } },
      { $group: { _id: { bloodBank: '$bloodBank', bloodGroup: '$bloodGroup' }, units: { $sum: '$units' } } },
      { $sort: { units: 1 } },
      { $limit: 10 },
      { $lookup: { from: 'bloodbanks', localField: '_id.bloodBank', foreignField: '_id', as: 'bank' } },
    ]),
    Recommendation.find({ status: 'pending' })
      .populate('sourceBloodBank', 'name city')
      .populate('destinationBloodBank', 'name city')
      .sort({ confidence: -1 })
      .limit(8)
      .lean(),
    generateForecasts(),
    Transfer.find().sort({ createdAt: -1 }).limit(5)
      .populate('sourceBloodBank', 'name')
      .populate('destinationBloodBank', 'name')
      .lean(),
  ]);

  const lines = [];

  lines.push(`NETWORK: ${banks.length} active blood banks — ${banks.map((b) => `${b.name} (${b.city})`).join(', ')}.`);

  lines.push('');
  lines.push('LOWEST-STOCK COMBINATIONS RIGHT NOW (bank, blood group, available units):');
  for (const row of lowStock) {
    const bankName = row.bank?.[0]?.name || 'Unknown bank';
    lines.push(`- ${bankName}, ${row._id.bloodGroup}: ${row.units} units`);
  }

  lines.push('');
  lines.push('SHORTAGE FORECAST — highest risk (bank, blood group, current stock, days until predicted stockout, risk level, trend):');
  for (const f of forecasts.slice(0, 10)) {
    lines.push(`- ${f.bloodBankName} (${f.city}), ${f.bloodGroup}: ${f.currentStock} units now, ~${f.daysUntilStockout}d until stockout, risk=${f.riskLevel}, trend=${f.trend}`);
  }
  if (forecasts.length === 0) lines.push('- No forecast data available yet.');

  lines.push('');
  lines.push('PENDING REDISTRIBUTION RECOMMENDATIONS (source -> destination, blood group, units, confidence):');
  for (const r of pendingRecs) {
    const src = r.sourceBloodBank?.name || 'Unknown';
    const dst = r.destinationBloodBank?.name || 'Unknown';
    lines.push(`- ${src} -> ${dst}: ${r.units} units of ${r.bloodGroup} ${r.component}, confidence ${r.confidence}/100, priority ${r.priority}, expires in ${r.expiryHoursRemaining}h. Reason: ${r.aiReason}`);
  }
  if (pendingRecs.length === 0) lines.push('- No pending recommendations right now.');

  lines.push('');
  lines.push('RECENT TRANSFERS:');
  for (const t of recentTransfers) {
    const src = t.sourceBloodBank?.name || 'Unknown';
    const dst = t.destinationBloodBank?.name || 'Unknown';
    lines.push(`- ${t.units} units of ${t.bloodGroup} ${t.component} from ${src} to ${dst}, status: ${t.status}`);
  }
  if (recentTransfers.length === 0) lines.push('- No transfers recorded yet.');

  return lines.join('\n');
}

// POST /api/copilot/ask { question: string }
const ask = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, message: 'question is required' });
    }

    const context = await buildContextSnapshot();
    const result = await askCopilot(question.trim(), context);

    res.json({ success: true, data: { answer: result.text, configured: result.configured } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/copilot/status — lets the frontend show a subtle "not configured"
// hint without needing to fire an actual question first.
const status = async (req, res) => {
  res.json({ success: true, data: { configured: isConfigured() } });
};

module.exports = { ask, status };
