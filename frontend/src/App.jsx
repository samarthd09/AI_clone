import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const INITIAL_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: "Hello! 👋 I'm your Gemini AI assistant.\n\nI can help you answer questions, brainstorm ideas, write and debug code, draft messages, or explain complex topics. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const SUGGESTIONS = [
  { icon: "💡", label: "Explain quantum computing simply" },
  { icon: "🐍", label: "Write a Python script to sort files by date" },
  { icon: "🚀", label: "Give me 5 creative ideas for a startup" },
  { icon: "🎨", label: "How does CSS grid differ from flexbox?" },
];

function FormattedText({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="formatted-content">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "";
          let code = part.slice(3, -3);

          if (lines.length > 1 && !lines[0].includes(" ") && lines[0].length < 15) {
            language = lines[0].trim();
            code = lines.slice(1).join("\n");
          }

          return (
            <div key={index} className="code-block-wrapper">
              <div className="code-header">
                <span className="code-lang">{language || "code"}</span>
                <button
                  type="button"
                  className="code-copy-btn"
                  onClick={() => navigator.clipboard.writeText(code.trim())}
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <pre className="code-block">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <React.Fragment key={index}>
            {lines.map((line, lIdx) => {
              const inlineParsed = line
                .split(/(\*\*.*?\*\*|`.*?`)/g)
                .map((seg, sIdx) => {
                  if (seg.startsWith("**") && seg.endsWith("**")) {
                    return <strong key={sIdx}>{seg.slice(2, -2)}</strong>;
                  }
                  if (seg.startsWith("`") && seg.endsWith("`")) {
                    return <code key={sIdx} className="inline-code">{seg.slice(1, -1)}</code>;
                  }
                  return seg;
                });

              if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                return (
                  <div key={lIdx} className="bullet-point">
                    <span className="bullet-dot">•</span>
                    <span>{line.trim().substring(2)}</span>
                  </div>
                );
              }

              if (line.trim() === "") {
                return <div key={lIdx} className="line-gap" />;
              }

              return <p key={lIdx} className="text-paragraph">{inlineParsed}</p>;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const chatMessagesRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleInput = (e) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (customPrompt) => {
    const textToSend = (typeof customPrompt === "string" ? customPrompt : prompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/send-prompt", {
        text: textToSend,
      });

      const botMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: res.data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("API error:", err);
      const errorMessage = {
        id: "error-" + Date.now(),
        sender: "bot",
        isError: true,
        text:
          err.response?.data?.detail ||
          err.message ||
          "Unable to connect to the backend server. Please verify FastAPI is running at http://127.0.0.1:8000.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="chat-app-wrapper">
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-bottom-right" />

      <main className="chat-window">
        {/* Chatbot Header */}
        <header className="chat-header">
          <div className="bot-info-group">
            <div className="bot-avatar-badge">
              <svg className="sparkle-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                  fill="url(#gemini-grad)"
                />
                <defs>
                  <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.5" stopColor="#818cf8" />
                    <stop offset="1" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="status-indicator" title="Connected" />
            </div>

            <div className="bot-text-details">
              <div className="bot-name-row">
                <h2>Gemini AI</h2>
                <span className="bot-model-pill">3.8 Flash</span>
              </div>
              <p className="bot-subtext">Always active & ready to assist</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="action-btn"
              onClick={handleClearChat}
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </header>

        {/* Message Feed Area */}
        <section ref={chatMessagesRef} className="chat-messages" aria-label="Conversation history">
          <div className="messages-stream">
            {messages.length === 1 ? (
              <div className="welcome-hero-card">
                <div className="hero-avatar">
                  <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>
                <h2 className="hero-title">How can I help you today?</h2>
                <p className="hero-desc">
                  Ask me questions, explore code, generate ideas, or click any starter prompt below.
                </p>

                <div className="suggestions-grid">
                  {SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSend(item.label)}
                    >
                      <span className="chip-icon">{item.icon}</span>
                      <span className="chip-text">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="msg-avatar bot-avatar">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                      </div>
                    )}

                    <div className={`message-bubble ${msg.sender} ${msg.isError ? "error-bubble" : ""}`}>
                      <div className="bubble-header">
                        <span className="sender-tag">{msg.sender === "user" ? "You" : "Gemini"}</span>
                        <span className="timestamp">{msg.timestamp}</span>
                      </div>

                      <FormattedText content={msg.text} />

                      <div className="bubble-footer">
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          aria-label="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <span className="copied-status">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied
                            </span>
                          ) : (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {msg.sender === "user" && (
                      <div className="msg-avatar user-avatar">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="message-row bot-row loading-row">
                    <div className="msg-avatar bot-avatar pulsing">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                      </svg>
                    </div>
                    <div className="message-bubble bot typing-bubble">
                      <div className="typing-dots">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                      <span className="typing-label">Gemini is thinking...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Input Bar */}
        <footer className="chat-input-area">
          <form
            className="input-form-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask Gemini anything... (Press Enter to send, Shift+Enter for new line)"
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />

            <button
              type="submit"
              className={`send-button ${prompt.trim() ? "active" : ""}`}
              disabled={!prompt.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>

          <div className="chat-footer-note">
            <span>Powered by Google Gemini 3.8 Flash • Responses may vary</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;