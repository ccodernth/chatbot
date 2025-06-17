// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/new', productController.getNewProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/similar', productController.getSimilarProducts);

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;