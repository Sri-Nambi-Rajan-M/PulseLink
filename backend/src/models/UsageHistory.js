const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Daily consumption ledger — one document per (bloodBank, bloodGroup, date).
//
// This is the time-series input the forecasting engine (services/
// forecastService.js) actually learns from: how many units of this blood
// group this bank transfused/dispatched on a given day. It's deliberately
// separate from Inventory (which is a live snapshot of current batches, not
// a history) and from Transfer (which only records inter-bank redistribution,
// not day-to-day clinical usage — far too sparse to trend on).
// ---------------------------------------------------------------------------
const usageHistorySchema = new mongoose.Schema({
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  // Normalized to midnight UTC so each (bank, bloodGroup, date) combination
  // is unique — one row per day, not per event.
  date: {
    type: Date,
    required: true,
  },
  unitsConsumed: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

usageHistorySchema.index({ bloodBank: 1, bloodGroup: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UsageHistory', usageHistorySchema);
