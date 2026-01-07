import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Fab,
  Fade,
  Avatar,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Close,
  Send,
  ReceiptLong,
  CheckCircle,
  WhatsApp,
} from "@mui/icons-material";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";

/* ------------------------------------
   API BASE URL
------------------------------------ */
export const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5005"
    : import.meta.env.VITE_API_BASE_URL;

const ChatWidget = () => {
  /* ------------------------------------
     STATE (merged from Zustand)
  ------------------------------------ */
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const localChat = JSON.parse(localStorage.getItem("messgae") || "[]");
  const messagesEndRef = useRef(null);

  /* ------------------------------------
     INIT WELCOME
  ------------------------------------ */
  useEffect(() => {
if (localChat.length !== 0) {
      setMessages(localChat);
    } 


    if (messages.length === 0&& localChat.length===0) {
      setMessages([
        {
          role: "assistant",
          text:
            "Hi, I am <b>Lisa</b>, your Hogist assistant! 👩‍🍳<br/>" +
            "I can help you plan meals for events or corporate needs.",
          isWelcome: true,
        },
      ]);
      localStorage.setItem("messgae", JSON.stringify([
        {
          role: "assistant",
          text:
            "Hi, I am <b>Lisa</b>, your Hogist assistant! 👩‍🍳<br/>" +
            "I can help you plan meals for events or corporate needs.",
          isWelcome: true,
        },
      ]));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("messgae", JSON.stringify(messages));
  }, [messages, isOpen]);



  /* ------------------------------------
     HELPERS
  ------------------------------------ */
  const toggleChat = () => setIsOpen((prev) => !prev);

  const isSummaryMessage = (text) =>
    text.includes("Name:") &&
    text.includes("Status:") &&
    text.includes("Guest Count:");

    
  /* ------------------------------------
     SEND MESSAGE (merged logic)
  ------------------------------------ */
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Handle "Others" shortcut
    if (text === "Others") {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: "Others" },
        {
          role: "assistant",
          text:
            "Thanks for reaching out to Hogist 😊<br/>" +
            "For any further queries, mail us at <b>support@hogist.com</b>.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    localStorage.setItem("messgae", JSON.stringify([...messages, { role: "user", text }]));
    setIsLoading(true);

try {
const res = await axios.post(`${API_BASE}/website-chat`, {
  message: text,
  chat_id: chatId,   // may be null on first call
});

// 🔥 THIS IS REQUIRED
if (!chatId && res.data.chat_id) {
  setChatId(res.data.chat_id);
}

      setChatId(res.data.chat_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.reply || "",
          data: res.data.data,
        },
      ]);
      localStorage.setItem("messgae", JSON.stringify([...messages, {
          role: "assistant",
          text: res.data.reply || "",
          data: res.data.data,
        },]));
    } catch (err) {
      console.error("Chat send failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
  setMessages([
    {
      role: "assistant",
      text:
        "Hi, I am <b>Lisa</b>, your Hogist assistant! 👩‍🍳<br/>" +
        "I can help you plan meals for events or corporate needs.",
      isWelcome: true,
    },
  ]);
  setChatId(null);
  setInput("");
  localStorage.removeItem("messgae");
};

  
  const handleSend = () => {
    sendMessage(input);
    setInput("");
  };

  /* ------------------------------------
     UI
  ------------------------------------ */
  return (
    <>
      <Fade in={isOpen}>
        <Paper
        elevation={24}
        sx={{
          position: "fixed",
          bottom: { xs: 15, sm: 40 },
          right: { xs: 0, sm: 32 },
          width: { xs: "100%", sm: 380 },
          height: { xs: "100%", sm: 580 },
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          
          borderRadius: "40px",      
          overflow: "hidden",       
          // ------------------------------

          bgcolor: "#F8F9FA",
        }}
      >
          {/* HEADER */}
          <Box
            sx={{
              p: 3,
              background:
                "linear-gradient(135deg,#8B0E1A,#B11226,#6F0B14)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="flex" gap={2} alignItems="center">
              <Avatar
                src="/download.png"
                sx={{ width: 44, height: 44, bgcolor: "white" }}
              />
              <Box>
                <Typography fontWeight={700}>Lisa</Typography>
                <Typography variant="caption">Hogist AI</Typography>
              </Box>
            </Box>
            <IconButton onClick={toggleChat} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>

          {/* BODY */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isSummary = !isUser && isSummaryMessage(msg.text);

              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  {isSummary ? (
                    <Paper sx={{ width: "90%", borderRadius: 3 }}>
                      <Box
                        sx={{
                          bgcolor: "#FFF8E1",
                          p: 2,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <ReceiptLong />
                        <Typography fontWeight={700}>
                          ORDER SUMMARY
                        </Typography>
                      </Box>

                      <Box sx={{ p: 2 }}>
                        {msg.text.split("\n").map((line, i) => {
                          if (!line.includes(":")) return null;
                          const [k, v] = line.split(/:(.+)/);
                          return (
                            <Box
                              key={i}
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography variant="caption" fontWeight={700}>
                                {k}
                              </Typography>
                              <Typography variant="body2">{v}</Typography>
                            </Box>
                          );
                        })}
                      </Box>

                      <Box sx={{ textAlign: "center", p: 1 }}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="caption" fontWeight={700}>
                          Lead Captured Successfully
                        </Typography>
                      </Box>
                    </Paper>
                  ) : (
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: "80%",
                        bgcolor: isUser ? "#B11226" : "white",
                        color: isUser ? "white" : "black",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{
                          __html: msg.text.replace(/\n/g, "<br/>"),
                        }}
                      />

                      {!isUser && idx === 0 && (
                        <Box 
                          mt={1.5} 
                          display="flex" 
                          gap={1} 
                          flexWrap="wrap" // Essential for the layout in Image 2
                          alignItems="center"
                        >
                          {/* Events Button */}
                          <Box
                            onClick={() => sendMessage("Events")}
                            sx={{
                              px: 1.5,
                              py: 0.6,
                              bgcolor: "#B11226",
                              color: "white",
                              borderRadius: "20px", // Forces the pill shape
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              whiteSpace: "nowrap"
                            }}
                          >
                            🎉 Events
                          </Box>

                          {/* Daily Meals Button */}
                          <Box
                            onClick={() => sendMessage("Daily Meals")}
                            sx={{
                              px: 1.5,
                              py: 0.6,
                              bgcolor: "#EDF2F7",
                              color: "#1A202C", // Darker text for readability
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              whiteSpace: "nowrap"
                            }}
                          >
                            🍱 Daily Meals
                          </Box>

                          {/* Others Button */}
                          <Box
                            onClick={() => sendMessage("Others")}
                            sx={{
                              px: 1.5,
                              py: 0.6,
                              bgcolor: "#6B7280",
                              color: "white",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              whiteSpace: "nowrap"
                            }}
                          >
                            📩 Others
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              );
            })}

            {isLoading && (
              <CircularProgress size={18} sx={{ ml: 2 }} />
            )}

            <div ref={messagesEndRef} />
          </Box>

{/* INPUT */}
<Box sx={{ p: 2 }}>
  <Box sx={{ display: "flex", gap: 1 }}>
    <TextField
      fullWidth
      placeholder="Type your request..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
    />
    <Fab onClick={handleSend} disabled={!input.trim()}>
      <Send />
    </Fab>
  </Box>

  {/* REFRESH / NEW CHAT */}
  <Box mt={1} textAlign="center">
    <IconButton
      size="small"
      onClick={resetChat}
      sx={{ color: "#6B7280" }}
    >
      <RefreshIcon fontSize="small" />
      <Typography variant="caption" ml={0.5}>
        Start new conversation
      </Typography>
    </IconButton>
  </Box>
</Box>

        </Paper>
      </Fade>

      {/* FLOATING BUTTON */}
      {!isOpen && (
        <Tooltip title="Start Ordering">
          <Fab
            onClick={toggleChat}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              bgcolor: "#25D366",
              color: "white",
            }}
          >
            <WhatsApp />
          </Fab>
        </Tooltip>
      )}
    </>
  );
};


export default ChatWidget;
