const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getInventory,
  getInventoryItem,
  createInventory,
  updateInventory,
  deleteInventory
  , exportInventory
} = require('../controllers/inventoryController');

router.get('/', auth, getInventory);
router.get('/export', auth, exportInventory);
router.get('/:id', auth, getInventoryItem);
router.post('/', adminAuth, createInventory);
router.put('/:id', adminAuth, updateInventory);
router.delete('/:id', adminAuth, deleteInventory);

module.exports = router;
