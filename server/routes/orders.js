const express = require('express');
const router = express.Router();
const { Order, conn } = require('../db');
const authenticateWorker = require('../middleware/workerAuth');
const authenticateUser = require('../middleware/userAuth');
const createWorkerModel = require('../models/Worker');
const Worker = createWorkerModel(conn);


// ─── DIRECT BOOKING (no Cart, no Stripe) ────────────────────────────────────
// POST /api/orders/direct — requires user JWT via Authorization header
router.post('/direct', authenticateUser, async (req, res) => {
  try {
    const {
      workerId,
      workerName,
      workerCostPerHour,
      selectedDate,
      selectedTimeSlot,
      location,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!workerId || !selectedDate || !selectedTimeSlot || !location) {
      return res.status(400).json({ error: 'workerId, selectedDate, selectedTimeSlot, and location are required.' });
    }
    if (!contactInfo || !contactInfo.fullName || !contactInfo.mobileNumber || !contactInfo.email) {
      return res.status(400).json({ error: 'contactInfo (fullName, mobileNumber, email) is required.' });
    }

    const price = Number(workerCostPerHour) || 1000;

    const newOrder = new Order({
      user: req.userId,
      contactInfo,
      items: [{
        itemId: workerId,
        itemType: 'Worker',
        name: workerName || 'Service',
        price,
        quantity: 1,
        fees: 0
      }],
      location,
      date: new Date(selectedDate),
      timeSlots: [selectedTimeSlot],
      subtotal: price,
      deliveryFee: 0,
      platformFee: 0,
      discount: 0,
      tax: 0,
      total: price,
      paymentStatus: 'completed',
      paymentMethod: 'other',
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    console.log('✅ Direct booking created:', savedOrder._id);
    return res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating direct order:', error);
    return res.status(500).json({ error: error.message || 'Failed to create booking.' });
  }
});
// ─────────────────────────────────────────────────────────────────────────────



// Create a new order
router.post('/', async (req, res) => {
  try {
    const {
      contactInfo,
      items,
      location,
      date,
      timeSlots,
      subtotal,
      deliveryFee,
      platformFee,
      discount,
      tax,
      total,
      promoCode
    } = req.body;

    // Validate required fields
    if (!contactInfo || !items || !location || !date || !timeSlots || !subtotal || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate contact information
    if (!contactInfo.fullName || !contactInfo.mobileNumber || !contactInfo.email) {
      return res.status(400).json({ error: 'Contact information is incomplete' });
    }

    console.log('Creating order with contact info:', contactInfo);

    // Create new order
    const newOrder = new Order({
      contactInfo,
      items,
      location,
      date,
      timeSlots,
      subtotal,
      deliveryFee: deliveryFee || 0,
      platformFee: platformFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total,
      promoCode: promoCode || '',
      paymentStatus: 'pending',
      status: 'pending'
    });

    // If user is authenticated, associate order with user
    if (req.user) {
      newOrder.user = req.user._id;
    }

    // Save order to database
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get orders for specific worker
router.get('/worker', authenticateWorker, async (req, res) => {
  try {
    const workerId = req.workerId;
    console.log('=== WORKER DEBUG ===');
    console.log('Worker ID from token:', workerId);

    // Get worker details from workers cluster
    const worker = await Worker.findById(workerId);
    console.log('Worker found:', worker ? worker.username : 'NOT FOUND');

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check all orders first
    const allOrders = await Order.find({});
    console.log('Total orders in database:', allOrders.length);

    const pendingOrders = await Order.find({ status: 'pending' });
    console.log('Pending orders:', pendingOrders.length);

    if (pendingOrders.length > 0) {
      console.log('First pending order items:', pendingOrders[0].items);
    }

    // Find orders where worker name matches
    const orders = await Order.find({
      'items.name': worker.username,
      'items.itemType': 'Worker',
      'status': 'pending'
    }).sort({ createdAt: -1 });

    console.log('Orders found for', worker.username, ':', orders.length);
    console.log('=== END DEBUG ===');

    res.json(orders);
  } catch (error) {
    console.error('Error fetching worker orders:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating order', req.params.id, 'to status:', status);

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Order updated successfully');
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Update order status (PUT method)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;