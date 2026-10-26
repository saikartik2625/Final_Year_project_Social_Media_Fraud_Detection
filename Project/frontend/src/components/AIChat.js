import React, { useState, useEffect, useRef } from "react";
import { Bot, Shield, Send, X } from "lucide-react";
import "./AIChat.css";
import API_BASE_URL from "../config";

const AIChat = ({ isOpen, setIsOpen, lastPrediction }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "System initialized. I am your BLACKOUT Security Assistant. I can explain fraud vectors, decode SHAP attributions, and provide account verification guidance. How can I assist your investigation?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({ role: m.role, parts: [m.text] })),
          context: lastPrediction
        })
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Security connection interrupted. Verify backend server status." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? "open" : ""}`}>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open Security Assistant">
          <div className="bot-icon-wrapper">
            <Bot size={20} className="bot-svg-icon" />
            <span className="bot-pulse-ring" />
          </div>
          <span className="toggle-text">Security Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <Shield size={16} className="chat-shield-icon" />
              </div>
              <div className="chat-header-text">
                <h3>
                  BLACK<span className="chat-yellow">OUT</span> Assistant
                </h3>
                <div className="chat-header-sub">
                  <span className="chat-online-dot" />
                  <span>Groq LLaMA 3.3 Intelligence · Online</span>
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close assistant">
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask about fraud patterns, SHAP..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
