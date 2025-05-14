// notificationService.js
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

async function createNotification({ type, message, information = {}, recipients }) {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!type || !message || !recipients || !Array.isArray(recipients)) {
      throw new Error('Missing required fields: type, message, or recipients');
    }

    const validTypes = [
      'BOOK TOUR',
      'REFUND',
      'MANAGE ORIGINAL TOUR',
      'MANAGE SUBSIDIARY TOUR',
      'MANAGE ACCOUNT',
      'MANAGE DISCOUNT',
      'RECEIVE DISCOUNT',
    ];
    const validRecipients = ['customer', 'admin', 'super_admin'];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }
    if (!recipients.every((r) => validRecipients.includes(r))) {
      throw new Error(`Invalid recipient: ${recipients}`);
    }

    // Xây dựng object thông báo
    const notificationData = {
      type,
      message,
      recipients,
      readBy: [],
      information: {}, // Khởi tạo rỗng, chỉ thêm khi cần
    };

    // Xử lý information dựa trên type
    if (type === 'RECEIVE DISCOUNT' && information.discount) {
      notificationData.information.discount = {
        discountCode: information.discount.discountCode,
        discountAmount: information.discount.discountAmount,
        discountDateEnd: information.discount.discountDateEnd
          ? new Date(information.discount.discountDateEnd)
          : undefined,
        minTotalPrice: information.discount.minTotalPrice,
      };
    } else if (type === 'REFUND' && information.refund) {
      if (!information.refund.userId || !mongoose.Types.ObjectId.isValid(information.refund.userId)) {
        throw new Error('Invalid or missing userId in refund information');
      }
      notificationData.information.refund = {
        ticketCode: information.refund.ticketCode,
        tourName: information.refund.tourName,
        amount: information.refund.amount,
        userId: mongoose.Types.ObjectId(information.refund.userId),
      };
    }

    // Tạo và lưu thông báo
    const notification = await Notification.create(notificationData);
    // console.log('Notification created:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    throw error;
  }
}

module.exports = { createNotification };