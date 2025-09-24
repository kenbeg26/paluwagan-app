import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import UserContext from "../context/UserContext";

export default function Chat() {
  const { user, token: contextToken } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const token = contextToken || localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:4000", { auth: { token } });

    newSocket.on("connect", () => console.log("✅ Connected"));
    newSocket.on("connect_error", (err) => console.error("❌", err.message));
    newSocket.on("chatHistory", (history) => setMessages(history));
    newSocket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { message });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">💵 Paluwagan Hub</h2>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isSelf = msg.user?._id === user?._id;
          return (
            <div
              key={msg._id || index}
              className={`message-wrapper ${isSelf ? "self" : "other"}`}
            >
              <div className="message-content">
                {!isSelf && (
                  <div className="chat-username">
                    {msg.user?.codename || "Unknown"} 💰
                  </div>
                )}
                <div className={`chat-bubble ${isSelf ? "self" : "other"}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

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
