// services/chatbotService.js
const productService = require('./productService');
const Conversation = require('../models/conversationModel');

class ChatbotService {
  // Mesajı işle ve yanıt oluştur
  async processMessage(message, userId = null) {
    try {
      // Mesajı normalize et
      const normalizedMessage = message.toLowerCase().trim();
      
      // Intent belirleme
      const intent = this.detectIntent(normalizedMessage);
      
      // Intent'e göre yanıt oluştur
      let response;
      switch (intent) {
        case 'greeting':
          response = await this.handleGreeting();
          break;
        case 'product_search':
          response = await this.handleProductSearch(normalizedMessage);
          break;
        case 'product_list':
          response = await this.handleProductList();
          break;
        case 'popular_products':
          response = await this.handlePopularProducts();
          break;
        case 'new_products':
          response = await this.handleNewProducts();
          break;
        case 'help':
          response = await this.handleHelp();
          break;
        case 'order_status':
          response = await this.handleOrderStatus(userId);
          break;
        default:
          response = await this.handleUnknown();
      }

      // Konuşmayı kaydet
      if (userId) {
        await this.saveConversation(userId, message, response);
      }

      return response;
    } catch (error) {
      console.error('Chatbot mesaj işleme hatası:', error);
      return {
        type: 'error',
        message: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      };
    }
  }

  // Intent belirleme
  detectIntent(message) {
    const intents = {
      greeting: ['merhaba', 'selam', 'günaydın', 'iyi günler', 'hey', 'hello', 'hi'],
      product_list: ['ürünler', 'ürünleri göster', 'ürün listesi', 'ne satıyorsunuz'],
      popular_products: ['popüler', 'en çok satan', 'trend', 'beğenilen'],
      new_products: ['yeni ürün', 'yeni gelen', 'son ürünler'],
      help: ['yardım', 'nasıl', 'bilgi', 'destek', 'help'],
      order_status: ['sipariş', 'kargo', 'durum', 'nerede']
    };

    // Intent eşleştirme
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }

    // Ürün araması için kontrol
    if (message.length > 2) {
      return 'product_search';
    }

