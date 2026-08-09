const BloodBank = require('../models/BloodBank');
const Inventory = require('../models/Inventory');
const Recommendation = require('../models/Recommendation');
const Transfer = require('../models/Transfer');

const getBloodBanks = async (req, res) => {
  try {
    const bloodBanks = await BloodBank.find().sort({ name: 1 });
    res.json({ success: true, data: bloodBanks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }
    res.json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.create(req.body);
    res.status(201).json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }
    res.json({ success: true, data: bloodBank });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    // Referential-integrity guard — a Blood Bank can be pointed to by
    // Inventory, Recommendations (as source or destination), and Transfers
    // (as source or destination). Deleting it out from under those records
    // leaves dangling ObjectIds, which crashes anything that later
    // `.populate()`s them (e.g. GET /api/dashboard reading
    // `rec.sourceBloodBank.name`). Rather than silently cascading — which
    // would destroy real transfer history — we block the delete and tell
    // the caller exactly what's still attached.
    const bankId = bloodBank._id;
    const [inventoryCount, recommendationCount, transferCount] = await Promise.all([
      Inventory.countDocuments({ bloodBank: bankId }),
      Recommendation.countDocuments({
        $or: [{ sourceBloodBank: bankId }, { destinationBloodBank: bankId }],
      }),
      Transfer.countDocuments({
        $or: [{ sourceBloodBank: bankId }, { destinationBloodBank: bankId }],
      }),
    ]);

    const blockers = [];
    if (inventoryCount > 0) blockers.push(`${inventoryCount} inventory record(s)`);
    if (recommendationCount > 0) blockers.push(`${recommendationCount} recommendation(s)`);
    if (transferCount > 0) blockers.push(`${transferCount} transfer(s)`);

    if (blockers.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this blood bank — it still has ${blockers.join(', ')} referencing it. Remove or reassign those first.`,
      });
    }

    await BloodBank.findByIdAndDelete(bankId);
    res.json({ success: true, message: 'Blood bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBloodBanks,
  getBloodBank,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank
};
