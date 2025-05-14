const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usedDiscount = new Schema(
  {
    bookingId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Booking",
    },
    discountId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Discount",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
  },
  {
    timestamps: true,
    collection: "UsedDiscount",
  }
);

var UsedDiscount = mongoose.model("UsedDiscount", usedDiscount);

module.exports = UsedDiscount;
