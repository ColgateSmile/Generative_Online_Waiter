import React, { useState } from "react";
import axios from "axios";
import menu from "../data";

const ChatBox = ({ updateOrder }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]); // Confirmed items with quantities
  const [suggestedItems, setSuggestedItems] = useState([]); // Suggestions

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const handleSend = async () => {
    const userMessage = userInput.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setUserInput("");
    setLoading(true);

    try {
      const systemMessage = {
        role: "system",
        content: `
          You are an online waiter. 
          The menu is: ${menu
            .map((item) => `${item.name} ($${item.price})`)
            .join(", ")}. 
          If a customer orders, confirm the order, suggest complementary items, and summarize the total. Process orders with quantities like "2 pizzas".
        `,
      };

      const userMessageForAPI = { role: "user", content: userMessage };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [systemMessage, userMessageForAPI],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = response.data.choices[0].message.content.trim();
      setMessages((prev) => [...prev, { sender: "bot", text: botMessage }]);

      processBotResponse(botMessage, userMessage);
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const processBotResponse = (botResponse, userInput) => {
    const lowerCaseBotResponse = botResponse.toLowerCase();
    const lowerCaseUserInput = userInput.toLowerCase();

    menu.forEach((item) => {
      const itemRegex = new RegExp(`(\\d+)?\\s*${item.name.toLowerCase()}`, "i");
      const match = lowerCaseUserInput.match(itemRegex);

      if (match) {
        const quantity = parseInt(match[1]) || 1;
        addOrder(item, quantity);
      }
    });

    const newSuggestions = menu.filter(
      (item) =>
        lowerCaseBotResponse.includes(item.name.toLowerCase()) &&
        !orderedItems.some((order) => order.name === item.name)
    );
    setSuggestedItems(newSuggestions);
  };

  const addOrder = (item, quantity = 1) => {
    setOrderedItems((prev) => {
      const existingItem = prev.find((order) => order.name === item.name);

      if (existingItem) {
        existingItem.quantity += quantity;
        updateOrder([...prev]); // Update parent state
        return [...prev];
      } else {
        const updatedOrders = [...prev, { ...item, quantity }];
        updateOrder(updatedOrders); // Update parent state
        return updatedOrders;
      }
    });
  };

  const handleSuggestionAction = (item, add) => {
    if (add) {
      addOrder(item, 1);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `${item.name} has been added to your order.` },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `${item.name} has been skipped.` },
      ]);
    }

    setSuggestedItems((prev) => prev.filter((suggestion) => suggestion.name !== item.name));
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
        {suggestedItems.length > 0 ? (
          <div className="suggestions">
            <h4>Suggestions:</h4>
            {suggestedItems.map((item) => (
              <div key={item.name} className="suggestion">
                <span>{item.name} - ${item.price.toFixed(2)}</span>
                <button onClick={() => handleSuggestionAction(item, true)}>Add</button>
                <button onClick={() => handleSuggestionAction(item, false)}>Skip</button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="What would you like to order?"
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !userInput.trim()}>
              {loading ? "Sending..." : "Send"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
