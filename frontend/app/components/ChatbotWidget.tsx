// app/components/ChatbotWidget.tsx
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, RefreshCw } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';

interface ChatbotWidgetProps {
  enableSound?: boolean;
  enableDownload?: boolean;
}

export function ChatbotWidget({ 
  enableSound = true, 
  enableDownload = true 
}: ChatbotWidgetProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { messages, clearMessages } = useChatbot();

  // Play sound when new message arrives
  useEffect(() => {
    if (soundEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        playNotificationSound();
      }
    }
  }, [messages, soundEnabled]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const downloadConversation = () => {
    const conversationText = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString('tr-TR')}] ${
        msg.sender === 'user' ? 'Siz' : 'Asistan'
      }: ${msg.message}`
    ).join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sohbet-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      {enableSound && (
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      )}

      <button
        onClick={clearMessages}
        className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Sohbeti temizle"
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      {enableDownload && messages.length > 1 && (
        <button
          onClick={downloadConversation}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Sohbeti indir"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span className="text-xs text-gray-500">Asistan yazıyor...</span>
    </div>
  );
}

// Product card component for chatbot
export function ChatbotProductCard({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-blue-600">
          ₺{product.price.toLocaleString('tr-TR')}
        </span>
        <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
          {product.inStock ? 'Stokta' : 'Stok Yok'}
        </span>
      </div>

      <div className="flex gap-2">
        <a
          href={`/product/${product.id}`}
          onClick={onClose}
          className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ürünü İncele
        </a>
        {product.inStock && (
          <button
            onClick={() => {
              // Add to cart logic
              alert('Sepete eklendi!');
            }}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sepete Ekle
          </button>
        )}
      </div>
    </div>
  );
}