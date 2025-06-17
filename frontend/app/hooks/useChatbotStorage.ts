// app/hooks/useChatbotStorage.ts
import { useState, useEffect } from 'react';

interface StoredMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  type?: string;
}

const STORAGE_KEY = 'chatbot_messages';
const MAX_STORED_MESSAGES = 50;

export function useChatbotStorage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages from localStorage
  const loadMessages = (): StoredMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    return [];
  };

  // Save messages to localStorage
  const saveMessages = (messages: any[]) => {
    try {
      // Keep only the last MAX_STORED_MESSAGES messages
      const messagesToStore = messages
        .slice(-MAX_STORED_MESSAGES)
        .map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  };

  // Clear stored messages
  const clearStoredMessages = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  };

  // Get chat preferences
  const getChatPreferences = () => {
    try {
      const prefs = localStorage.getItem('chatbot_preferences');
      return prefs ? JSON.parse(prefs) : {
        soundEnabled: true,
        position: 'bottom-right',
        theme: 'light'
      };
    } catch {
      return {
        soundEnabled: true,
        position: 'bottom-right',
        theme: 'light'
      };
    }
  };

  // Save chat preferences
  const saveChatPreferences = (preferences: any) => {
    try {
      localStorage.setItem('chatbot_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving chat preferences:', error);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return {
    isLoaded,
    loadMessages,
    saveMessages,
    clearStoredMessages,
    getChatPreferences,
    saveChatPreferences
  };
}