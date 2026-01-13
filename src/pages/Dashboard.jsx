import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Paper,
  IconButton,
  InputBase,
  LinearProgress,
  Badge,
  Skeleton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search,
  Notifications,
  Phone,
  Mail,
  Place,
  Circle,
  CheckCircle,
  CalendarMonth,
  Bolt,
  ArrowBack,
  Info,
  Close,
  Description,
  Logout,
  Security,
  ErrorOutline,
  Refresh,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { API_BASE } from "../components/ChatWidget";
import logo from "../../public/logo.png";

const SIDEBAR_WIDTH = 360;
const DETAILS_WIDTH = 400;

const formatFullDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatMessageTime = (dateString) => {
  if (!dateString)
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/Current DateTime:.*$/gim, "").trim();
};

const formatWhatsAppDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }
};

// ✅ Single axios client w/ auth header + sane defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hogist_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // data
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);

  // UI state
  const [search, setSearch] = useState("");
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // summary
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // session
  const [sessionError, setSessionError] = useState(false);

  // logs
  const [loginLogs, setLoginLogs] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);

  // loading / errors
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState("");
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");

  // intervals
  const chatsIntervalRef = useRef(null);
  const activeIntervalRef = useRef(null);
  const sessionIntervalRef = useRef(null);

  // ---------------------------------------------
  // AUTH / SESSION
  // ---------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("hogist_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const verifySession = async () => {
      try {
        await api.post("/auth/verify-session", {});
      } catch (error) {
        const status = error?.response?.status;
        if (status === 409 || status === 401) {
          setSessionError(true);
          localStorage.removeItem("hogist_token");
        }
      }
    };

    verifySession();

    // ✅ fixed: interval time should be a number (ms), not API_BASE
    sessionIntervalRef.current = setInterval(verifySession, 5000);
    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("hogist_token");
    navigate("/login");
  }, [navigate]);

  // ---------------------------------------------
  // FETCH: LOGIN LOGS
  // ---------------------------------------------
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError("");
    try {
      const res = await api.get("/auth/logs");
      setLoginLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setLogsError("Failed to fetch logs.");
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ---------------------------------------------
  // FETCH: CHATS LIST
  // ---------------------------------------------
  const fetchChats = useCallback(async () => {
    setChatsError("");
    try {
      const res = await api.get("/website-get-all-chats");
      setChats(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setChatsError("Failed to load chats. Check API / network.");
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    setChatsLoading(true);
    fetchChats();

    if (chatsIntervalRef.current) clearInterval(chatsIntervalRef.current);
    chatsIntervalRef.current = setInterval(fetchChats, 3000);

    return () => {
      if (chatsIntervalRef.current) clearInterval(chatsIntervalRef.current);
    };
  }, [fetchChats]);

  // ---------------------------------------------
  // FETCH: ACTIVE CHAT
  // ---------------------------------------------
  const fetchActiveChat = useCallback(
    async (chatId) => {
      if (!chatId) return;
      setActiveError("");
      try {
        const res = await api.get(`/website-get-chat/${chatId}`);
        setActiveMessages(res.data?.messages || []);
      } catch (e) {
        setActiveError("Failed to load messages.");
      } finally {
        setActiveLoading(false);
      }
    },
    []
  );

  const generateSummary = useCallback(async (chatId) => {
    if (!chatId) return;
    setLoadingSummary(true);
    try {
      const res = await api.post("/website-generate-summary", { chat_id: chatId });
      setSummary(res.data?.summary || "Summary unavailable.");
    } catch (e) {
      setSummary("Summary unavailable.");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    if (!activeChatId) return;

    // UI reset
    setShowMobileDetails(false);
    setSummary("");
    setActiveLoading(true);
    setActiveMessages([]);

    // initial fetch + summary
    fetchActiveChat(activeChatId);
    generateSummary(activeChatId);

    // poll messages
    if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    activeIntervalRef.current = setInterval(() => fetchActiveChat(activeChatId), 4000);

    return () => {
      if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    };
  }, [activeChatId, fetchActiveChat, generateSummary]);

  // ---------------------------------------------
  // DERIVED: FILTERED CHATS
  // ---------------------------------------------
  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter((chat) => {
      const content = (chat.search_content || "").toLowerCase();
      const name = (chat?.lead_data?.customer_name || "").toLowerCase();
      const last = (chat?.last_message?.text || "").toLowerCase();
      return content.includes(term) || name.includes(term) || last.includes(term);
    });
  }, [chats, search]);

  // ---------------------------------------------
  // DERIVED: ACTIVE LEAD DATA (merge list + msg + summary parsing)
  // ---------------------------------------------
  const activeLeadData = useMemo(() => {
    const msgData = [...activeMessages].reverse().find((m) => m?.data)?.data;
    const listData = chats.find((c) => c.chat_id === activeChatId)?.lead_data;
    let data = { ...(listData || {}), ...(msgData || {}) };

    if (summary) {
      const nameMatch = summary.match(/(?:Name|Customer):\**\s*(.*?)(?:\s*(?:Event|Date|-|\n)|$)/i);
      const locMatch = summary.match(/(?:Location|at):\**\s*([A-Za-z\s,]+?)(?:\.|-|\n|$)/i);
      const dateMatch = summary.match(/(?:Event Date|Date):\**\s*(.*?)(?:\s*(?:Guest|-|\n)|$)/i);
      const countMatch = summary.match(/(?:Guest Count|Guests):\**\s*(\d+)/i);
      const phoneMatch = summary.match(/(?:Contact|Phone).*?(\d{10})/i);
      const emailMatch = summary.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);

      if (!data.customer_name || data.customer_name === "Guest") {
        if (nameMatch?.[1]) data.customer_name = nameMatch[1].trim();
      }
      if (!data.delivery_location || data.delivery_location.length === 0) {
        const statusLoc = summary.match(/at\s+([A-Z][a-zA-Z\s]+)(?:$|\n|\.)/);
        if (locMatch?.[1]) data.delivery_location = [locMatch[1].trim()];
        else if (statusLoc?.[1]) data.delivery_location = [statusLoc[1].trim()];
      }
      if (!data.contact_number && phoneMatch?.[1]) data.contact_number = phoneMatch[1];
      if (!data.email && emailMatch?.[1]) data.email = emailMatch[1];
      if (!data.event_date_time && dateMatch?.[1]) data.event_date_time = dateMatch[1].trim();
      if (!data.count && countMatch?.[1]) data.count = countMatch[1].trim();
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

  // ---------------------------------------------
  // SESSION ERROR DIALOG
  // ---------------------------------------------
  if (sessionError) {
    return (
      <Dialog open>
        <DialogTitle color="error">Session Terminated</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have been logged out because this account signed in from another device
            or your session expired. Only one active session is allowed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/login")} variant="contained">
            Back to Login
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ---------------------------------------------
  // UI: SIDEBAR
  // ---------------------------------------------
  const Sidebar = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderRight: "1px solid #E0E0E0",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <img src={logo} alt="Logo" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <Box>
              <Typography variant="h6" fontWeight="800" color="#2C3E50" lineHeight={1}>
                Hogist CRM
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Leads & chats
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title="Login activity">
              <IconButton
                onClick={(e) => {
                  setNotifAnchor(e.currentTarget);
                  fetchLogs();
                }}
                size="small"
              >
                <Badge variant="dot" color="error" invisible={loginLogs.length === 0}>
                  <Notifications color="action" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh chats">
              <IconButton onClick={fetchChats} size="small">
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small" color="error">
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Notification menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{ sx: { width: 340, maxHeight: 420, borderRadius: 3, mt: 1 } }}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <Box sx={{ p: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight="800">
              Login Activity
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={fetchLogs}
            >
              Refresh
            </Typography>
          </Box>
          <Divider />

          {logsLoading ? (
            <Box p={2}>
              <Skeleton height={20} />
              <Skeleton height={20} width="75%" />
              <Skeleton height={20} width="60%" />
            </Box>
          ) : logsError ? (
            <Box p={2}>
              <Alert severity="error">{logsError}</Alert>
            </Box>
          ) : loginLogs.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography variant="caption">No logs found</Typography>
            </Box>
          ) : (
            loginLogs.map((log, i) => (
              <MenuItem key={i} sx={{ gap: 1.5, alignItems: "flex-start", py: 1.5 }}>
                <Box mt={0.5}>
                  {log.status === "Success" ? (
                    <Security fontSize="small" color="success" />
                  ) : (
                    <ErrorOutline fontSize="small" color="error" />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="600" color="#2C3E50">
                    {log.username}{" "}
                    <span
                      style={{
                        fontWeight: 500,
                        marginLeft: 6,
                        fontSize: "0.75rem",
                        padding: "2px 6px",
                        borderRadius: 6,
                        backgroundColor: log.status === "Success" ? "#E6FFFA" : "#FFF5F5",
                        color: log.status === "Success" ? "#276749" : "#C53030",
                      }}
                    >
                      {log.status}
                    </span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {new Date(log.timestamp).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                  <Typography variant="caption" color="#A0AEC0" fontFamily="monospace">
                    IP: {log.ip_address}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Search */}
        <Paper
          elevation={0}
          sx={{
            p: "6px 12px",
            display: "flex",
            alignItems: "center",
            borderRadius: 3,
            bgcolor: "#F8F9FA",
            border: "1px solid #E9ECEF",
          }}
        >
          <Search sx={{ color: "#A0AEC0" }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: 14 }}
            placeholder="Search name / last message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Paper>

        {/* Errors */}
        {chatsError && (
          <Box mt={1.5}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {chatsError}
            </Alert>
          </Box>
        )}
      </Box>

      {/* Chat List */}
      <List sx={{ px: 1, pb: 2, flex: 1, overflowY: "auto" }}>
        {chatsLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} sx={{ px: 1, py: 1 }}>
              <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 3 }} />
            </Box>
          ))
        ) : filteredChats.length === 0 ? (
          <Box p={2}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No chats match your search.
            </Alert>
          </Box>
        ) : (
          filteredChats.map((chat) => {
            const data = chat.lead_data || {};
            const name = data.customer_name || "Guest";

            let locString = "";
            const rawLoc = data.delivery_location;
            if (Array.isArray(rawLoc) && rawLoc.length > 0) locString = `(${rawLoc[0]})`;
            else if (typeof rawLoc === "string" && rawLoc.trim() !== "") locString = `(${rawLoc})`;

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
                  bgcolor: activeChatId === chat.chat_id ? "#FEF2F2" : "transparent",
                  borderLeft: activeChatId === chat.chat_id ? "4px solid #C30B0B" : "4px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!isUnread}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{
                      "& .MuiBadge-badge": {
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "2px solid white",
                        bgcolor: "#E53E3E",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: activeChatId === chat.chat_id ? "#C30B0B" : "#EDF2F7",
                        color: activeChatId === chat.chat_id ? "white" : "#4A5568",
                        fontWeight: "bold",
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="body2"
                      fontWeight={isUnread ? "800" : "600"}
                      color="#2D3748"
                      noWrap
                      sx={{ maxWidth: "75%" }}
                    >
                      {name}{" "}
                      <span style={{ fontWeight: 400, color: "#718096", fontSize: "0.85em" }}>
                        {locString}
                      </span>
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: isUnread ? "#E53E3E" : "#718096",
                        fontWeight: isUnread ? 700 : 400,
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        ml: 1,
                      }}
                    >
                      {formatWhatsAppDate(chat.updated_at)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography
                      variant="caption"
                      color={isUnread ? "text.primary" : "text.secondary"}
                      noWrap
                      sx={{ display: "block", maxWidth: "90%", fontWeight: isUnread ? 600 : 400 }}
                    >
                      {cleanText(chat.last_message?.text)}
                    </Typography>
                    {isUnread && <Circle sx={{ width: 8, height: 8, color: "#E53E3E" }} />}
                  </Box>
                </Box>
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );

  // ---------------------------------------------
  // UI: DETAILS PANEL
  // ---------------------------------------------
  const DetailsPanel = (
    <Box sx={{ p: 3, height: "100%", overflowY: "auto", bgcolor: "white", borderLeft: "1px solid #E0E0E0" }}>
      {isMobile && (
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <IconButton onClick={() => setShowMobileDetails(false)}>
            <Close />
          </IconButton>
        </Box>
      )}

    <Paper
  variant="outlined"
  sx={{
    p: 2,
    borderRadius: 3,
    mb: 2,
    bgcolor:
      leadScore > 75 ? "#ECFDF5" : leadScore > 50 ? "#FFFBEB" : "#FEF2F2",
    borderColor:
      leadScore > 75 ? "#A7F3D0" : leadScore > 50 ? "#FDE68A" : "#FECACA"
  }}
>
  {/* Top row */}
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
    <Typography variant="caption" fontWeight={700}>
      Lead Quality
    </Typography>

    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="caption"
        fontWeight={800}
        sx={{
          color:
            leadScore > 75 ? "#047857" :
            leadScore > 50 ? "#92400E" :
            "#991B1B"
        }}
      >
        {leadScore}%
      </Typography>

      <Chip
        size="small"
        label={
          leadScore > 75 ? "Strong" :
          leadScore > 50 ? "Medium" :
          "Weak"
        }
        sx={{
          height: 18,
          fontSize: "0.65rem",
          fontWeight: 700,
          bgcolor:
            leadScore > 75 ? "#10B981" :
            leadScore > 50 ? "#F59E0B" :
            "#EF4444",
          color: "white"
        }}
      />
    </Box>
  </Box>

  {/* Progress bar */}
  <LinearProgress
    variant="determinate"
    value={leadScore}
    sx={{
      height: 6,
      borderRadius: 5,
      bgcolor: "#E5E7EB",
      "& .MuiLinearProgress-bar": {
        bgcolor:
          leadScore > 75 ? "#10B981" :
          leadScore > 50 ? "#F59E0B" :
          "#EF4444"
      }
    }}
  />

  {/* Helper text */}
  <Typography
    variant="caption"
    sx={{
      display: "block",
      mt: 0.8,
      color:
        leadScore > 75 ? "#065F46" :
        leadScore > 50 ? "#92400E" :
        "#991B1B"
    }}
  >
    {leadScore > 75
      ? "Ready to quote"
      : leadScore > 50
      ? "Needs more info"
      : "Not ready"}
  </Typography>
</Paper>


      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Avatar
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            bgcolor: "#FEF2F2",
            color: "#C30B0B",
            fontSize: 28,
            mb: 1.5,
            border: "1px solid #FEE2E2",
          }}
        >
          {activeLeadData.customer_name?.[0] || "G"}
        </Avatar>
        <Typography variant="h6" fontWeight="800" color="#2C3E50">
          {activeLeadData.customer_name || "Guest"}
        </Typography>

        <Stack sx={{ mt: 1.5 }} spacing={0.8} alignItems="center">
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1, color: "#555", fontWeight: 500, fontSize: "0.9rem" }}
          >
            <Phone fontSize="small" sx={{ color: "#C30B0B" }} />
            {activeLeadData.contact_number || "-"}
          </Typography>

          {activeLeadData.email && (
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1, color: "#555", fontWeight: 500, fontSize: "0.9rem" }}
            >
              <Mail fontSize="small" sx={{ color: "#C30B0B" }} />
              {activeLeadData.email}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1, color: "#555", fontWeight: 500, fontSize: "0.9rem" }}
          >
            <CalendarMonth fontSize="small" sx={{ color: "#C30B0B" }} />
            {formatDateOnly(
              chats.find((c) => c.chat_id === activeChatId)?.created_at ||
                chats.find((c) => c.chat_id === activeChatId)?.updated_at
            )}
          </Typography>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} pb={1} borderBottom="1px dashed #E0E0E0">
          <Box display="flex" alignItems="center" gap={1}>
            <Description fontSize="small" sx={{ color: "#C30B0B" }} />
            <Typography variant="caption" fontWeight="bold" color="#C30B0B">
              INTERNAL NOTES
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Regenerate summary">
              <IconButton
                size="small"
                onClick={() => generateSummary(activeChatId)}
                disabled={loadingSummary || !activeChatId}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loadingSummary ? (
          <Box sx={{ pt: 1 }}>
            <Skeleton width="100%" height={20} />
            <Skeleton width="80%" height={20} />
            <Skeleton width="70%" height={20} />
          </Box>
        ) : summary ? (
          <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {summary.replace(/\*\*/g, "")}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" fontStyle="italic">
            Summary not available.
          </Typography>
        )}
      </Paper>

      <Box mt={2}>
        {[
          { label: "Event", val: activeLeadData.event_type, icon: <Bolt sx={{ color: "#7F8C8D" }} /> },
          { label: "Guests", val: activeLeadData.count ? `${activeLeadData.count} Pax` : "-", icon: <CheckCircle sx={{ color: "#7F8C8D" }} /> },
          { label: "Location", val: activeLeadData.delivery_location, icon: <Place sx={{ color: "#7F8C8D" }} /> },
          { label: "Date", val: activeLeadData.event_date_time, icon: <CalendarMonth sx={{ color: "#7F8C8D" }} /> },
        ].map((item, i) => (
          <Box key={i} display="flex" alignItems="center" justifyContent="space-between" p={1.5} borderBottom="1px solid #F5F5F5">
            <Box display="flex" alignItems="center" gap={1.5}>
              {item.icon}
              <Typography variant="body2" fontWeight="500" color="#7F8C8D">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="700" color="#2C3E50" textAlign="right" sx={{ maxWidth: "58%" }}>
              {Array.isArray(item.val) ? item.val.join(", ") : item.val || "-"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // ---------------------------------------------
  // UI: MAIN
  // ---------------------------------------------
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F0F2F5", overflow: "hidden" }}>
      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          width: { xs: "100%", md: SIDEBAR_WIDTH },
          flexShrink: 0,
          display: { xs: activeChatId ? "none" : "block", md: "block" },
          height: "100%",
        }}
      >
        {Sidebar}
      </Box>

      {/* MIDDLE CHAT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: { xs: activeChatId ? "flex" : "none", md: "flex" },
          flexDirection: "column",
          height: "100%",
          bgcolor: "#F0F2F5",
        }}
      >
        {activeChatId ? (
          <>
            <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: "white", borderBottom: "1px solid #E2E8F0", px: 1 }}>
              <Toolbar>
                {isMobile && (
                  <IconButton onClick={() => setActiveChatId(null)} sx={{ mr: 1, color: "#2C3E50" }}>
                    <ArrowBack />
                  </IconButton>
                )}

                <Box flexGrow={1} display="flex" alignItems="center" gap={1} overflow="hidden">
                  <Avatar sx={{ bgcolor: "#2C3E50", width: 34, height: 34, fontSize: 14 }}>
                    {activeLeadData.customer_name?.[0] || "G"}
                  </Avatar>

                  <Box overflow="hidden">
                    <Typography variant="subtitle1" color="#2C3E50" fontWeight={700} noWrap>
                      {activeLeadData.customer_name || "Guest"}
                    </Typography>
                    {activeLeadData.delivery_location && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Place sx={{ fontSize: 12 }} />{" "}
                        {Array.isArray(activeLeadData.delivery_location)
                          ? activeLeadData.delivery_location.join(", ")
                          : activeLeadData.delivery_location}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {activeLoading && (
                  <Chip size="small" label="Loading..." sx={{ mr: 1 }} />
                )}

                {isMobile && (
                  <IconButton onClick={() => setShowMobileDetails(true)} color="primary">
                    <Info />
                  </IconButton>
                )}

                {!isMobile && <Avatar sx={{ ml: 2, bgcolor: "#2C3E50", width: 34, height: 34 }}>A</Avatar>}
              </Toolbar>

              {/* Active chat errors */}
              {activeError && (
                <Box px={2} pb={1}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {activeError}
                  </Alert>
                </Box>
              )}
            </AppBar>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {/* Start Date/Time Indicator */}
              {activeLoading ? (
                <Box>
                  <Skeleton height={30} width={180} sx={{ mx: "auto", mb: 2 }} />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton variant="rounded" height={54} sx={{ width: `${60 + (i % 3) * 10}%` }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <>
                  {activeMessages.length > 0 && (
                    <Box display="flex" justifyContent="center" mb={3} mt={1}>
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: "#E2E8F0",
                          borderRadius: 4,
                          border: "1px solid #CBD5E0",
                        }}
                      >
                        <Typography variant="caption" color="#4A5568" fontWeight="600" fontSize="0.75rem">
                          {formatFullDateTime(activeMessages[0].timestamp || chats.find((c) => c.chat_id === activeChatId)?.updated_at)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {Array.isArray(activeMessages) && activeMessages.length > 0 ? (
                    activeMessages.map((msg, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: msg.role === "user" ? "flex-start" : "flex-end",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, flexDirection: msg.role === "user" ? "row" : "row-reverse", maxWidth: "85%" }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: msg.role === "user" ? "#fff" : "#2C3E50",
                              color: msg.role === "user" ? "#333" : "white",
                              boxShadow: 1,
                              fontSize: 12,
                            }}
                          >
                            {msg.role === "user" ? "G" : "AI"}
                          </Avatar>

                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              px: 2,
                              borderRadius: 2,
                              bgcolor: msg.role === "user" ? "white" : "#2C3E50",
                              color: msg.role === "user" ? "#2C3E50" : "white",
                              borderTopLeftRadius: msg.role === "user" ? 4 : 16,
                              borderTopRightRadius: msg.role === "user" ? 16 : 4,
                              minWidth: "120px",
                              position: "relative",
                            }}
                          >
                            <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: "pre-wrap", mb: 0.5 }}>
                              {cleanText(msg.text)}
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "0.65rem",
                                  color: msg.role === "user" ? "#718096" : "rgba(255,255,255,0.7)",
                                  mt: -0.5,
                                }}
                              >
                                {formatMessageTime(msg.timestamp)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box display="flex" justifyContent="center" mt={6}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No messages yet in this chat.
                      </Alert>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" bgcolor="#F8F9FA">
            <Typography variant="h5" color="#BDC3C7" fontWeight="700">
              Select a Lead
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pick a chat from the left panel to view messages.
            </Typography>
          </Box>
        )}
      </Box>

      {/* RIGHT DETAILS PANEL */}
      {isDesktop ? (
        <Box sx={{ width: DETAILS_WIDTH, flexShrink: 0 }}>{activeChatId ? DetailsPanel : <Box sx={{ width: DETAILS_WIDTH }} />}</Box>
      ) : (
        <Drawer
          anchor="right"
          open={showMobileDetails}
          onClose={() => setShowMobileDetails(false)}
          PaperProps={{ sx: { width: "85%", maxWidth: 360 } }}
        >
          {DetailsPanel}
        </Drawer>
      )}
    </Box>
  );
};

export default Dashboard;
