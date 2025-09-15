import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // backend url

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("Guest" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    // Load chat history
    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // Listen for incoming messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { user: username, message });
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Group Chat</h2>
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px" }}>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.user}:</strong> {msg.message}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} style={{ width: "18%", marginLeft: "2%" }}>Send</button>
    </div>
  );
}
