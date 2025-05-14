const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "BOOK TOUR", // customer role
        "REFUND", // customer, admin role
        "MANAGE ORIGINAL TOUR",
        "MANAGE SUBSIDIARY TOUR",
        "MANAGE ACCOUNT",
        "MANAGE DISCOUNT",
        "RECEIVE DISCOUNT", // customer role
      ],
      required: true,
    },
    message: { type: String, required: true },
    information: {
      // Information for org/sub tour
      createTour: {
        tourCode: { type: String },
        createdBy: { type: String },
        title: { type: String },
      },
      softDeleteTour: {
        tourCode: { type: String },
        deletedBy: { type: String },
        title: { type: String },
      },
      hardDeleteTour: {
        tourCode: { type: String },
        deletedBy: { type: String },
        title: { type: String },
      },
      restoreTour: {
        tourCode: { type: String },
        restoredBy: { type: String },
        title: { type: String },
      },

      // Information for account
      createAccount: {
        accountCode: { type: String },
        createdBy: { type: String },
      },
      softDeleteAccount: {
        accountCode: { type: String },
        deletedBy: { type: String },
      },
      hardDeleteAccount: {
        accountCode: { type: String },
        deletedBy: { type: String },
      },
      restoreAccount: {
        accountCode: { type: String },
        restoredBy: { type: String },
      },

      // Information for discount
      creatediscount: {
        discountCode: { type: String },
        discountAmount: { type: Number },
        discountDateEnd: { type: Date },
        minTotalPrice: { type: Number },
      },
      updatediscount: {
        discountCode: { type: String },
        discountAmount: { type: Number },
        discountDateEnd: { type: Date },
        minTotalPrice: { type: Number },
      },
      softDeleteDiscount: {
        discountCode: { type: String },
        deletedBy: { type: String },
      },
      restoreDiscount: {
        discountCode: { type: String },
        restoredBy: { type: String },
      },
      hardDeleteDiscount: {
        discountCode: { type: String },
        deletedBy: { type: String },
      },

      // Information for refund
      refund: {
        ticketCode: { type: String },
        tourName: { type: String },
        username: { type: String },
        amount: { type: Number },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account", // Liên kết đến bảng Account
        },
      },
    },
    recipients: [
      {
        type: String,
        enum: ["customer", "admin", "super_admin"],
        required: true,
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
      },
    ],
  },
  {
    collection: "Notification",
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
