import { WEBSOCKET_URL } from "@env";
export const connectWebSocket = (path, onMessage, onClose) => {
  let socket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectInterval = 2000;
  const fullUrl = `${WEBSOCKET_URL}${path}`;

  const connect = () => {
    console.log("Connecting to WebSocket:", fullUrl);
    socket = new WebSocket(fullUrl);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      reconnectAttempts = 0;
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        onMessage(data);
      } catch (error) {
        console.error('Lỗi khi parse JSON:', error.message);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      onClose();
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(
          `Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${
            reconnectInterval / 1000
          }s...`
        );
        setTimeout(connect, reconnectInterval);
      } else {
        console.log("Exceeded max reconnect attempts.");
      }
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error.message);
    };
  };

  connect();
  return socket;
};

