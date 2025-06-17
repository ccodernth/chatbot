// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadConfig } = require('../config/multerConfig');

// Tüm admin route'ları koruma altında
router.use(protect, admin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/dashboard/sales-chart', adminController.getSalesChart);
router.get('/dashboard/category-distribution', adminController.getCategoryDistribution);

// Ürün yönetimi
router.post('/products/upload-images', 
  uploadConfig.product.array('images', 5), 
  adminController.uploadProductImages
);
router.put('/products/bulk-update', adminController.bulkUpdateProducts);
router.delete('/products/bulk-delete', adminController.bulkDeleteProducts);

// Kullanıcı yönetimi
router.get('/users', adminController.getUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

// Sipariş yönetimi
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Sistem
router.get('/logs', adminController.getSystemLogs);

module.exports = router;