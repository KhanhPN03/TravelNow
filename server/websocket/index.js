const paymentSocket = require("./paymentSocket");
const cartSocket = require("./cartSocket");
const notificationSocket = require("./notificationSocket");

// Khai báo biến toàn cục
let paymentWSS;
let cartWSS;
let notificationWSS;

const initWebSocket = (server) => {
  paymentWSS = paymentSocket(server); // Gán giá trị cho biến toàn cục
  cartWSS = cartSocket(server); // Gán giá trị cho biến toàn cục
  notificationWSS = notificationSocket(server);

  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws/payment") {
      paymentWSS.handleUpgrade(request, socket, head, (ws) => {
        paymentWSS.emit("connection", ws, request);
      });
    } else if (request.url === "/ws/cart") {
      cartWSS.handleUpgrade(request, socket, head, (ws) => {
        cartWSS.emit("connection", ws, request);
      });
    } else if (request.url === "/ws/notification") {
      notificationWSS.handleUpgrade(request, socket, head, (ws) => {
        notificationWSS.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
};

// Getter để sử dụng ở nơi khác
const getPaymentSocket = () => paymentWSS;
const getCartSocket = () => cartWSS;
const getNotificationSocket = () => notificationWSS;

module.exports = {
  initWebSocket,
  getPaymentSocket,
  getCartSocket,
  getNotificationSocket,
};
