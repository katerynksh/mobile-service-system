const { OrderModel, VALID_STATUSES } = require('../models/Order');

const getAvailableOrders = async (req, res) => {
  try {
    const { sortBy, sortDir } = req.query;

    const orders = await OrderModel.findAll({ 
      status: 'new', 
      sortBy: sortBy || 'created_at', 
      sortDir: sortDir || 'ASC' 
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error in getAvailableOrders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const masterId = req.user.id; 

    //перевіряємо, чи існує замовлення і чи воно досі вільне
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'new') {
      return res.status(409).json({ success: false, message: 'Order is already taken or cancelled' });
    }

    const updatedOrder = await OrderModel.update(orderId, {
      status: 'ASSIGNED',
      assigned_to: masterId
    });

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error in acceptOrder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const masterId = req.user.id;
    const { status, technician_comment } = req.body; 

    // валідація статусу
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // !! чи це замовлення належить цьому майстру?
    if (order.assigned_to !== masterId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own orders' });
    }

    // формуємо об'єкт для оновлення (щоб не перезаписати зайвого)
    const updates = { status };
    if (technician_comment !== undefined) {
      updates.technician_comment = technician_comment;
    }

    const updatedOrder = await OrderModel.update(orderId, updates);

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMyWorkOrders = async (req, res) => {
  try {
    const masterId = req.user.id;

    const orders = await OrderModel.findAll({ 
      assignedTo: masterId,
      sortBy: 'created_at',
      sortDir: 'DESC' 
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error in getMyWorkOrders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getMyWorkOrders
};