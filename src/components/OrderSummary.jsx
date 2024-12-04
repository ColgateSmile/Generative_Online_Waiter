import React from "react";

const OrderSummary = ({ orders, total }) => {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={index}>
            {order.name} - ${order.price}
          </li>
        ))}
      </ul>
      <h3>Total: ${total}</h3>
    </div>
  );
};

export default OrderSummary;
