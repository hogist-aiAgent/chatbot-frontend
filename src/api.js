import axios from "axios";

// ------------------------------
// Base API URL
// ------------------------------
const API_BASE = import.meta.env.VITE_API_BASE_URL;


// ------------------------------
// Axios instance
// ------------------------------
const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------
// Global error interceptor
// ------------------------------
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error.message);
    throw error;
  }
);

// ------------------------------
// API Methods
// ------------------------------
export const api = {
  // Send chatbot message
  sendMessage: async (message, id = null) => {
    const res = await client.post("/website-chat", {
      message,
      id,
    });
    return res.data;
  },

  // Get all chats (dashboard)
  getAllChats: async () => {
    const res = await client.get("/website-get-all-chats");
    return res.data;
  },

  // Get chat details by ID
  getChatDetails: async (chatId) => {
    const res = await client.get(`/website-get-chat/${chatId}`);
    return res.data;
  },

  // Generate summary for a chat
  generateSummary: async (chatId) => {
    const res = await client.post("/website-generate-summary", {
      chat_id: chatId,
    });
    return res.data;
  },
};

export default api;
