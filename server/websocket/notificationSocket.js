const WebSocket = require("ws");

const notificationSocket = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on("connection", (ws) => {
    console.log("Notification WebSocket connected");

    ws.on("close", () => {
      console.log("Notification WebSocket disconnected");
    });
  });

  return wss;
};

module.exports = notificationSocket;
