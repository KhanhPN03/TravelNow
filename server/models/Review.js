// hoai change
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const review = new Schema(
  {
    ticketId: {
      type: mongoose.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    subTourId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubsidiaryTour", // Liên kết đến bảng SubsidiaryTour
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    rating: {
      transport: {
        type: Number,
        require: true,
      },
      services: {
        type: Number,
        require: true,
      },
      priceQuality: {
        type: Number,
        require: true,
      },
    },
    feedback: {
      type: String,
      require: true,

      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "Review",
  }
);

var Review = mongoose.model("Review", review);

module.exports = Review;
