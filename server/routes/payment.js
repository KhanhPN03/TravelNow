const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");

router.post('/payos/create-order', PaymentController.createOrder);

router.post('/payos/webhook', PaymentController.listenWebhook);

router.post('/payos/cancel-order', PaymentController.cancelOrder);
router.get('/payos/payment-info', PaymentController.infoOrder);


module.exports = router;