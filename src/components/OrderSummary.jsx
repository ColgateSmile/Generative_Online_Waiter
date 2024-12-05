import React from "react";

const OrderSummary = ({ orders }) => {
  const calculateTotal = () => {
    return orders.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      {orders.length > 0 ? (
        <>
          <ul>
            {orders.map((item) => (
              <li key={item.name}>
                {item.name} x {item.quantity} - ${item.price.toFixed(2)} each
              </li>
            ))}
          </ul>
          <p>Total: ${calculateTotal()}</p>
        </>
      ) : (
        <p>No items in your order.</p>
      )}
    </div>
  );
};

export default OrderSummary;
