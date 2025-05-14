const express = require("express");
const router = express.Router();

const discountController = require("../controllers/DiscountController");

// router.post("/create", discountController.createDiscount);
router.post("/create", discountController.createDiscount);
router.get("/", discountController.getDiscounts);
router.get(
  "/deleted/get-all-accounts/",
  discountController.getRemovedDiscounts
);
// router.put("/:id", discountController.updateDiscount);
router.put("/update/:id", discountController.updateDiscount);
// router.delete("/:id", discountController.deleteDiscount);

// router.delete("/", discountController.deleteDiscount);
// router.put("/expire-check", discountController.checkExpiredDiscounts);
router.delete(
  "/softDelete/:discountId/:userId",
  discountController.softDeleteDiscountById
);
router.delete(
  "/hardDelete/:discountId",
  discountController.hardDeleteDiscountById
);
router.put("/restore/:discountId", discountController.restoreDiscountById);
module.exports = router;
