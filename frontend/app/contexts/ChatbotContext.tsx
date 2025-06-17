// app/contexts/ChatbotContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { chatbotAPI } from '../services/chatbotAPI';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  type?: 'text' | 'product_list' | 'error';
  products?: any[];
  quickReplies?: QuickReply[];
}

interface QuickReply {
  text: string;
  action: string;
}

interface ChatbotContextType {
  isOpen: boolean;
  messages: Message[];
  loading: boolean;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  handleQuickReply: (action: string) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};

// Varsayılan hoş geldin mesajı
const welcomeMessage: Message = {
  id: '1',
  sender: 'bot',
  message: 'Merhaba! 👋 Size nasıl yardımcı olabilirim?',
  timestamp: new Date(),
  type: 'text',
  quickReplies: [
    { text: 'Ürünleri Göster', action: 'show_products' },
    { text: 'Popüler Ürünler', action: 'popular_products' },
    { text: 'Yardım', action: 'help' }
  ]
};

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    // Kullanıcı mesajını ekle
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // API'ye gönder
      const response = await chatbotAPI.sendMessage(message);
      const botResponse = response.data.response;

      // Bot yanıtını ekle
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: botResponse.message,
        timestamp: new Date(),
        type: botResponse.type,
        products: botResponse.products,
        quickReplies: botResponse.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      // Hata mesajı
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = useCallback(() => {
    setMessages([welcomeMessage]);
  }, []);

  const handleQuickReply = useCallback((action: string) => {
    const actionMessages: { [key: string]: string } = {
      'show_products': 'Ürünleri göster',
      'popular_products': 'Popüler ürünler',
      'new_products': 'Yeni ürünler',
      'help': 'Yardım',
      'my_orders': 'Siparişlerim',
      'login': '/login',
      'profile': '/profile'
    };

    const message = actionMessages[action];
    
    if (message) {
      if (message.startsWith('/')) {
        // Navigate to route
        window.location.href = message;
      } else {
        // Send as message
        sendMessage(message);
      }
    }
  }, []);

  const value = {
    isOpen,
    messages,
    loading,
    toggleChat,
    sendMessage,
    clearMessages,
    handleQuickReply
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};