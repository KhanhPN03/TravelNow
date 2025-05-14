const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
    },
    cartIds: [
      {
        originalTourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OriginalTour",
        },
        subTourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OriginalTour",
        },
        slotsBooked: {
          type: Number,
          required: true,
        },
        expireAt: {
          type: Date,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "Cart",
  }
);

var cart = mongoose.model("Cart", CartSchema);

module.exports = cart;
