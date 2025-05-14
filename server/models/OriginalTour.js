const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const Schema = mongoose.Schema;

const originalTourSchema = new Schema(
  {
    originalTourCode: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    experienceJourney: { type: Array, required: true },
    images: { type: Array, required: true },
    thumbnail: { type: Object, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, required: true },
    place: { type: Array, required: true }, // Changed from String to Array
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    deleted: { type: Boolean, default: false }, // Thêm trường deleted
  },
  {
    collection: "OriginalTour",
    timestamps: true,
  }
);

originalTourSchema.plugin(mongoose_delete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("OriginalTour", originalTourSchema);
