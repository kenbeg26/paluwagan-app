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

  // Initialize socket connection
  // Add error handling
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:4000", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      alert(error.message || "An error occurred");
    });

    // ... rest of your socket handlers

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { message });
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
          placeholder={token ? "Type your message..." : "Login to send messages"}
          value={message}
          disabled={!token}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ width: "80%", padding: "8px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!token}
          style={{
            width: "18%",
            marginLeft: "2%",
            padding: "8px",
            backgroundColor: token ? "#007bff" : "#aaa",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: token ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
