const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  sourceBloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  // Track which specific Inventory document this recommendation was generated
  // from so regenerate runs won't create duplicate pending recommendations
  // for the same physical batch.
  sourceInventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
  },
  destinationBloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  // The blood group physically being moved (the surplus bank's stock).
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  // The blood group actually short at the destination. Equal to bloodGroup
  // when matchType is 'exact'; a different, transfusion-compatible group
  // when matchType is 'compatible' (e.g. O- surplus covering an A+ deficit).
  deficitBloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  matchType: {
    type: String,
    enum: ['exact', 'compatible'],
    default: 'exact'
  },
  component: {
    type: String,
    enum: ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  distance: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Composite weighted score (0-100) = the two-sided match quality: how
  // urgent the expiry is, how deficit the destination is, how feasible the
  // distance is, and how good the blood-type match is. Kept as `confidence`
  // for API/UI continuity, but it's a full multi-factor score now, not just
  // a distance/expiry heuristic.
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Score breakdown, so the UI/API can show *why* confidence landed where it did.
  expiryScore: { type: Number, required: true, min: 0, max: 100 },
  deficitScore: { type: Number, required: true, min: 0, max: 100 },
  distanceScore: { type: Number, required: true, min: 0, max: 100 },
  estimatedTransferTime: {
    type: Number,
    required: true
  },
  expiryHoursRemaining: {
    type: Number,
    required: true
  },
  aiReason: {
    type: String,
    required: true
  },
  // Populated on-demand (see recommendationController.explainRecommendation)
  // by passing this recommendation's already-computed factors to the LLM
  // service. Cached here after the first successful call so repeat views
  // don't re-hit the API. Null until a user requests the AI explanation.
  aiReasonEnhanced: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
