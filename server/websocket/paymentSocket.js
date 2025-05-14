const WebSocket = require("ws");

const paymentSocket = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", (ws) => {
    console.log("Payment WebSocket connected");

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "paymentStatus") {
        // Xử lý logic cho payment
        ws.send(JSON.stringify({ status: "Payment processing..." }));
      }
    });

    ws.on("close", () => {
      console.log("Payment WebSocket disconnected");
    });
  });

  return wss;
};

module.exports = paymentSocket;
