import React, { useState } from "react";
import axios from "axios";
import menu from "../data";

const ChatBox = ({ addOrder }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for API call

  // Load API key from environment variables
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const handleSend = async () => {
    const userMessage = userInput.trim();
    if (!userMessage) return;

    // Display user message
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setUserInput("");

    setLoading(true); // Start loading spinner

    try {
      // Generate system message and user message for API call
      const systemMessage = {
        role: "system",
        content: `
          You are an online waiter. 
          The menu is: ${menu
            .map((item) => `${item.name} ($${item.price})`)
            .join(", ")}. 
          If a customer orders, confirm the order, suggest drinks if no drinks are selected, and summarize the total.
        `,
      };

      const userMessageForAPI = { role: "user", content: userMessage };

      // Make API call to OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions", // Correct endpoint
        {
          model: "gpt-3.5-turbo", // Use supported model
          messages: [systemMessage, userMessageForAPI], // Messages array
          max_tokens: 150, // Limit response length
          temperature: 0.7, // Adjust randomness
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`, // Use API_KEY from environment
            "Content-Type": "application/json",
          },
        }
      );

      // Extract bot's response
      const botMessage = response.data.choices[0].message.content.trim();

      // Add bot message to chat
      setMessages((prev) => [...prev, { sender: "bot", text: botMessage }]);

      // Extract orders from bot response
      processBotResponse(botMessage);
    } catch (error) {
      // Log detailed error information
      if (error.response) {
        console.error("API Response Error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error("Error Message:", error.message);
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Process OpenAI's response to extract orders
  const processBotResponse = (response) => {
    const lowerCaseResponse = response.toLowerCase();

    menu.forEach((item) => {
      if (lowerCaseResponse.includes(item.name.toLowerCase())) {
        addOrder(item);
      }
    });
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="message bot">Processing...</div>}
      </div>
      <div className="input-section">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What would you like to order?"
          disabled={loading} // Disable input while processing
        />
        <button onClick={handleSend} disabled={loading || !userInput.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
