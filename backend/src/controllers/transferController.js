const Transfer = require('../models/Transfer');
const Inventory = require('../models/Inventory');

// Valid forward transitions. A transfer can also move straight from
// 'initiated' or 'in_transit' to 'cancelled'.
const NEXT_STATUS = {
  initiated: ['in_transit', 'cancelled'],
  in_transit: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// PATCH /api/transfers/:id/status — previously there was no way to move a
// transfer past 'initiated' at all (transferRoutes.js only exposed GET
// endpoints), so every transfer sat there forever regardless of what
// actually happened to the physical units.
//
// This also fixes a real data-model gap: approving a recommendation only
// ever decremented the SOURCE bank's inventory (see
// recommendationController.approveRecommendation) — nothing ever credited
// the DESTINATION bank, so the shortage the transfer was meant to fix was
// never actually reflected in the destination's stock. Marking a transfer
// 'completed' now creates the destination Inventory record. Marking it
// 'cancelled' restores the units to the source bank, since they were
// already reserved/decremented at approval time.
const updateTransferStatus = async (req, res) => {
  try {
    const { status: nextStatus } = req.body;
    const validStatuses = ['in_transit', 'completed', 'cancelled'];

    if (!nextStatus || !validStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    const allowed = NEXT_STATUS[transfer.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move a transfer from '${transfer.status}' to '${nextStatus}'.`,
      });
    }

    if (nextStatus === 'completed') {
      // Credit the destination bank. Default to a 42-day shelf life
      // (standard whole-blood/RBC storage window) if we don't have a
      // captured source expiry (older transfers created before this field
      // existed won't have one).
      const fallbackExpiry = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
      await Inventory.create({
        bloodBank: transfer.destinationBloodBank,
        bloodGroup: transfer.bloodGroup,
        component: transfer.component,
        units: transfer.units,
        expiryDate: transfer.sourceExpiryDate || fallbackExpiry,
        status: 'available',
      });
    }

    if (nextStatus === 'cancelled') {
      // Restore the units to the source bank as a new available batch,
      // since the original batch was already decremented (and possibly
      // marked 'transferred') at approval time.
      const fallbackExpiry = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
      await Inventory.create({
        bloodBank: transfer.sourceBloodBank,
        bloodGroup: transfer.bloodGroup,
        component: transfer.component,
        units: transfer.units,
        expiryDate: transfer.sourceExpiryDate || fallbackExpiry,
        status: 'available',
      });
    }

    transfer.status = nextStatus;
    await transfer.save();
    await transfer.populate('sourceBloodBank', 'name city');
    await transfer.populate('destinationBloodBank', 'name city');

    res.json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransfers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const transfers = await Transfer.find(filter)
      .populate('sourceBloodBank', 'name city')
      .populate('destinationBloodBank', 'name city')
      .populate('recommendationId', 'priority confidence')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceBloodBank', 'name city address')
      .populate('destinationBloodBank', 'name city address')
      .populate('recommendationId')
      .populate('approvedBy', 'name email');
    
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }
    res.json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransferDocument = async (req, res) => {
  try {
    const crypto = require('crypto');
    const PDFDocument = require('pdfkit');

    const transfer = await Transfer.findById(req.params.id)
      .populate('sourceBloodBank', 'name city address')
      .populate('destinationBloodBank', 'name city address')
      .populate('recommendationId')
      .populate('approvedBy', 'name email');

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    // Compute SHA-256 over core fields for integrity
    const core = `${transfer._id}|${transfer.sourceBloodBank?._id}|${transfer.destinationBloodBank?._id}|${transfer.bloodGroup}|${transfer.component}|${transfer.units}|${transfer.approvedAt}`;
    const hash = crypto.createHash('sha256').update(core).digest('hex');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transfer-${transfer._id}.pdf"`);
    res.setHeader('X-Document-Hash', hash);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('PulseLink Redistribution Document', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Transfer ID: ${transfer._id}`);
    doc.text(`Status: ${transfer.status}`);
    doc.moveDown();

    doc.text('Source Blood Bank:');
    doc.text(`${transfer.sourceBloodBank?.name || ''}`);
    if (transfer.sourceBloodBank?.address) doc.text(`${transfer.sourceBloodBank.address}`);
    doc.moveDown();

    doc.text('Destination Blood Bank:');
    doc.text(`${transfer.destinationBloodBank?.name || ''}`);
    if (transfer.destinationBloodBank?.address) doc.text(`${transfer.destinationBloodBank.address}`);
    doc.moveDown();

    doc.text(`Blood Group: ${transfer.bloodGroup}`);
    doc.text(`Component: ${transfer.component}`);
    doc.text(`Units: ${transfer.units}`);
    doc.moveDown();

    doc.text(`Approved By: ${transfer.approvedBy?.name || 'N/A'} (${transfer.approvedBy?.email || ''})`);
    doc.text(`Approved At: ${transfer.approvedAt ? new Date(transfer.approvedAt).toLocaleString() : 'N/A'}`);
    doc.text(`Estimated Arrival: ${transfer.estimatedArrivalTime ? new Date(transfer.estimatedArrivalTime).toLocaleString() : 'N/A'}`);
    doc.moveDown();

    doc.text('Verification Hash (SHA-256):');
    doc.font('Courier').fontSize(10).text(hash);

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransfers,
  getTransfer,
  getTransferDocument,
  updateTransferStatus,
};
