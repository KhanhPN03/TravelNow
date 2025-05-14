const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Account', // Liên kết đến bảng Booking
  },
  refundBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Account', // Liên kết đến bảng Booking
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ticket', // Liên kết đến bảng Booking
  },
  refundStatus: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
  },
  refundBillImage: {
    type: String,
    default: "",
  },
  refundInformation: {
    accountNumber: {type: String, required: true},
    bankName: {type: String, required: true},
    accountNameBank: {type: String, required: true}, 
    reason: {
      customer: {type: String, required: true},
      admin: {type: String},
    }
  },
}, {
  collection: 'Refund',
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Refund', refundSchema);
