import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import RealTimeChat from "./components/RealTimeChat";
import ChatToggle from "./components/ChatToggle";
import OrderSummary from "./components/OrderSummary";
import "./App.css";

const App = () => {
  const [orders, setOrders] = useState([]);
  const [mode, setMode] = useState("text"); // "text" or "voice"

  const updateOrder = (newOrders) => {
    setOrders([...newOrders]);
  };

  const sendMessage = (message) => {
    // Handle sending messages to ChatBox or RealTimeChat
    console.log("User Message:", message);
    // Integrate this with ChatBox or API for response handling
  };

  return (
    <div>
      <h1>Online Waiter AI </h1>
      <ChatToggle mode={mode} setMode={setMode} />
      {mode === "text" ? (
        <ChatBox updateOrder={updateOrder} />
      ) : (
        <RealTimeChat sendMessage={sendMessage} />
      )}
      <OrderSummary orders={orders} />
    </div>
  );
};

export default App;