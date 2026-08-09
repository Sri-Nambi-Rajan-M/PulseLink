const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');

const getInventory = async (req, res) => {
  try {
    const { bloodBank, bloodGroup, component, status } = req.query;
    const filter = {};
    
    if (bloodBank) filter.bloodBank = bloodBank;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (component) filter.component = component;
    if (status) filter.status = status;

    const inventory = await Inventory.find(filter)
      .populate('bloodBank', 'name city')
      .sort({ expiryDate: 1 });
    
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('bloodBank', 'name city');
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInventory = async (req, res) => {
  try {
    if (req.body.bloodBank) {
      const bankExists = await BloodBank.exists({ _id: req.body.bloodBank });
      if (!bankExists) {
        return res.status(400).json({ success: false, message: 'bloodBank does not reference an existing blood bank' });
      }
    }
    const inventory = await Inventory.create(req.body);
    await inventory.populate('bloodBank', 'name city');
    res.status(201).json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    if (req.body.bloodBank) {
      const bankExists = await BloodBank.exists({ _id: req.body.bloodBank });
      if (!bankExists) {
        return res.status(400).json({ success: false, message: 'bloodBank does not reference an existing blood bank' });
      }
    }
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('bloodBank', 'name city');
    
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('bloodBank', 'name city')
      .sort({ expiryDate: 1 });

    const headers = [
      'id',
      'bloodBank',
      'city',
      'bloodGroup',
      'component',
      'units',
      'expiryDate',
      'status',
      'createdAt'
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pulselink-inventory.csv"');

    // Write header
    res.write(headers.join(',') + '\n');

    for (const inv of inventory) {
      const row = [
        inv._id,
        '"' + (inv.bloodBank ? inv.bloodBank.name.replace(/"/g, '""') : '') + '"',
        '"' + (inv.bloodBank ? (inv.bloodBank.city || '').replace(/"/g, '""') : '') + '"',
        inv.bloodGroup,
        inv.component,
        inv.units,
        inv.expiryDate.toISOString(),
        inv.status,
        inv.createdAt.toISOString(),
      ];
      res.write(row.join(',') + '\n');
    }

    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createInventory,
  updateInventory,
  deleteInventory
  , exportInventory
};
