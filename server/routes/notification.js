const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");

// Đăng ký token
router.post('/subscribe', notificationController.subscribe);
router.post('/unsubscribe', notificationController.unSubscribe);

// Gửi thông báo
router.get('/send', notificationController.sendNotification);

router.get('/customer/:userId', notificationController.getNotificationForCustomer);
router.get('/:notificationId', notificationController.getNotificationForCustomerById);

router.get('/check-notification/:userId/:role', notificationController.checkNotifications);

router.get("/", notificationController.getAllNotification);

router.post("/", notificationController.createNotification);

router.put("/:notificationId", notificationController.markAsRead);

module.exports = router;
