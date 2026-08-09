const Inventory = require('../models/Inventory');
const Transfer = require('../models/Transfer');
const Recommendation = require('../models/Recommendation');

const getAnalytics = async (req, res) => {
  try {
    const bloodDemand = await Inventory.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$units' } } },
      { $sort: { _id: 1 } }
    ]);

    const inventoryTrend = await Inventory.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: {
            year: { $year: '$expiryDate' },
            month: { $month: '$expiryDate' }
          },
          totalUnits: { $sum: '$units' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const transfers = await Transfer.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          units: { $sum: '$units' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Units are "saved" the moment a transfer is approved/initiated — that's when
    // the source inventory is decremented and the unit is committed to a destination
    // instead of expiring unused. Waiting for status 'completed' would leave this
    // stat frozen even after real approvals happen.
    const unitsSaved = await Transfer.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$units' }
        }
      }
    ]);
    const totalUnitsSaved = unitsSaved.length > 0 ? unitsSaved[0].totalUnits : 0;

    const expiryReduction = await Inventory.aggregate([
      {
        $facet: {
          total: [
            { $match: { status: 'available' } },
            { $count: 'count' }
          ],
          expiring: [
            { $match: { status: 'available', expiryDate: { $lte: new Date(Date.now() + 48 * 60 * 60 * 1000) } } },
            { $count: 'count' }
          ]
        }
      }
    ]);
    
    const totalRecords = expiryReduction[0].total.length > 0 ? expiryReduction[0].total[0].count : 0;
    const expiringRecords = expiryReduction[0].expiring.length > 0 ? expiryReduction[0].expiring[0].count : 0;
    const reductionRate = totalRecords > 0 ? Math.round((expiringRecords / totalRecords) * 100) : 0;

    res.json({
      success: true,
      data: {
        bloodDemand,
        inventoryTrend,
        transfers,
        unitsSaved: totalUnitsSaved,
        expiryReduction: reductionRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };
