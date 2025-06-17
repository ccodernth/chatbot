// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Public route - herkes mesaj gönderebilir
router.post('/message', chatbotController.processMessage);

// Öneriler - herkes görebilir
router.get('/suggestions', chatbotController.getSuggestions);

// Protected routes - sadece giriş yapmış kullanıcılar
router.get('/history', protect, chatbotController.getConversationHistory);
router.delete('/history', protect, chatbotController.clearConversation);

module.exports = router;