// Chat.js
import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import UserContext from "../context/UserContext";

export default function Chat() {
  const { user, token: contextToken } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ✅ Get token from context first, fallback to localStorage
  const token = contextToken || localStorage.getItem("token");

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Initialize socket connection + event listeners
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:4000", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    newSocket.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
      alert(error.message || "An error occurred");
    });

    // ✅ Receive chat history from backend on connect
    newSocket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // ✅ Listen for new messages from backend
    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Send a message
  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { message });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">💵 Paluwagan Hub</h2>

      {/* Messages Box */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <p key={msg._id || index}>
            <strong>{msg.user?.codename || "Unknown"} 💰:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + Send */}
      <div className="chat-input-container">
        <input
          type="text"
          placeholder={token ? "Type your 💸 message..." : "Login to send messages"}
          value={message}
          disabled={!token}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          disabled={!token}
          className={`chat-send-btn ${!token ? "disabled" : ""}`}
        >
          Send 💵
        </button>
      </div>
    </div>
  );
}
