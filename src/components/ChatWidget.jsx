import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, Paper, Typography, IconButton, TextField, Fab, Fade, Avatar, 
  CircularProgress, Tooltip, Divider 
} from '@mui/material';
import { 
  Close, Send, SmartToy, ReceiptLong, CheckCircle, WhatsApp
} from '@mui/icons-material';
import { useChatStore } from '../store/useChatStore';

const ChatWidget = () => {
  const { isOpen, toggleChat, messages, sendMessage, isLoading, initWelcome } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { initWelcome(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  // Helper to check if the message is the Final Summary
  const isSummaryMessage = (text) => {
    return text.includes("Name:") && text.includes("Status:") && text.includes("Guest Count:");
  };

  return (
    <>
      <Fade in={isOpen}>
        <Paper 
          elevation={24}
          sx={{
            position: 'fixed', bottom: { xs: 15, sm: 40 },right: { xs: 0, sm: 32 },
            width: { xs: '100%', sm: 380 }, height: { xs: '100%', sm: 650 },
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            zIndex: 9999, borderRadius: { xs: '20px 20px 0 0', sm: 4 },
            border: '1px solid rgba(255,255,255,0.5)',
            bgcolor: '#F8F9FA'
          }}
        >
          {/* Header */}
<Box sx={{ 
  p: 3,
  background: 'linear-gradient(135deg, #8B0E1A 0%, #B11226 45%, #6F0B14 100%)',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 6px 24px rgba(139, 14, 26, 0.45)'
}}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
<Avatar
  src="/download.png"
  alt="Hogist Logo"
  sx={{
    width: 44,
    height: 44,
    bgcolor: 'white',
    border: '2px solid rgba(255,255,255,0.7)',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.15)'
  }}
/>

                <Box sx={{ 
                  position: 'absolute', bottom: 2, right: 0, width: 12, height: 12, 
                  bgcolor: '#48BB78', border: '2px solid #2C3E50', borderRadius: '50%' 
                }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>Lisa</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>Hogist AI</Typography>
              </Box>
            </Box>
            <IconButton onClick={toggleChat} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Close />
            </IconButton>
          </Box>

          {/* Chat Body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, bgcolor: '#F0F2F5' }}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isSummary = !isUser && isSummaryMessage(msg.text);

              return (
                <Box key={idx} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
                   {!isUser && !isSummary && <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: '#CBD5E0', fontSize: 14 }}>AI</Avatar>}
                  
                  {isSummary ? (
                    // ---------------- SUMMARY CARD STYLE ----------------
                    <Paper 
                      elevation={3}
                      sx={{ 
                        maxWidth: '90%', width: '100%', overflow: 'hidden', borderRadius: 3,
                        border: '1px solid #E2E8F0'
                      }}
                    >
                        {/* Summary Header */}
                        <Box sx={{ bgcolor: '#FFF8E1', p: 2, borderBottom: '1px dashed #F0E68C', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptLong sx={{ color: '#D4AF37' }} />
                            <Typography variant="subtitle2" fontWeight="800" color="#B7950B">ORDER SUMMARY</Typography>
                        </Box>
                        
                        {/* Summary Content */}
<Box sx={{ p: 2.5, bgcolor: 'white' }}>
  {(() => {
    const lines = msg.text.split('\n');

    const meetingDate = lines.find(l =>
      l.toLowerCase().includes('meeting date')
    );

    const meetingTime = lines.find(l =>
      l.toLowerCase().includes('meeting time')
    );

    return (
      <>
        {/* MEETING SCHEDULE */}
        {(meetingDate || meetingTime) && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              fontWeight="800"
              color="#B11226"
              sx={{ mb: 1, display: 'block' }}
            >
              MEETING SCHEDULE
            </Typography>

            {meetingDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  DATE
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {meetingDate.split(':')[1]?.trim()}
                </Typography>
              </Box>
            )}

            {meetingTime && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  TIME
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {meetingTime.split(':')[1]?.trim()}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />
          </Box>
        )}

        {/* MAIN SUMMARY DETAILS */}
        {lines.map((line, i) => {
          if (
            line.includes(':') &&
            !line.toLowerCase().includes('meeting date') &&
            !line.toLowerCase().includes('meeting time')
          ) {
            const [key, val] = line.split(/:(.+)/);
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  fontSize: '0.9rem'
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {key.trim().toUpperCase()}
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="#2D3748"
                  align="right"
                >
                  {val?.trim()}
                </Typography>
              </Box>
            );
          }

          return null;
        })}
      </>
    );
  })()}
</Box>

                        {/* Footer */}
                        <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, textAlign: 'center', borderTop: '1px solid #E2E8F0' }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                <CheckCircle fontSize="small" color="success" />
                                <Typography variant="caption" fontWeight="bold" color="success.main">Lead Captured Successfully</Typography>
                            </Box>
                        </Box>
                    </Paper>
                  ) : (
                    // ---------------- STANDARD BUBBLE STYLE ----------------
                  <Paper 
                    elevation={isUser ? 0 : 1}
                    sx={{ 
                      p: 2,
                      px: 2.5,
                      maxWidth: '80%',
                      bgcolor: isUser ? '#B11226' : 'white',
                      color: isUser ? 'white' : '#2D3748',
                      borderRadius: 2.5,
                      borderTopRightRadius: isUser ? 0 : 20,
                      borderTopLeftRadius: isUser ? 20 : 0
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                    />

                    {/* QUICK ACTION BUTTONS (ONLY FOR FIRST BOT MESSAGE) */}
                    {!isUser && idx === 0 && (
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                        <Box
                          onClick={() => sendMessage("Events")}
                          sx={{
                            px: 2,
                            py: 0.8,
                            borderRadius: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            bgcolor: '#B11226',
                            color: 'white',
                            '&:hover': { bgcolor: '#8E0F1F' }
                          }}
                        >
                          🎉 Events
                        </Box>

                        <Box
                          onClick={() => sendMessage("Daily Meals")}
                          sx={{
                            px: 2,
                            py: 0.8,
                            borderRadius: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            bgcolor: '#EDF2F7',
                            color: '#2D3748',
                            '&:hover': { bgcolor: '#E2E8F0' }
                          }}
                        >
                          🍱 Daily Meals
                        </Box>
                      </Box>
                    )}
                  </Paper>

                  )}
                </Box>
              );
            })}
            {isLoading && (
              <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
                <CircularProgress size={16} thickness={6} sx={{ color: '#A0AEC0' }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1, borderTop: '1px solid #f0f0f0' }}>
            <TextField 
              fullWidth variant="outlined" placeholder="Type your request..." 
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F7FAFC', borderRadius: 10 } }}
            />
            <Fab color="primary" size="medium" onClick={handleSend} disabled={!input.trim()} sx={{ boxShadow: 'none', bgcolor: '#2C3E50', '&:hover': { bgcolor: '#34495E' } }}>
              <Send fontSize="small" />
            </Fab>
          </Box>
        </Paper>
      </Fade>

      {/* Floating Launcher */}
      {!isOpen && (
        <Tooltip title="Start Ordering" placement="left">
          <Fab 
            aria-label="chat" 
            onClick={toggleChat}
            sx={{ 
              position: 'fixed', bottom: 32, right: 32, width: 64, height: 64, 
              bgcolor: '#25D366', // <--- CHANGED: WhatsApp Green
              color: 'white',
              boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4)', // <--- CHANGED: Green Shadow
              '&:hover': { 
                bgcolor: '#128C7E', // <--- CHANGED: Darker Green on Hover
                transform: 'scale(1.05)',
                transition: 'all 0.3s'
              }
            }}
          >
              <WhatsApp sx={{ fontSize: 32 }} /> {/* <--- CHANGED: WhatsApp Icon */}
          </Fab>
        </Tooltip>
      )}
    </>
  );
};

export default ChatWidget;