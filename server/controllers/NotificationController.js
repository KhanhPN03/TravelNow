const Notification = require("../models/Notification");
const TokenModel = require("../config/push-notification");

class NotificationController {
  subscribe(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      TokenModel.setToken(token);
      res.status(201).json({ message: "Subscription received" });
    } catch (error) {
      next(error);
    }
  }

  async unSubscribe(req, res, next) {
    try {
      const { token } = req.body;      
      if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
      }
      await TokenModel.removeToken(token);
      res.status(200).json({ success: true, message: 'Token unsubscribed' });
    } catch (error) {
      console.error('Error unsubscribing token:', error);
      next(error);
    }
  }

  // Xử lý yêu cầu gửi thông báo
  async sendNotification(req, res, next) {
    try {
      const result = await TokenModel.sendNotification();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getNotificationForCustomer(req, res, next) {
    const { userId } = req.params;
    // Kiểm tra nếu userId không tồn tại hoặc không hợp lệ
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    try {
      const notifications = await Notification.find({
        recipients: { $in: ["customer"] },
      })
        .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
        .lean(); // Giúp giảm tải hiệu suất

      // Lọc thông báo hoàn tiền (refund)
      const refundNotifications = notifications.filter((notification) => {
        if (notification.type === "REFUND") {
          return notification.information?.refund?.userId.toString() === userId;
        }
      });

      // Lọc thông báo giảm giá (discount)
      const discountNotifications = notifications.filter(
        (notification) => notification.information?.discount
      );

      res.status(200).json({
        success: true,
        refundNotifications,
        discountNotifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationForCustomerById(req, res, next) {
    try {
      const { notificationId } = req.params; // Lấy notificationId từ request params

      if (!notificationId) {
        return res
          .status(400)
          .json({ success: false, message: "Notification ID is required" });
      }

      // Tìm thông báo theo notificationId
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      res.status(200).json({ success: true, notification });
    } catch (error) {
      next(error);
    }
  }

  // [POST] /
  async createNotification(req, res, next) {
    try {
      const { type, message, information = {}, recipients } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!type || !message || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: type, message, or recipients",
        });
      }

      // Validate type và recipients dựa trên enum trong schema
      const validTypes = [
        "BOOK TOUR",
        "REFUND",
        "MANAGE ORIGINAL TOUR",
        "MANAGE SUBSIDIARY TOUR",
        "MANAGE ACCOUNT",
        "MANAGE DISCOUNT",
        "RECEIVE DISCOUNT",
      ];
      const validRecipients = ["customer", "admin", "super_admin"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid notification type: ${type}`,
        });
      }
      if (!recipients.every((r) => validRecipients.includes(r))) {
        return res.status(400).json({
          success: false,
          error: `Invalid recipient: ${recipients}`,
        });
      }

      const notificationData = {
        type,
        message,
        recipients,
        readBy: [], // Mặc định chưa ai đọc
      };

      // Xử lý information dựa trên type
      if (type === "RECEIVE DISCOUNT" && information.discount) {
        notificationData.information = {
          discount: {
            discountCode: information.discount.discountCode,
            discountAmount: information.discount.discountAmount,
            discountDateEnd: information.discount.discountDateEnd
              ? new Date(information.discount.discountDateEnd)
              : undefined,
            minTotalPrice: information.discount.minTotalPrice,
          },
        };
      } else if (type === "REFUND" && information.refund) {
        if (
          !information.refund.userId ||
          !mongoose.Types.ObjectId.isValid(information.refund.userId)
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid or missing userId in refund information",
          });
        }
        notificationData.information = {
          refund: {
            ticketCode: information.refund.ticketCode,
            tourName: information.refund.tourName,
            amount: information.refund.amount,
            userId: mongoose.Types.ObjectId(information.refund.userId),
          },
        };
      } else {
        notificationData.information = {}; // Không có thông tin bổ sung
      }

      // Tạo và lưu thông báo
      const notification = new Notification(notificationData);
      await notification.save();
      res.status(201).json({ success: true, notification });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /
  async getAllNotification(req, res) {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkNotifications(req, res, next) {
    try {
      const { userId, role } = req.params;
      // Kiểm tra nếu userId không tồn tại
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const customerNotifications = await Notification.find({
        recipients: { $in: [role] },
      }).sort({ createdAt: -1 });

      const unreadNotifications = customerNotifications.filter(
        (notification) => {
          return !notification.readBy.some(
            (read) => read.userId.toString() === userId
          );
        }
      );

      const unreadCount = unreadNotifications.length;

      res.status(200).json({
        success: true,
        hasUnread: unreadCount > 0, // Cờ cho biết có thông báo mới không
        unreadCount, // Số lượng thông báo chưa đọc
        notifications: unreadNotifications, // Danh sách thông báo chưa đọc (nếu cần)
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Kiểm tra xem userId đã tồn tại trong readBy chưa
      const isAlreadyRead = notification.readBy.some(
        (reader) => reader.userId.toString() === userId
      );

      if (!isAlreadyRead) {
        notification.readBy.push({ userId });
        await notification.save();
      }

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new NotificationController();
