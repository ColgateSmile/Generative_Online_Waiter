import React from "react";

const ChatToggle = ({ mode, setMode }) => {
  return (
    <div className="chat-toggle">
      <button
        onClick={() => setMode("text")}
        className={mode === "text" ? "active" : ""}
      >
        Text Input
      </button>
      <button
        onClick={() => setMode("voice")}
        className={mode === "voice" ? "active" : ""}
      >
        Voice Input
      </button>
    </div>
  );
};

export default ChatToggle;
