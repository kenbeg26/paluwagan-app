import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import UserContext from "../context/UserContext";

export default function Chat() {
  const { user } = useContext(UserContext); // expected { _id, codename, token }
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (!user?.token) return;

    const newSocket = io("http://localhost:4000", {
      auth: { token: user.token }, // ✅ send JWT
    });

    // Chat history
    newSocket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // New messages
    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Handle auth errors
    newSocket.on("connect_error", (err) => {
      console.error("Socket auth error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.token]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { message }); // ✅ no need to send userId
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Group Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          borderRadius: "6px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <p key={msg._id || index}>
            <strong>{msg.user?.codename || "Unknown"}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder={
            user?.token ? "Type your message..." : "Login to send messages"
          }
          value={message}
          disabled={!user?.token}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ width: "80%", padding: "8px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!user?.token}
          style={{
            width: "18%",
            marginLeft: "2%",
            padding: "8px",
            backgroundColor: user?.token ? "#007bff" : "#aaa",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: user?.token ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
