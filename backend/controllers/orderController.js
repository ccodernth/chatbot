// controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

// @desc    Sipariş oluştur
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, address } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Sepet boş');
  }

  // Toplam fiyatı hesaplayalım
  const totalPrice = orderItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const order = new Order({
    user: req.user._id,
    orderItems,
    totalPrice,
    address,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Kullanıcının siparişlerini getir
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'name imageURL price');
  res.json(orders);
});

// @desc    Admin: Tüm siparişleri getir
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
});

// @desc    Tek bir siparişi getir
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    // Sadece siparişi oluşturan kullanıcı veya admin erişebilsin
    if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('Erişim yetkiniz yok');
    }
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
});

// @desc    Admin: Sipariş durumunu güncelle
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
