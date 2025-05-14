const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const bookingSchema = new Schema({
  orderCode: {
    type: Number,
    required: true,
    unique: true, // Mã đơn hàng phải duy nhất
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account", // Liên kết đến bảng Account
  },
  originalTourId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "OriginalTour", // Liên kết đến bảng SubsidiaryTour
  },
  subTourId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "SubsidiaryTour", // Liên kết đến bảng SubsidiaryTour
  },
  discountId: {
    type: mongoose.Schema.Types.ObjectId,
    default: undefined,
    ref: "Discount", // Liên kết đến bảng SubsidiaryTour
  },  
  buyerName: {
    type: String,
    default: "",
  },
  buyerEmail: {
    type: String,
    default: "",
  },
  buyerPhone: {
    type: String,
    default: "",
  },
  bookedSlot: {
    type: Number,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Failed"],
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    default: "VietQR"
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number,
    required: true, // Giá cuối cùng sau khi áp dụng mã khuyến mãi
  },
}, {
  collection: 'Booking',
  timestamps: true, // Tự động thêm createdAt và updatedAt
});



module.exports = mongoose.model("Booking", bookingSchema);
