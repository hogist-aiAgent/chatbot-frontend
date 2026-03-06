import React, { useEffect, useState } from "react";
import { Box, Fab, Tooltip } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { keyframes } from "@emotion/react";

/* ---------------- ANIMATIONS ---------------- */

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255,59,48,.6); }
  70% { box-shadow: 0 0 0 14px rgba(255,59,48,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,59,48,0); }
`;

/* ---------------- COMPONENT ---------------- */

export default function ChatAssistant({ isOpen, setIsOpen }) {
  /* Typing Control */
  const fullText = "Need more details? I'm here";
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHint, setShowHint] = useState(true);

  /* Typing + Reverse Logic */
  useEffect(() => {
    if (!showHint) return;

    const speed = isDeleting ? 35 : 60;

    const timeout = setTimeout(() => {
      setTypedText((prev) => {
        if (!isDeleting) {
          const next = fullText.slice(0, prev.length + 1);

          if (next === fullText) {
            setTimeout(() => setIsDeleting(true), 1500);
          }

          return next;
        } else {
          const next = fullText.slice(0, prev.length - 1);

          if (next === "") {
            setIsDeleting(false);
            setShowHint(false);

            // reappear after delay
            setTimeout(() => {
              setShowHint(true);
              setTypedText("");
            }, 4000);
          }

          return next;
        }
      });
    }, speed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, showHint]);

  return (
    <>
      {/* ---------------- CHAT BUBBLE ---------------- */}
      {showHint && !isOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 40,
            right: 100,
            background: "#fff",
            px: 2.5,
            py: 1.5,
            borderRadius: "20px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
            fontWeight: 600,
            whiteSpace: "nowrap",
            zIndex: 9999, 
            animation: `${slideUp} .4s ease`,
            "&::after": {
              content: '""',
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "8px solid #fff",
            },
          }}
        >
          {typedText}
          <span className="cursor">|</span>

          <style>
            {`
              .cursor{
                margin-left:3px;
                animation:blink 1s infinite;
              }

              @keyframes blink{
                0%,50%,100%{opacity:1}
                25%,75%{opacity:0}
              }
            `}
          </style>
        </Box>
      )}

      {/* ---------------- FAB BUTTON ---------------- */}
      {!isOpen && (
        <Tooltip title="Start Ordering">
          <Fab
            onClick={() => setIsOpen(true)}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              background: "linear-gradient(135deg,#c60800,#ff3b30)",
              color: "#fff",
              animation: `${pulse} 2.5s infinite`,
              transition: "all .25s ease",

              "&:hover": {
                transform: "scale(1.1)",
                background: "linear-gradient(135deg,#a80600,#e52e24)",
              },
            }}
          >
            <SupportAgentIcon />
          </Fab>
        </Tooltip>
      )}
    </>
  );
}
