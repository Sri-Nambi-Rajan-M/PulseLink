const Recommendation = require('../models/Recommendation');
const Inventory = require('../models/Inventory');
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const { generateRecommendations } = require('../services/recommendationService');
const { explainRecommendation: explainWithLLM } = require('../services/llmService');

const getRecommendations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const recommendations = await Recommendation.find(filter)
      .populate('sourceBloodBank', 'name city latitude longitude')
      .populate('destinationBloodBank', 'name city latitude longitude')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('sourceBloodBank', 'name city address latitude longitude')
      .populate('destinationBloodBank', 'name city address latitude longitude');

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRecommendation = async (req, res) => {
  try {
    const { sourceBloodBank, destinationBloodBank } = req.body;
    if (sourceBloodBank || destinationBloodBank) {
      const idsToCheck = [sourceBloodBank, destinationBloodBank].filter(Boolean);
      const foundCount = await BloodBank.countDocuments({ _id: { $in: idsToCheck } });
      if (foundCount !== idsToCheck.length) {
        return res.status(400).json({ success: false, message: 'sourceBloodBank/destinationBloodBank must reference existing blood banks' });
      }
    }
    const recommendation = await Recommendation.create(req.body);
    await recommendation.populate('sourceBloodBank', 'name city');
    await recommendation.populate('destinationBloodBank', 'name city');
    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const generateRecommendationsHandler = async (req, res) => {
  try {
    const recommendations = await generateRecommendations();
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Recommendation is not pending' });
    }

    recommendation.status = 'rejected';
    await recommendation.save();

    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NOTE: Approval is done via a manual two-phase rollback instead of a native
// Mongo transaction. `session.startTransaction()` requires MongoDB to be running
// as a replica set / mongos, which a plain local `mongodb://localhost:27017/...`
// instance is not. Using transactions there throws:
//   "Transaction numbers are only allowed on a replica set member or mongos"
// on every single approval. The manual approach below works on any MongoDB setup:
//   1. Atomically decrement the source inventory ONLY if enough units are still
//      available (a conditional update, so two simultaneous approvals can't both
//      pass the check and push units negative).
//   2. Create the Transfer record and flip the recommendation to 'approved'.
//   3. If step 2 fails for any reason, compensate by crediting the units back
//      to the source inventory so no stock is silently lost.
const approveRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Recommendation is not pending' });
    }

    // Step 1: consume available source inventory across one or more batches.
    // A recommendation may still be valid even if no single batch has enough
    // units, so we aggregate from the earliest expiring batches instead of
    // requiring one document to cover the full transfer.
    const consumedBatches = [];
    let earliestConsumedExpiry = null;
    let remainingUnits = recommendation.units;

    while (remainingUnits > 0) {
      const batch = await Inventory.findOne({
        bloodBank: recommendation.sourceBloodBank,
        bloodGroup: recommendation.bloodGroup,
        component: recommendation.component,
        status: 'available',
        expiryDate: { $gte: new Date() },
        units: { $gt: 0 },
      })
        .sort({ expiryDate: 1, units: -1 })
        .lean();

      if (!batch) break;

      const consume = Math.min(batch.units, remainingUnits);
      const updatedBatch = await Inventory.findOneAndUpdate(
        { _id: batch._id, units: batch.units },
        { $inc: { units: -consume } },
        { new: true }
      );

      if (!updatedBatch) {
        // Race condition; retry the loop from scratch.
        continue;
      }

      consumedBatches.push({
        id: updatedBatch._id,
        consumed: consume,
        wasFullyConsumed: updatedBatch.units === 0,
      });
      if (!earliestConsumedExpiry || batch.expiryDate < earliestConsumedExpiry) {
        earliestConsumedExpiry = batch.expiryDate;
      }
      remainingUnits -= consume;

      if (updatedBatch.units === 0) {
        await Inventory.findByIdAndUpdate(updatedBatch._id, { status: 'transferred' });
      }
    }

    if (remainingUnits > 0) {
      // Roll back any partial consumption we already made.
      await Promise.all(
        consumedBatches.map((batch) =>
          Inventory.findByIdAndUpdate(batch.id, {
            $inc: { units: batch.consumed },
            status: 'available',
          }),
        ),
      );
      // Mark the recommendation as no longer valid so the UI doesn't keep
      // trying to approve a stale suggestion that references already-used
      // inventory. This provides a clear signal to the user to refresh AI.
      try {
        recommendation.status = 'rejected';
        await recommendation.save();
      } catch (e) {
        // ignore save errors here — we'll still return the primary error
      }

      return res.status(400).json({
        success: false,
        message:
          'This recommendation is no longer valid — inventory was already reallocated. It has been removed; refresh AI to see current recommendations.',
      });
    }

    try {
      const estimatedArrivalTime = new Date(Date.now() + recommendation.estimatedTransferTime * 60 * 1000);

      let adminUserId = req.user ? req.user._id : null;
      if (!adminUserId) {
        const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
        adminUserId = adminUser ? adminUser._id : undefined;
      }

      const transfer = await Transfer.create({
        recommendationId: recommendation._id,
        sourceBloodBank: recommendation.sourceBloodBank,
        destinationBloodBank: recommendation.destinationBloodBank,
        bloodGroup: recommendation.bloodGroup,
        component: recommendation.component,
        units: recommendation.units,
        status: 'initiated',
        sourceExpiryDate: earliestConsumedExpiry || undefined,
        estimatedArrivalTime,
        approvedBy: adminUserId,
      });

      recommendation.status = 'approved';
      await recommendation.save();

      await recommendation.populate('sourceBloodBank', 'name city');
      await recommendation.populate('destinationBloodBank', 'name city');

      res.json({ success: true, data: recommendation, transfer });
    } catch (error) {
      // Step 3: compensate — restore the consumed inventory if approval fails.
      await Promise.all(
        consumedBatches.map((batch) =>
          Inventory.findByIdAndUpdate(batch.id, {
            $inc: { units: batch.consumed },
            status: 'available',
          }),
        ),
      );
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/recommendations/:id/explain — LLM-generated explanation of an
// already-computed recommendation. Cached on the document after the first
// successful call. Falls back gracefully (never errors) if GROQ_API_KEY
// isn't configured — returns the existing template `aiReason` instead.
const explainRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('sourceBloodBank', 'name city')
      .populate('destinationBloodBank', 'name city');

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (recommendation.aiReasonEnhanced) {
      return res.json({
        success: true,
        data: { text: recommendation.aiReasonEnhanced, configured: true, cached: true },
      });
    }

    const result = await explainWithLLM({
      sourceBankName: recommendation.sourceBloodBank?.name || 'Unknown bank',
      sourceCity: recommendation.sourceBloodBank?.city || '',
      destBankName: recommendation.destinationBloodBank?.name || 'Unknown bank',
      destCity: recommendation.destinationBloodBank?.city || '',
      bloodGroup: recommendation.bloodGroup,
      deficitBloodGroup: recommendation.deficitBloodGroup,
      matchType: recommendation.matchType,
      component: recommendation.component,
      units: recommendation.units,
      distanceKm: recommendation.distance,
      expiryHoursRemaining: recommendation.expiryHoursRemaining,
      confidence: recommendation.confidence,
      expiryScore: recommendation.expiryScore,
      deficitScore: recommendation.deficitScore,
      distanceScore: recommendation.distanceScore,
      priority: recommendation.priority,
    });

    if (result.text) {
      recommendation.aiReasonEnhanced = result.text;
      await recommendation.save();
    }

    res.json({
      success: true,
      data: {
        text: result.text || recommendation.aiReason,
        configured: result.configured,
        cached: false,
        usedFallback: !result.text,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecommendations,
  getRecommendation,
  createRecommendation,
  generateRecommendationsHandler,
  approveRecommendation,
  rejectRecommendation,
  explainRecommendation,
};
