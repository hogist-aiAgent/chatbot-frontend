import { create } from 'zustand';
import axios from 'axios';

const API_URL = "http://127.0.0.1:5000";

export const useChatStore = create((set, get) => ({
  // State
  isOpen: false,
  messages: [],
  chatId: null,
  isLoading: false,

  // Actions
  toggleChat: () => set({ isOpen: !get().isOpen }),
  
  initWelcome: () => {
    if (get().messages.length === 0) {
      set({
        messages: [{
          role: 'assistant',
          text: "Hi, I am <b>Lisa</b>, your Hogist assistant! 👩‍🍳<br/>I can help you plan meals for events or corporate needs.",
          isWelcome: true
        }]
      });
    }
  },

  sendMessage: async (text) => {
    if (!text.trim()) return;

    const { chatId, messages } = get();
    
    // Optimistic Update
    set({ 
      messages: [...messages, { role: 'user', text }],
      isLoading: true 
    });

    try {
      const res = await axios.post(`${API_URL}/website-webhook`, { 
        message: text, 
        id: chatId 
      });

      set({ 
        chatId: res.data.chat_id,
        messages: [
          ...get().messages, 
          { 
            role: 'assistant', 
            text: res.data.reply || "", 
            data: res.data.data 
          }
        ],
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  }
}));