const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteTourSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",  // Changed from User to Account
    },
    favoriteTourIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "OriginalTour",  // Changed from Tour to OriginalTour
      },
    ],
  },
  {
    timestamps: true,
    collection: "FavoriteList",
  }
);

const favoriteTour = mongoose.model("FavoriteList", favoriteTourSchema);
module.exports = favoriteTour;