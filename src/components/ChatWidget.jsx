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
} from "@mui/material";
import { Close, Send, WhatsApp, RestartAlt } from "@mui/icons-material";
import axios from "axios";
import avatarIcon from "../../public/download.png";

export const API_BASE =
  false ? "http://127.0.0.1:5005" : import.meta.env.VITE_API_BASE_URL;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [expectingDate, setExpectingDate] = useState(false);

  const messagesEndRef = useRef(null);
  const localChat = JSON.parse(localStorage.getItem("messgae") || "[]");

  const welcomeMessage = [
    {
      role: "assistant",
      text:
        "Hi, I am <b>Lisa</b>, your Hogist assistant.<br/>" +
        "I can help you plan meals for events or corporate needs.",
    },
  ];


  useEffect(() => {
    if (localChat.length) {
      setMessages(localChat);
    } else {
      setMessages(welcomeMessage);
      localStorage.setItem("messgae", JSON.stringify(welcomeMessage));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("messgae", JSON.stringify(messages));
  }, [messages]);


  const startNewChat = () => {
    setMessages(welcomeMessage);
    setChatId(null);
    setInput("");
    setExpectingDate(false);
    localStorage.setItem("messgae", JSON.stringify(welcomeMessage));
  };


  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/website-chat`, {
        message: text,
        chat_id: chatId,
      });

      const reply = res.data.reply || "";

      // Detect date request
      if (
        reply.toLowerCase().includes("event date") &&
        reply.toLowerCase().includes("calendar")
      ) {
        setExpectingDate(true);
      } else {
        setExpectingDate(false);
      }

      if (!chatId && res.data.chat_id) {
        setChatId(res.data.chat_id);
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      <Fade in={isOpen}>
        <Paper
          elevation={24}
          sx={{
            position: "fixed",
            bottom: { xs: 0, sm: 40 },
            right: { xs: 0, sm: 32 },
            width: { xs: "100%", sm: 380 },
            height: { xs: "100%", sm: 580 },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 0, sm: "24px" },
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background:
                "linear-gradient(135deg,#8B0E1A,#B11226,#6F0B14)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="flex" gap={1.5} alignItems="center">
              <Avatar src={avatarIcon} sx={{ width: 38, height: 38 }} />
              <Box>
                <Typography fontWeight={700}>Lisa</Typography>
                <Typography variant="caption">Hogist AI</Typography>
              </Box>
            </Box>

            <Box>
              <IconButton onClick={startNewChat} sx={{ color: "white" }}>
                <RestartAlt />
              </IconButton>
              <IconButton onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* BODY */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              background: "linear-gradient(180deg,#F9FAFB,#F3F4F6)",
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 1,
                  mb: 2,
                }}
              >
                {msg.role === "assistant" && (
                  <Avatar src={avatarIcon} sx={{ width: 32, height: 32 }} />
                )}

                <Paper
                  sx={{
                    px: 1.6,
                    py: 1.2,
                    maxWidth: "70%",
                    bgcolor: msg.role === "user" ? "#B11226" : "#FFFFFF",
                    color: msg.role === "user" ? "white" : "#111827",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 6px 18px"
                        : "18px 18px 18px 6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  <Typography
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\n/g, "<br/>"),
                    }}
                  />
                </Paper>

                {msg.role === "user" && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#E5E7EB",
                      color: "#374151",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    U
                  </Avatar>
                )}
              </Box>
            ))}

            {isLoading && <CircularProgress size={20} />}
            <div ref={messagesEndRef} />
          </Box>

          {/* INPUT */}
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid #E5E7EB",
              background: "white",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {expectingDate ? (
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={input}
                  onChange={(e) => {
                    const date = e.target.value;
                    setInput(date);
                    sendMessage(date);
                    setExpectingDate(false);
                  }}
                />
              ) : (
                <>
                  <TextField
                    fullWidth
                    placeholder="Message Lisa…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    size="small"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    sx={{
                      bgcolor: "#F3F4F6",
                      borderRadius: "999px",
                    }}
                  />

                  <Fab
                    onClick={handleSend}
                    disabled={!input.trim()}
                    size="small"
                    sx={{
                      bgcolor: "#B11226",
                      color: "white",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#9B0E20" },
                    }}
                  >
                    <Send fontSize="small" />
                  </Fab>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>

      {!isOpen && (
        <Tooltip title="Start Ordering">
          <Fab
            onClick={() => setIsOpen(true)}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              bgcolor: "#25D366",
              color: "white",
              boxShadow: "0 8px 24px rgba(37,211,102,.4)",
              "&:hover": { bgcolor: "#20BA5A" },
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
