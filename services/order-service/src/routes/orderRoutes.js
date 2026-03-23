const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');

const {
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getMyWorkOrders
} = require('../controllers/orderController');


router.use(authenticate);


router.get('/available', requireRole('master'), getAvailableOrders);

router.get('/my-work', requireRole('master'), getMyWorkOrders);

router.patch('/:id/accept', requireRole('master'), acceptOrder);

router.patch('/:id/status', requireRole('master'), updateOrderStatus);

module.exports = router;