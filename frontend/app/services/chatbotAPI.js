// app/services/chatbotAPI.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance for chatbot
const chatbotAxios = axios.create({
  baseURL: `${API_URL}/chatbot`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token if user is logged in
chatbotAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const chatbotAPI = {
  sendMessage: (message) => 
    chatbotAxios.post('/message', { message }),
  
  getHistory: () => 
    chatbotAxios.get('/history'),
  
  clearHistory: () => 
    chatbotAxios.delete('/history'),
  
  getSuggestions: () => 
    chatbotAxios.get('/suggestions')
};