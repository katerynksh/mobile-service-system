const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
// const { verifyMaster } = require('../middleware/auth');

router.get('/', orderController.getAllOrders);

router.patch('/:id/status', orderController.updateStatus);

module.exports = router;