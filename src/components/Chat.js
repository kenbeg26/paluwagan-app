import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import UserContext from "../context/UserContext";

export default function Chat() {
  const { user, token: contextToken } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const token = contextToken || localStorage.getItem("token");

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Initialize socket
  // Initialize socket
  useEffect(() => {
    if (!token) return;

    const socketUrl = process.env.REACT_APP_API_BASE_URL;

    const newSocket = io(socketUrl, { auth: { token } });

    newSocket.on("connect", () => console.log("✅ Connected"));
    newSocket.on("connect_error", (err) => console.error("❌", err.message));

    // Load chat history
    newSocket.on("chatHistory", (history) => setMessages(history));

    // Receive new messages
    newSocket.on("receiveMessage", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    // Typing events
    newSocket.on("userTyping", (typingUser) => {
      if (typingUser !== user?.codename) setTypingUser(typingUser);
    });
    newSocket.on("stopTyping", () => setTypingUser(null));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token, user?.codename]);


  // Send message
  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { message, timestamp: new Date() });
      setMessage("");
      socket.emit("stopTyping");
    }
  };

  // Typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socket) {
      if (e.target.value) {
        socket.emit("userTyping", user?.codename);
      } else {
        socket.emit("stopTyping");
      }
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">💵 Paluwagan Hub</h2>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isSelf = msg.user?.codename === user?.codename;
          const time = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "";

          return (
            <div
              key={msg._id || index}
              className={`message-wrapper ${isSelf ? "self" : "other"}`}
            >
              {/* Avatar for other users */}
              {!isSelf && (
                <div className="avatar-circle">
                  {msg.user?.codename?.charAt(0) || "?"}
                </div>
              )}

              <div className="message-content">
                {/* Username for other users */}
                {!isSelf && (
                  <div className="chat-username">
                    {msg.user?.codename || "Unknown"} 💰
                  </div>
                )}

                <div className={`chat-bubble ${isSelf ? "self" : "other"}`}>
                  {msg.message}
                </div>

                <div className="chat-timestamp">{time}</div>
              </div>

              {/* Optional avatar for self on right (can hide if not needed) */}
              {isSelf && (
                <div className="avatar-circle self-avatar">
                  {user?.codename?.charAt(0) || "U"}
                </div>
              )}
            </div>
          );
        })}

        {typingUser && (
          <div className="typing-indicator">{typingUser} is typing...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder={
            token ? "Type your 💸 message..." : "Login to send messages"
          }
          value={message}
          disabled={!token}
          onChange={handleTyping}
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
