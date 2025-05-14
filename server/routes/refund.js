const express = require("express");
const router = express.Router();
const RefundController = require("../controllers/RefundController");

router.post("/ticket/create", RefundController.createRefundRequest);
router.get("/get-all", RefundController.getRefundRequests);
router.put("/update/:id", RefundController.updateRefundRequest);

module.exports = router;
