// app/services/chatbotAnalytics.js
class ChatbotAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
  }

  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track chat opened
  trackChatOpened() {
    this.trackEvent('chat_opened', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  // Track chat closed
  trackChatClosed(duration) {
    this.trackEvent('chat_closed', {
      duration,
      messageCount: this.events.filter(e => e.type === 'message_sent').length
    });
  }

  // Track message sent
  trackMessageSent(message, sender) {
    this.trackEvent('message_sent', {
      sender,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });
  }

  // Track product clicked
  trackProductClicked(productId, productName) {
    this.trackEvent('product_clicked', {
      productId,
      productName,
      source: 'chatbot'
    });
  }

  // Track quick reply used
  trackQuickReplyUsed(action) {
    this.trackEvent('quick_reply_used', {
      action,
      timestamp: new Date().toISOString()
    });
  }

  // Track conversion (product added to cart or order placed)
  trackConversion(type, productId, value) {
    this.trackEvent('conversion', {
      conversionType: type,
      productId,
      value,
      source: 'chatbot'
    });
  }

  // Generic event tracking
  trackEvent(eventName, data = {}) {
    const event = {
      type: eventName,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data
    };

    this.events.push(event);

    // Send to analytics endpoint (if available)
    this.sendToAnalytics(event);
  }

  // Send events to backend
  async sendToAnalytics(event) {
    try {
      // In production, you would send this to your analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
      } else {
        // In development, just log to console
        console.log('Chatbot Analytics:', event);
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  // Get session summary
  getSessionSummary() {
    const messagesSent = this.events.filter(e => e.type === 'message_sent').length;
    const productsViewed = this.events.filter(e => e.type === 'product_clicked').length;
    const conversions = this.events.filter(e => e.type === 'conversion').length;

    return {
      sessionId: this.sessionId,
      startTime: this.events[0]?.timestamp,
      endTime: this.events[this.events.length - 1]?.timestamp,
      messagesSent,
      productsViewed,
      conversions,
      events: this.events.length
    };
  }
}

export const chatbotAnalytics = new ChatbotAnalytics();