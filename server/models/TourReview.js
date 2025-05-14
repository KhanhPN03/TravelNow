const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourReview = new Schema(
  {
    subTourId: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
    },
    reviewIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
    collection: "TourReview",
  }
);

var TourReview = mongoose.model("TourReview", tourReview);

module.exports = TourReview;
