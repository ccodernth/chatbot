// controllers/chatbotController.js
const chatbotService = require('../services/chatbotService');

// Chatbot mesajını işle
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mesaj içeriği gerekli'
      });
    }

    const response = await chatbotService.processMessage(message, userId);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chatbot controller hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj işlenirken bir hata oluştu',
      response: {
        type: 'error',
        message: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      }
    });
  }
};

// Kullanıcı konuşma geçmişini getir
exports.getConversationHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Konuşma geçmişi için giriş yapmanız gerekiyor'
      });
    }

    const conversation = await chatbotService.getUserConversation(req.user.id);

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Konuşma geçmişi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşma geçmişi getirilirken bir hata oluştu'
    });
  }
};

// Konuşma geçmişini temizle
exports.clearConversation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }

    await chatbotService.clearConversation(req.user.id);

    res.json({
      success: true,
      message: 'Konuşma geçmişi temizlendi'
    });
  } catch (error) {
    console.error('Konuşma temizleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşma geçmişi temizlenirken bir hata oluştu'
    });
  }
};

// Chatbot önerilerini getir (quick replies için)
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      { text: 'Ürünleri Göster', action: 'show_products' },
      { text: 'Popüler Ürünler', action: 'popular_products' },
      { text: 'Yeni Ürünler', action: 'new_products' },
      { text: 'Yardım', action: 'help' }
    ];

    if (req.user) {
      suggestions.push({ text: 'Siparişlerim', action: 'my_orders' });
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Öneriler getirilirken bir hata oluştu'
    });
  }
};