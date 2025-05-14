import React, { createContext, useState } from "react";

export const PaymentContext = createContext();

export default PaymentProvider = ({ children, timeLeft, setTimeLeft }) => {
  return (
    <PaymentContext.Provider value={{ timeLeft, setTimeLeft }}>
      {children}
    </PaymentContext.Provider>
  );
};
