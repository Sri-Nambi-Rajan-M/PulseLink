const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');
const Recommendation = require('../models/Recommendation');

// Inter-bank redistribution matching. Every surplus batch nearing expiry is
// scored against every other bank's deficit for that blood group, combining:
//   1. Expiry urgency      — getExpiryScore()
//   2. Deficit urgency      — getDeficitScore()
//   3. Distance feasibility — getDistanceScore()
//   4. Blood-type match     — getMatchType() (exact first, compatible second)

// PAR_LEVEL is the target safe stock level per component/bank/blood group.
// Below it, a bank is short; further below, more urgent. Platelets carry a
// lower par level to reflect their 5-7 day shelf life.
const PAR_LEVEL = {
  'Whole Blood': 12,
  'Red Blood Cells': 12,
  Platelets: 6,
  Plasma: 10,
};

// Live snapshot of available stock per bank/bloodGroup/component, read once
// per run so every candidate in the matching loop below is scored against
// the same numbers (instead of re-querying per candidate).
async function getStockLevels() {
  const rows = await Inventory.aggregate([
    { $match: { status: 'available', expiryDate: { $gte: new Date() } } },
    {
      $group: {
        _id: { bloodBank: '$bloodBank', bloodGroup: '$bloodGroup', component: '$component' },
        units: { $sum: '$units' },
      },
    },
  ]);

  const map = new Map();
  for (const row of rows) {
    const key = `${row._id.bloodBank}|${row._id.bloodGroup}|${row._id.component}`;
    map.set(key, row.units);
  }
  return map;
}

function getStock(stockMap, bankId, bloodGroup, component) {
  return stockMap.get(`${bankId}|${bloodGroup}|${component}`) || 0;
}

// Deficit urgency: 0 (well stocked) to 100 (critically short / empty).
// Exported so this same "who's short?" math could power a standalone
// shortage-prediction dashboard later without duplicating logic.
function getDeficitScore(currentStock, component) {
  const parLevel = PAR_LEVEL[component] || 10;
  if (currentStock >= parLevel) return 0;
  const ratio = (parLevel - currentStock) / parLevel;
  return Math.round(Math.min(1, ratio) * 100);
}

// -----------------------------------------------------------------------
// Blood-type compatibility (donor -> recipient groups it can safely serve).
// Standard transfusion-compatibility chart. Exact match is always tried
// first; a compatible substitute is only used when no bank with an exact
// deficit is in range.
// -----------------------------------------------------------------------
const COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getExpiryScore(hoursUntilExpiry) {
  if (hoursUntilExpiry < 12) return 100;
  if (hoursUntilExpiry < 24) return 80;
  if (hoursUntilExpiry < 36) return 55;
  if (hoursUntilExpiry < 48) return 30;
  return 10;
}

function getDistanceScore(distanceKm) {
  if (distanceKm <= 10) return 100;
  if (distanceKm <= 25) return 80;
  if (distanceKm <= 50) return 55;
  if (distanceKm <= 75) return 30;
  return 10;
}

// Weighted combination — see brief section 2 ("How the match is scored").
const WEIGHTS = { expiry: 0.35, deficit: 0.30, distance: 0.20, compatibility: 0.15 };
const MATCH_TYPE_SCORE = { exact: 100, compatible: 60 };

function determinePriority(hoursUntilExpiry, deficitScore) {
  if (hoursUntilExpiry < 12 || deficitScore >= 80) return 'critical';
  if (hoursUntilExpiry < 24 || deficitScore >= 55) return 'high';
  if (deficitScore >= 25) return 'medium';
  return 'low';
}

function calculateTransferTime(distance) {
  const avgSpeed = 40; // km/h, ground transport between banks
  return Math.round((distance / avgSpeed) * 60);
}

function generateAIReason({ component, bloodGroup, deficitBloodGroup, matchType, hoursUntilExpiry, sourceBankName, destBankName, distance, deficitScore }) {
  const hoursRounded = Math.round(hoursUntilExpiry);
  const distanceRounded = Math.round(distance * 10) / 10;
  const substituteNote = matchType === 'compatible' ? ` as a compatible substitute for its ${deficitBloodGroup} shortage` : '';

  const urgencyLine = deficitScore >= 80
    ? `${destBankName} is critically short on ${deficitBloodGroup}`
    : deficitScore >= 55
      ? `${destBankName} is running low on ${deficitBloodGroup}`
      : `${destBankName} is trending toward a ${deficitBloodGroup} shortage`;

  return `${component} (${bloodGroup}) at ${sourceBankName} expires in ${hoursRounded}h and would likely be discarded. ${urgencyLine}. ${sourceBankName} can transfer it ${distanceRounded} km${substituteNote} — redistribution prevents waste on one side and covers the gap on the other.`;
}

