const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getBloodBanks,
  getBloodBank,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank
} = require('../controllers/bloodBankController');

router.get('/', auth, getBloodBanks);
router.get('/:id', auth, getBloodBank);
router.post('/', adminAuth, createBloodBank);
router.put('/:id', adminAuth, updateBloodBank);
router.delete('/:id', adminAuth, deleteBloodBank);

module.exports = router;
