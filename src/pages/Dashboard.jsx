import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton, 
  ListItemAvatar, Avatar, Paper, IconButton, InputBase, 
  LinearProgress, Badge, TextField, Skeleton, useMediaQuery
} from '@mui/material';
import { 
  Search, Notifications, Phone, Mail, Place, Circle, 
  CheckCircle, CalendarMonth, FilterList, Bolt, ArrowBack, Info, Close, Description
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SIDEBAR_WIDTH = 360;
const DETAILS_WIDTH = 400;

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/Current DateTime:.*$/gmi, '').trim();
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [internalNote, setInternalNote] = useState("");
  
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // 1. Fetch Chat List
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/website-get-all-chats');
        setChats(res.data);
      } catch(e) {}
    };
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Active Chat
  useEffect(() => {
    if(!activeChatId) return;
    
    setSummary(""); 
    setLoadingSummary(true);
    setShowMobileDetails(false); 

    const fetchChat = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/website-get-chat/${activeChatId}`);
        setActiveMessages(res.data.messages || []);
        generateSummary(activeChatId);
      } catch(e) { 
        setLoadingSummary(false);
      }
    };
    fetchChat();
    
    const interval = setInterval(async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:5000/website-get-chat/${activeChatId}`);
            setActiveMessages(res.data.messages || []);
        } catch(e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const generateSummary = async (chatId) => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/website-generate-summary', { chat_id: chatId });
      setSummary(res.data.summary);
    } catch (e) {
      setSummary("Summary unavailable.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 3. INTELLIGENT DATA PARSER
  const activeLeadData = useMemo(() => {
    const msgData = [...activeMessages].reverse().find(m => m.data)?.data;
    const listData = chats.find(c => c.chat_id === activeChatId)?.lead_data;
    let data = { ...(listData || {}), ...(msgData || {}) };

    if (summary) {
        const nameMatch = summary.match(/(?:Name|Customer):\**\s*(.*?)(?:\s*(?:Event|Date|-|\n)|$)/i);
        const locMatch = summary.match(/(?:Location|at):\**\s*([A-Za-z\s,]+?)(?:\.|-|\n|$)/i); 
        const dateMatch = summary.match(/(?:Event Date|Date):\**\s*(.*?)(?:\s*(?:Guest|-|\n)|$)/i);
        const countMatch = summary.match(/(?:Guest Count|Guests):\**\s*(\d+)/i);
        const phoneMatch = summary.match(/(?:Contact|Phone).*?(\d{10})/i);
        const emailMatch = summary.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);

        if (!data.customer_name || data.customer_name === "Guest") {
            if (nameMatch && nameMatch[1]) data.customer_name = nameMatch[1].trim();
        }
        if (!data.delivery_location || data.delivery_location.length === 0) {
            const statusLoc = summary.match(/at\s+([A-Z][a-zA-Z\s]+)(?:$|\n|\.)/);
            if (locMatch && locMatch[1]) data.delivery_location = [locMatch[1].trim()];
            else if (statusLoc && statusLoc[1]) data.delivery_location = [statusLoc[1].trim()];
        }
        if (!data.contact_number && phoneMatch) data.contact_number = phoneMatch[1];
        if (!data.email && emailMatch) data.email = emailMatch[1];
        if (!data.event_date_time && dateMatch) data.event_date_time = dateMatch[1].trim();
        if (!data.count && countMatch) data.count = countMatch[1].trim();
    }
    return data;
  }, [activeMessages, chats, activeChatId, summary]);

  const leadScore = useMemo(() => {
    if (!activeLeadData) return 0;
    let score = 0;
    if (activeLeadData.customer_name && activeLeadData.customer_name !== "Guest") score += 30;
    if (activeLeadData.contact_number) score += 30;
    if (activeLeadData.delivery_location) score += 20;
    if (activeLeadData.event_type) score += 10;
    if (activeLeadData.count) score += 10;
    return Math.min(score, 100);
  }, [activeLeadData]);

  const filteredChats = chats.filter(chat => {
    const term = search.toLowerCase();
    const content = chat.search_content || "";
    return content.includes(term);
  });

  // UI SECTIONS
  const Sidebar = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderRight: '1px solid #E0E0E0' }}>
    {/* 1. Header with Search */}
    <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Avatar sx={{ bgcolor: '#2C3E50', width: 32, height: 32, fontSize: 16, fontWeight: 'bold', color: '#D4AF37' }}>H</Avatar>
            <Typography variant="h6" fontWeight="800" color="#2C3E50">Hogist CRM</Typography>
        </Box>
        <Paper elevation={0} sx={{ p: '6px 12px', display: 'flex', alignItems: 'center', borderRadius: 3, bgcolor: '#F8F9FA', border: '1px solid #E9ECEF' }}>
            <Search sx={{ color: '#A0AEC0' }} />
            <InputBase sx={{ ml: 1, flex: 1, fontSize: 14 }} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </Paper>
    </Box>

    {/* 2. Chat List */}
    <List sx={{ px: 1, pb: 2, flex: 1, overflowY: 'auto' }}>
        {filteredChats.map((chat) => {
            // --- DATA EXTRACTION ---
            const data = chat.lead_data || {};
            
            // Name Logic: Use DB name or fallback to "Guest"
            const name = data.customer_name || "Guest";

            // Location Logic: Handle ["Chennai"] or "Chennai"
            let locString = "";
            const rawLoc = data.delivery_location;
            if (Array.isArray(rawLoc) && rawLoc.length > 0) {
                locString = `(${rawLoc[0]})`;
            } else if (typeof rawLoc === 'string' && rawLoc.trim() !== "") {
                locString = `(${rawLoc})`;
            }

            // --- UNREAD LOGIC ---
            // It is UNREAD if 'read_by_admin' is explicitly false.
            // We also hide the dot if the user is currently viewing this specific chat.
            const isUnread = chat.read_by_admin === false && activeChatId !== chat.chat_id;

            return (
                <ListItemButton 
                    key={chat.chat_id} 
                    selected={activeChatId === chat.chat_id} 
                    onClick={() => setActiveChatId(chat.chat_id)}
                    sx={{ 
                        borderRadius: 3, 
                        mb: 0.5, 
                        p: 1.5, 
                        bgcolor: activeChatId === chat.chat_id ? '#FDF8EC' : 'transparent', 
                        borderLeft: activeChatId === chat.chat_id ? '4px solid #D4AF37' : '4px solid transparent',
                        transition: 'all 0.2s',
                    }}
                >
                    {/* Avatar with Red Dot Badge */}
                    <ListItemAvatar>
                        <Badge 
                            color="error" 
                            variant="dot" 
                            invisible={!isUnread} 
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            sx={{ 
                                '& .MuiBadge-badge': { 
                                    width: 10, 
                                    height: 10, 
                                    borderRadius: '50%', 
                                    border: '2px solid white',
                                    bgcolor: '#E53E3E'
                                } 
                            }}
                        >
                            <Avatar sx={{ 
                                bgcolor: activeChatId === chat.chat_id ? '#D4AF37' : '#EDF2F7', 
                                color: activeChatId === chat.chat_id ? 'white' : '#4A5568', 
                                fontWeight: 'bold' 
                            }}>
                                {name.charAt(0).toUpperCase()}
                            </Avatar>
                        </Badge>
                    </ListItemAvatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Location */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={isUnread ? "800" : "600"} color="#2D3748" noWrap sx={{ maxWidth: '80%' }}>
                                {name} <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85em' }}>{locString}</span>
                            </Typography>
                        </Box>

                        {/* Message Preview + Right Side Dot */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                            <Typography variant="caption" color={isUnread ? "text.primary" : "text.secondary"} noWrap sx={{ display: 'block', maxWidth: '90%', fontWeight: isUnread ? 600 : 400 }}>
                                {cleanText(chat.last_message?.text)}
                            </Typography>
                            
                            {/* Extra Visual Indicator for Unread */}
                            {isUnread && <Circle sx={{ width: 8, height: 8, color: '#E53E3E' }} />}
                        </Box>
                    </Box>
                </ListItemButton>
            );
        })}
    </List>
</Box>
);

  const DetailsPanel = (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: 'white', borderLeft: '1px solid #E0E0E0' }}>
        {isMobile && (
            <Box display="flex" justifyContent="flex-end" mb={1}><IconButton onClick={() => setShowMobileDetails(false)}><Close /></IconButton></Box>
        )}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#FAFAFA', borderColor: '#E9ECEF', mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="caption" fontWeight="bold">DATA COMPLETENESS</Typography>
                <Typography variant="caption" fontWeight="bold" color={leadScore > 75 ? "success.main" : "warning.main"}>{leadScore}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={leadScore} color={leadScore > 75 ? "success" : "warning"} sx={{ height: 8, borderRadius: 5 }} />
        </Paper>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 72, height: 72, mx: 'auto', bgcolor: '#FFF8E1', color: '#D4AF37', fontSize: 28, mb: 1.5, border: '1px solid #F0E68C' }}>{activeLeadData.customer_name?.[0] || "G"}</Avatar>
            <Typography variant="h6" fontWeight="800" color="#2C3E50">{activeLeadData.customer_name || "Guest"}</Typography>
            
            {/* UPDATED: PHONE & EMAIL ONLY */}
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555', fontWeight: 500, fontSize: '0.9rem' }}>
                    <Phone fontSize="small" sx={{ color: '#D4AF37' }} /> {activeLeadData.contact_number || "-"}
                </Typography>
                {activeLeadData.email && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#555', fontWeight: 500, fontSize: '0.9rem' }}>
                        <Mail fontSize="small" sx={{ color: '#D4AF37' }} /> {activeLeadData.email}
                    </Typography>
                )}
            </Box>
        </Box>

        <Paper sx={{ p: 2.5, mb: 3, bgcolor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2} pb={1} borderBottom="1px dashed #E0E0E0">
                <Description fontSize="small" sx={{ color: '#D4AF37' }} />
                <Typography variant="subtitle2" fontWeight="800" color="#2C3E50">LEAD SUMMARY</Typography>
            </Box>
            
            {loadingSummary ? (
                <Box sx={{ pt: 1 }}><Skeleton width="100%" height={20} /><Skeleton width="80%" height={20} /></Box>
            ) : summary ? (
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {summary.replace(/\*\*/g, '')}
                </Typography>
            ) : (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">Waiting for completion...</Typography>
            )}
        </Paper>

        <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
            {[
                { label: 'Event', val: activeLeadData.event_type, icon: <Bolt /> },
                { label: 'Guests', val: activeLeadData.count ? `${activeLeadData.count} Pax` : '-', icon: <CheckCircle /> },
                { label: 'Location', val: activeLeadData.delivery_location, icon: <Place /> },
                { label: 'Date', val: activeLeadData.event_date_time, icon: <CalendarMonth /> },
            ].map((item, i) => (
                <Box key={i} display="flex" alignItems="center" justifyContent="space-between" p={1.5} borderBottom="1px solid #F5F5F5">
                    <Box display="flex" alignItems="center" gap={1.5} color="#7F8C8D">{item.icon} <Typography variant="body2" fontWeight="500">{item.label}</Typography></Box>
                    <Typography variant="body2" fontWeight="700" color="#2C3E50">{item.val || "-"}</Typography>
                </Box>
            ))}
        </Box>

        <Paper sx={{ p: 2, bgcolor: '#FFFBEA', border: '1px solid #F0E68C', borderRadius: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="#B7950B" sx={{ mb: 1, display: 'block' }}>INTERNAL NOTES</Typography>
            <TextField fullWidth multiline rows={2} placeholder="Add admin note..." value={internalNote} onChange={(e) => setInternalNote(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
        </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F0F2F5', overflow: 'hidden' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <Box 
        sx={{ 
            width: { xs: '100%', md: SIDEBAR_WIDTH }, 
            flexShrink: 0, 
            display: { xs: activeChatId ? 'none' : 'block', md: 'block' },
            height: '100%'
        }}
      >
        {Sidebar}
      </Box>

      {/* 2. MIDDLE CHAT AREA */}
      <Box 
        component="main" 
        sx={{ 
            flexGrow: 1, 
            display: { xs: activeChatId ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column', 
            height: '100%',
            bgcolor: '#F0F2F5'
        }}
      >
        {activeChatId ? (
            <>
                <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', px: 1 }}>
                <Toolbar>
                    {isMobile && <IconButton onClick={() => setActiveChatId(null)} sx={{ mr: 1, color: '#2C3E50' }}><ArrowBack /></IconButton>}
                    <Box flexGrow={1} display="flex" alignItems="center" gap={1} overflow="hidden">
                        <Avatar sx={{ bgcolor: '#2C3E50', width: 34, height: 34, fontSize: 14 }}>{activeLeadData.customer_name?.[0] || "G"}</Avatar>
                        <Box overflow="hidden">
                            <Typography variant="subtitle1" color="#2C3E50" fontWeight={700} noWrap>{activeLeadData.customer_name || "Guest"}</Typography>
                            {activeLeadData.delivery_location && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Place sx={{ fontSize: 12 }} /> {activeLeadData.delivery_location}</Typography>}
                        </Box>
                    </Box>
                    {isMobile && <IconButton onClick={() => setShowMobileDetails(true)} color="primary"><Info /></IconButton>}
                    {!isMobile && <><IconButton><Notifications /></IconButton><Avatar sx={{ ml: 2, bgcolor: '#2C3E50', width: 34, height: 34 }}>A</Avatar></>}
                </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {Array.isArray(activeMessages) && activeMessages.map((msg, idx) => (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-start' : 'flex-end', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: msg.role === 'user' ? 'row' : 'row-reverse', maxWidth: '85%' }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: msg.role === 'user' ? '#fff' : '#2C3E50', color: msg.role === 'user' ? '#333' : '#D4AF37', boxShadow: 1, fontSize: 12 }}>{msg.role === 'user' ? 'G' : 'AI'}</Avatar>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: msg.role === 'user' ? 'white' : '#2C3E50', color: msg.role === 'user' ? '#2C3E50' : 'white', borderTopLeftRadius: msg.role === 'user' ? 4 : 16, borderTopRightRadius: msg.role === 'user' ? 16 : 4 }}>
                                <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{cleanText(msg.text)}</Typography>
                            </Paper>
                        </Box>
                    </Box>
                    ))}
                </Box>
            </>
        ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" bgcolor="#F8F9FA">
                <Typography variant="h5" color="#BDC3C7" fontWeight="700">Select a Lead</Typography>
            </Box>
        )}
      </Box>

      {/* 3. RIGHT DETAILS PANEL */}
      {isDesktop ? (
          <Box sx={{ width: DETAILS_WIDTH, flexShrink: 0 }}>{DetailsPanel}</Box>
      ) : (
          <Drawer anchor="right" open={showMobileDetails} onClose={() => setShowMobileDetails(false)} PaperProps={{ sx: { width: '85%', maxWidth: 360 } }}>
            {DetailsPanel}
          </Drawer>
      )}
    </Box>
  );
};

export default Dashboard;