const generateRecommendations = async () => {
  const fortyEightHoursFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Surplus side: real batches actually at risk of expiring unused.
  const expiringInventory = await Inventory.find({
    status: 'available',
    expiryDate: { $lte: fortyEightHoursFromNow, $gte: new Date() },
    units: { $gt: 0 },
  }).populate('bloodBank');

  const banks = await BloodBank.find({ status: 'active' });
  const stockMap = await getStockLevels();
  const recommendations = [];

  for (const inventory of expiringInventory) {
    const sourceBank = inventory.bloodBank;
    const hoursUntilExpiry = (inventory.expiryDate - new Date()) / (1000 * 60 * 60);
    const expiryScore = getExpiryScore(hoursUntilExpiry);
    const compatibleGroups = COMPATIBILITY[inventory.bloodGroup] || [inventory.bloodGroup];

    // Deficit side: check every OTHER bank, scored on whichever compatible
    // recipient group it's shortest on (exact match preferred), then ranked
    // by the full weighted score, distance as the tiebreaker.
    let bestCandidate = null;

    for (const bank of banks) {
      if (String(bank._id) === String(sourceBank._id)) continue; // no self-transfers

      const distance = calculateDistance(
        sourceBank.latitude, sourceBank.longitude,
        bank.latitude, bank.longitude
      );
      if (distance > 100) continue; // logistics cutoff

      // Try the exact blood group first; only fall back to a compatible
      // substitute group if the bank isn't actually deficit on the exact type.
      let deficitBloodGroup = null;
      let matchType = null;
      let deficitScore = 0;

      const exactStock = getStock(stockMap, bank._id, inventory.bloodGroup, inventory.component);
      const exactDeficit = getDeficitScore(exactStock, inventory.component);
      if (exactDeficit > 0) {
        deficitBloodGroup = inventory.bloodGroup;
        matchType = 'exact';
        deficitScore = exactDeficit;
      } else {
        for (const candidateGroup of compatibleGroups) {
          if (candidateGroup === inventory.bloodGroup) continue;
          const stock = getStock(stockMap, bank._id, candidateGroup, inventory.component);
          const score = getDeficitScore(stock, inventory.component);
          if (score > deficitScore) {
            deficitScore = score;
            deficitBloodGroup = candidateGroup;
            matchType = 'compatible';
          }
        }
      }

      if (!deficitBloodGroup || deficitScore <= 0) continue; // bank isn't short on anything this batch can cover

      const distanceScore = getDistanceScore(distance);
      const compatibilityScore = MATCH_TYPE_SCORE[matchType];
      const composite = Math.round(
        expiryScore * WEIGHTS.expiry +
        deficitScore * WEIGHTS.deficit +
        distanceScore * WEIGHTS.distance +
        compatibilityScore * WEIGHTS.compatibility
      );

      if (
        !bestCandidate ||
        composite > bestCandidate.composite ||
        (composite === bestCandidate.composite && distance < bestCandidate.distance)
      ) {
        bestCandidate = { bank, distance, distanceScore, deficitScore, deficitBloodGroup, matchType, composite };
      }
    }

    if (!bestCandidate) continue;

    const { bank, distance, distanceScore, deficitScore, deficitBloodGroup, matchType, composite } = bestCandidate;
    const priority = determinePriority(hoursUntilExpiry, deficitScore);
    const estimatedTransferTime = calculateTransferTime(distance);

    // Skip if any pending recommendation already references this exact
    // inventory document (prevents duplicate pending recommendations
    // pointing at the same physical batch across regenerate runs).
    const dup = await Recommendation.findOne({ sourceInventoryId: inventory._id, status: 'pending' });
    if (dup) continue;

    // Move only as many units as the destination's gap actually needs
    // (capped by what's available and a sane per-transfer ceiling) — not an
    // arbitrary flat number, so the suggestion is sized to the real shortage.
    const parLevel = PAR_LEVEL[inventory.component] || 10;
    const destStock = getStock(stockMap, bank._id, deficitBloodGroup, inventory.component);
    const gap = Math.max(1, parLevel - destStock);
    const units = Math.min(inventory.units, gap, 8);

    const aiReason = generateAIReason({
      component: inventory.component,
      bloodGroup: inventory.bloodGroup,
      deficitBloodGroup,
      matchType,
      hoursUntilExpiry,
      sourceBankName: sourceBank.name,
      destBankName: bank.name,
      distance,
      deficitScore,
    });

    recommendations.push({
      sourceBloodBank: sourceBank._id,
      sourceInventoryId: inventory._id,
      destinationBloodBank: bank._id,
      bloodGroup: inventory.bloodGroup,
      deficitBloodGroup,
      matchType,
      component: inventory.component,
      units,
      distance: Math.round(distance * 10) / 10,
      priority,
      confidence: composite,
      expiryScore,
      deficitScore,
      distanceScore,
      estimatedTransferTime,
      expiryHoursRemaining: Math.round(hoursUntilExpiry * 10) / 10,
      aiReason,
      status: 'pending'
    });
  }

  if (recommendations.length > 0) {
    await Recommendation.insertMany(recommendations);
  }

  return recommendations;
};

module.exports = {
  generateRecommendations,
  getDeficitScore,
  getStockLevels,
  PAR_LEVEL,
  // Exported for unit testing (see src/services/__tests__/recommendationService.test.js).
  getExpiryScore,
  getDistanceScore,
  calculateDistance,
  determinePriority,
  calculateTransferTime,
  COMPATIBILITY,
  WEIGHTS,
};
