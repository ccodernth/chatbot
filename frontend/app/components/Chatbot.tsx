// app/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Loader,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';
import { Link } from '@remix-run/react';

export default function Chatbot() {
  const { isOpen, messages, loading, toggleChat, sendMessage, handleQuickReply } = useChatbot();
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !loading) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Chat button when closed
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
        aria-label="Sohbeti aç"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      {/* Chat Window */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-600"></span>
            </div>
            <div>
              <h3 className="font-semibold">Asistan</h3>
              <p className="text-xs text-blue-100">Çevrimiçi</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMinimize}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Küçült"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="h-96 overflow-y-auto bg-gray-50">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                      </div>

                      {/* Timestamp */}
                      <p className={`text-xs text-gray-500 mt-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* Product List */}
                      {message.type === 'product_list' && message.products && (
                        <div className="mt-3 space-y-2">
                          {message.products.map((product: any) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              className="block bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow"
                              onClick={toggleChat}
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {product.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-blue-600 font-semibold">
                                      ₺{product.price.toLocaleString('tr-TR')}
                                    </span>
                                    {product.inStock ? (
                                      <span className="text-xs text-green-600">Stokta</span>
                                    ) : (
                                      <span className="text-xs text-red-600">Stok Yok</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                          {message.hasMore && (
                            <button
                              onClick={() => sendMessage('Daha fazla ürün göster')}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                            >
                              Daha fazla göster
                            </button>
                          )}
                        </div>
                      )}

                      {/* Quick Replies */}
                      {message.quickReplies && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.quickReplies.map((reply, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickReply(reply.action)}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                              {reply.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-md">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Gönder"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Powered by AI Assistant
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
