const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');
const Recommendation = require('../models/Recommendation');
const Transfer = require('../models/Transfer');

// `priority` is a string enum ('low' | 'medium' | 'high' | 'critical'), so
// sorting it directly with Mongo's { priority: -1 } sorts alphabetically
// (medium > low > high > critical) instead of by actual severity. This rank
// map lets us sort pending recommendations by true urgency.
const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

const DASHBOARD_RECOMMENDATION_LIMIT = 5;

const getDashboard = async (req, res) => {
  try {
    const activeRecommendations = await Recommendation.countDocuments({ status: 'pending' });
    const connectedBloodBanks = await BloodBank.countDocuments({ status: 'active' });
    const activeTransfers = await Transfer.countDocuments({ status: { $in: ['initiated', 'in_transit'] } });
    
    const criticalExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const criticalInventory = await Inventory.aggregate([
      { $match: { status: 'available', expiryDate: { $lte: criticalExpiry } } },
      { $group: { _id: null, totalUnits: { $sum: '$units' } } }
    ]);
    const criticalUnits = criticalInventory.length > 0 ? criticalInventory[0].totalUnits : 0;

    const recentActivity = await Transfer.find()
      .populate('sourceBloodBank', 'name city')
      .populate('destinationBloodBank', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);
    // Defensive: if a referenced blood bank was ever deleted (old data from
    // before referential-integrity checks existed, or a direct DB edit),
    // the populate() above resolves to null instead of throwing. Filter
    // those out rather than letting `.name` reads crash this endpoint.
    const safeRecentActivity = recentActivity.filter(
      (t) => t.sourceBloodBank && t.destinationBloodBank
    );

    const alerts = await Inventory.find({
      status: 'available',
      expiryDate: { $lte: new Date(Date.now() + 48 * 60 * 60 * 1000) }
    })
      .populate('bloodBank', 'name city')
      .sort({ expiryDate: 1 })
      .limit(5);

    // Pull all pending recommendations, rank them by true severity (not
    // alphabetically) + confidence, then keep the top N for the dashboard.
    const pendingRecommendations = await Recommendation.find({ status: 'pending' })
      .populate('sourceBloodBank', 'name city')
      .populate('destinationBloodBank', 'name city');

    const topRecommendations = pendingRecommendations
      .filter((rec) => rec.sourceBloodBank && rec.destinationBloodBank)
      .slice()
      .sort((a, b) => {
        const rankDiff = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
        if (rankDiff !== 0) return rankDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, DASHBOARD_RECOMMENDATION_LIMIT)
      .map((rec) => ({
        id: rec._id,
        source: rec.sourceBloodBank.name,
        sourceCity: rec.sourceBloodBank.city,
        destination: rec.destinationBloodBank.name,
        destinationCity: rec.destinationBloodBank.city,
        bloodGroup: rec.bloodGroup,
        component: rec.component,
        units: rec.units,
        distance: rec.distance,
        confidence: rec.confidence,
        priority: rec.priority,
        reason: rec.aiReason,
        status: rec.status,
      }));

    res.json({
      success: true,
      data: {
        stats: {
          activeRecommendations,
          criticalUnits,
          activeTransfers,
          connectedBloodBanks
        },
        recentActivity: safeRecentActivity,
        alerts: alerts
          .filter((inv) => inv.bloodBank)
          .map(inv => ({
          id: inv._id,
          bloodBank: inv.bloodBank.name,
          city: inv.bloodBank.city,
          bloodGroup: inv.bloodGroup,
          component: inv.component,
          units: inv.units,
          expiryDate: inv.expiryDate,
          hoursRemaining: Math.round((inv.expiryDate - new Date()) / (1000 * 60 * 60))
        })),
        topRecommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard };
