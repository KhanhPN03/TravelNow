const express = require("express");
const router = express.Router();

const cartController = require("../controllers/CartController");

router.get("/:userId", cartController.getCart);
router.delete("/:userId/:cartItemId/:slotsBooked", cartController.deleteCartTour);
router.post("/add", cartController.addToCart);
router.put("/add-back-to-cart", cartController.addbackToCart);
router.put("/update-inbooking-status", cartController.updateInBookingStatus);

module.exports = router;
