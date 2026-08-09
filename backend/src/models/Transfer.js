const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  recommendationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recommendation',
    required: true
  },
  sourceBloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  destinationBloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
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
  status: {
    type: String,
    enum: ['initiated', 'in_transit', 'completed', 'cancelled'],
    default: 'initiated'
  },
  // Snapshot of the moved batch's expiry at approval time. Needed so that,
  // when the transfer is later marked 'completed', we can credit the
  // destination bank with a real Inventory record carrying an accurate
  // expiry date instead of guessing one.
  sourceExpiryDate: {
    type: Date,
  },
  estimatedArrivalTime: {
    type: Date,
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);
