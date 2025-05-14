const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const Schema = mongoose.Schema;
const discountSchema = new Schema(
  {
    discountPrice: { type: Number, required: true },
    discountCode: { type: String, required: true },
    discountMessage: { type: String, default: "" },
    minTotalPrice: { type: Number, required: true },
    discountDateStart: { type: Date, required: true },
    discountDateEnd: { type: Date, required: true },
    discountSlots: { type: Number, required: true },
    discountAvailableSlots: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }, // Thêm trường deleted
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Không bắt buộc vì chỉ lưu khi có cập nhật
    }, // Thêm trường updatedBy
  },
  {
    timestamps: true,
    collection: "Discount",
  }
);
discountSchema.plugin(mongoose_delete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