    return 'unknown';
  }

  // Selamlama yanıtı
  async handleGreeting() {
    const greetings = [
      'Merhaba! Size nasıl yardımcı olabilirim? 😊',
      'Hoş geldiniz! Ürünlerimizi görmek ister misiniz?',
      'Merhaba! Bugün hangi ürünle ilgileniyorsunuz?'
    ];

    return {
      type: 'text',
      message: greetings[Math.floor(Math.random() * greetings.length)],
      quickReplies: [
        { text: 'Ürünleri Göster', action: 'show_products' },
        { text: 'Popüler Ürünler', action: 'popular_products' },
        { text: 'Yardım', action: 'help' }
      ]
    };
  }

  // Ürün arama yanıtı
  async handleProductSearch(message) {
    const products = await productService.searchProducts(message, 6);

    if (products.length === 0) {
      return {
        type: 'text',
        message: `"${message}" ile ilgili ürün bulunamadı. Başka bir şey aramak ister misiniz?`,
        quickReplies: [
          { text: 'Tüm Ürünler', action: 'show_products' },
          { text: 'Popüler Ürünler', action: 'popular_products' }
        ]
      };
    }

    return {
      type: 'product_list',
      message: `"${message}" ile ilgili ${products.length} ürün bulundu:`,
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        description: product.description,
        inStock: product.inStock
      }))
    };
  }

  // Tüm ürünleri listele
  async handleProductList() {
    const { products } = await productService.getAllProducts({}, 1, 8);

    return {
      type: 'product_list',
      message: 'İşte ürünlerimiz:',
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        description: product.description,
        inStock: product.inStock
      })),
      hasMore: true
    };
  }

  // Popüler ürünler
  async handlePopularProducts() {
    const products = await productService.getPopularProducts(6);

    return {
      type: 'product_list',
      message: 'En popüler ürünlerimiz:',
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        rating: product.rating,
        soldCount: product.soldCount
      }))
    };
  }

  // Yeni ürünler
  async handleNewProducts() {
    const products = await productService.getNewProducts(6);

    return {
      type: 'product_list',
      message: 'En yeni ürünlerimiz:',
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        isNew: true
      }))
    };
  }

  // Yardım yanıtı
  async handleHelp() {
    return {
      type: 'text',
      message: `Size şu konularda yardımcı olabilirim:
      
🛍️ Ürün arama - İstediğiniz ürünü yazın
📦 Ürün listesi - "Ürünleri göster" yazın
⭐ Popüler ürünler - "Popüler ürünler" yazın
🆕 Yeni ürünler - "Yeni ürünler" yazın
📋 Sipariş durumu - "Sipariş durumu" yazın
      
Başka bir sorunuz varsa yazabilirsiniz!`,
      quickReplies: [
        { text: 'Ürünleri Göster', action: 'show_products' },
        { text: 'Popüler Ürünler', action: 'popular_products' }
      ]
    };
  }

  // Sipariş durumu
  async handleOrderStatus(userId) {
    if (!userId) {
      return {
        type: 'text',
        message: 'Sipariş durumunu görebilmek için lütfen giriş yapın.',
        quickReplies: [
          { text: 'Giriş Yap', action: 'login' },
          { text: 'Ürünleri Göster', action: 'show_products' }
        ]
      };
    }

    // Bu kısım orderService entegrasyonu ile genişletilebilir
    return {
      type: 'text',
      message: 'Sipariş durumunuzu kontrol etmek için sipariş numaranızı yazın veya profil sayfanızı ziyaret edin.',
      quickReplies: [
        { text: 'Profilim', action: 'profile' },
        { text: 'Ürünleri Göster', action: 'show_products' }
      ]
    };
  }

  // Bilinmeyen komut
  async handleUnknown() {
    return {
      type: 'text',
      message: 'Üzgünüm, ne demek istediğinizi anlayamadım. Size nasıl yardımcı olabilirim?',
      quickReplies: [
        { text: 'Ürünleri Göster', action: 'show_products' },
        { text: 'Yardım', action: 'help' }
      ]
    };
  }

  // Konuşma geçmişini kaydet
  async saveConversation(userId, userMessage, botResponse) {
    try {
      let conversation = await Conversation.findOne({ user: userId });

      if (!conversation) {
        conversation = new Conversation({ user: userId, messages: [] });
      }

      // Kullanıcı mesajı
      conversation.messages.push({
        sender: 'user',
        message: userMessage,
        timestamp: new Date()
      });

      // Bot yanıtı
      conversation.messages.push({
        sender: 'bot',
        message: botResponse.message,
        type: botResponse.type,
        timestamp: new Date()
      });

      // Son 50 mesajı tut
      if (conversation.messages.length > 50) {
        conversation.messages = conversation.messages.slice(-50);
      }

      conversation.lastActivity = new Date();
      await conversation.save();
    } catch (error) {
      console.error('Konuşma kaydetme hatası:', error);
    }
  }

  // Kullanıcı konuşma geçmişini getir
  async getUserConversation(userId) {
    try {
      const conversation = await Conversation.findOne({ user: userId })
        .select('messages lastActivity');

      return conversation || { messages: [] };
    } catch (error) {
      throw new Error(`Konuşma geçmişi getirilirken hata: ${error.message}`);
    }
  }

  // Konuşma geçmişini temizle
  async clearConversation(userId) {
    try {
      await Conversation.findOneAndUpdate(
        { user: userId },
        { messages: [], lastActivity: new Date() },
        { upsert: true }
      );

      return { message: 'Konuşma geçmişi temizlendi' };
    } catch (error) {
      throw new Error(`Konuşma geçmişi temizlenirken hata: ${error.message}`);
    }
  }
}

module.exports = new ChatbotService();