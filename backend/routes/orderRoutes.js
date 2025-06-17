// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Sipariş oluşturma
router.post('/', protect, createOrder);

// Kullanıcının kendi siparişlerini getir
router.get('/myorders', protect, getMyOrders);

// Admin: Tüm siparişleri getir
router.get('/', protect, admin, getOrders);

// Sipariş güncelle (örneğin durum değiştirme)
router.put('/:id', protect, admin, updateOrderStatus);

// Tek bir siparişi ID ile getir (yetkili kullanıcı veya admin)
router.get('/:id', protect, getOrderById);

module.exports = router;
