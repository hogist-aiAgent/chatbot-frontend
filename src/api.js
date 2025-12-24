import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000";

export const api = {
  // Chatbot Endpoints
  sendMessage: async (message, id) => {
    const res = await axios.post(`${API_BASE}/website-webhook`, { message, id });
    return res.data;
  },

  // Dashboard Endpoints
  getAllChats: async () => {
    const res = await axios.get(`${API_BASE}/website-get-all-chats`);
    return res.data;
  },
  getChatDetails: async (chatId) => {
    const res = await axios.get(`${API_BASE}/website-get-chat/${chatId}`);
    return res.data;
  }
};