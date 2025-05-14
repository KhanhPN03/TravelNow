const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const Schema = mongoose.Schema;

const subsidiaryTourSchema = new Schema(
  {
    originalTourId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "OriginalTour",
    },
    subTourCode: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    guidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    price: { type: Number, required: true },
    experienceStart: { type: Object, required: true },
    experienceEnd: { type: Object, required: true },
    dateStart: {
      date: { type: Date, required: true },
      time: { type: String, required: true },
    },
    dateEnd: { type: Date, required: true },
    totalSlots: { type: Number, required: true },
    availableSlots: { type: Number, required: true },
    status: { type: Boolean, required: true },
    revenue: { type: Number, default: 0 },
    guideLanguage: { type: String, required: true },
    hide: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }, // Thêm trường deleted
  },
  {
    collection: "SubsidiaryTour",
    timestamps: true,
  }
);

subsidiaryTourSchema.plugin(mongoose_delete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("SubsidiaryTour", subsidiaryTourSchema);
