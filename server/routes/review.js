const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");

router.post(
  "/tour-reviews-by-subtours",
  ReviewController.getReviewsBySubTourIds
); // Sửa lại đường dẫn tương đối

router.post("/create", ReviewController.createReview);
router.delete("/:id", ReviewController.deleteReview);
router.get(
  "/get-review/:userId/:subTourId",
  ReviewController.getReviewOfCustomerInSpecificSubTour
);
router.get("/ticket/:ticketId", ReviewController.getReviewByTicketId);
router.get("/get-review/:userId", ReviewController.getAllReviewOfCustomer);
// Admin
router.get("/admin/:subTourId", ReviewController.getReviewsBySubTourIdForAdmin);
router.get(
  "/admin/total/:orgTourId",
  ReviewController.getReviewsByOriginalTourIdForAdmin
);
router.put(
  "/admin/:reviewId",
  ReviewController.updateFeedbackByReviewIdForAdmin
);

module.exports = router;
