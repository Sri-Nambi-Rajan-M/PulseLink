const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getTransfers,
  getTransfer,
  getTransferDocument,
  updateTransferStatus,
} = require('../controllers/transferController');

router.get('/', auth, getTransfers);
router.get('/:id/document', auth, getTransferDocument);
router.get('/:id', auth, getTransfer);
router.patch('/:id/status', auth, updateTransferStatus);

module.exports = router;
