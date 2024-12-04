import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import OrderSummary from "./components/OrderSummary";
import "./App.css";

const App = () => {
  const [orders, setOrders] = useState([]); // Store orders
  const [total, setTotal] = useState(0); // Store total bill

  // Function to add an order
  const addOrder = (item) => {
    setOrders((prev) => [...prev, item]);
    setTotal((prev) => prev + item.price);
  };

  return (
    
    <div className="App">
      <h1>Online Waiter</h1>
      <ChatBox addOrder={addOrder} />
      <OrderSummary orders={orders} total={total} />
    </div>
  );
};

export default App;
