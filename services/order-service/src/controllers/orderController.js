const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving order list' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params; // ID з URL
  const { status, comment } = req.body; // новий статус і коментар з тіла запиту
  
  const masterId = req.user?.id || '00000000-0000-0000-0000-000000000000'; 

  try {
    const updatedOrder = await Order.updateStatus(id, masterId, status, comment);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Error updating status' });
  }
};