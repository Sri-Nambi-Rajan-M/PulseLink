const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodBank: {
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
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'expired', 'transferred'],
    default: 'available'
  }
}, {
  timestamps: true
});

inventorySchema.index({ bloodBank: 1, bloodGroup: 1, component: 1, expiryDate: 1 });
inventorySchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
