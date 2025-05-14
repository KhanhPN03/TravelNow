const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Booking",
    },
    ticketRef: {
      type: String,
      required: true,
      unique: true,
    },
    ticketStatus: {
      type: String,
      enum: ["FUTURE", "COMPLETED", "REFUND"],
      default: "FUTURE",
    },
    isCancel: { type: Boolean, required: true, default: false },
    checkinDetails: [
      {
        customerName: { type: String, default: "" },
        customerPhoneNumber: { type: String, default: "" },
        customerIdentityNumber: { type: String, default: "" },
      },
    ],
    isCheckedIn: { type: Boolean, required: true, default: false },
  },
  {
    collection: "Ticket",
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
