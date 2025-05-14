const express = require("express");
const router = express.Router();
const UsedDiscountController = require("../controllers/UsedDiscountController");

router.post("/create", UsedDiscountController.createUsedDiscount);
router.get("/", UsedDiscountController.getUsedDiscounts);
router.get("/user/:userId", UsedDiscountController.getUsedDiscountsByUser);

module.exports = router;
