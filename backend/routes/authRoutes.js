// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Kullanıcı kaydı
router.post('/register', registerUser);

// Kullanıcı girişi
router.post('/login', authUser);

// Profil bilgisi
router.get('/profile', protect, getUserProfile);

module.exports = router;
