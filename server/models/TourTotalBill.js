const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TourTotalBillSchema = new Schema({
    tourId: {type: mongoose.Types.ObjectId, ref: "Tour"},
    slot: {type: Number},
    billArray: [{
        userId: {type: mongoose.Types.ObjectId, ref: 'User'},
        slot: {type: Number}
    }]
}, {
    collection: "TourTotalBill"
});

module.exports = mongoose.model("TourTotalBill", TourTotalBillSchema);