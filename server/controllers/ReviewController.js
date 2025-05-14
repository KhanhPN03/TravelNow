const Review = require("../models/Review");
const mongoose = require("mongoose");
const Account = require("../models/Account");
const SubsidiaryTour = require("../models/SubsidiaryTour");

class ReviewController {
  // [GET] review/get-review/:userId
  async getAllReviewOfCustomer(req, res, next) {
    try {
      const { userId } = req.params;

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId" });
      }

      // Find reviews and populate related fields
      const reviews = await Review.find({ userId, isDeleted: false })
        .populate("userId")
        .populate("ticketId", "ticketRef") // Populate ticket reference
        .populate("subTourId", "subTourCode originalTourId"); // Populate subsidiary tour details

      if (!reviews.length) {
        return res
          .status(404)
          .json({ success: false, message: "No reviews found for this user" });
      }

      // Filter out unwanted fields
      const filteredReviews = reviews.map((review) => {
        const { createdAt, updatedAt, isDeleted, ...rest } = review.toObject();
        return rest;
      });

      res.status(200).json({ success: true, reviews: filteredReviews });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }

  async getReviewOfCustomerInSpecificSubTour(req, res, next) {
    const { userId, subTourId } = req.params;
    const _id = subTourId;
    // Validate parameters
    if (!userId || !subTourId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or originalTourId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    if (!mongoose.Types.ObjectId.isValid(subTourId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid originalTourId" });
    }

    try {
      // Find all subsidiary tours for the given originalTourId
      const subsidiaryTours = await SubsidiaryTour.find({
        _id,
        isDeleted: false,
        isCanceled: false,
      }).select("_id");

      if (!subsidiaryTours.length) {
        return res.status(404).json({
          success: false,
          message: "No active subsidiary tours found for this original tour",
        });
      }

      const subTourIds = subsidiaryTours.map((tour) => tour._id);

      // Find reviews for the user in any of these subsidiary tours
      const reviews = await Review.find({
        userId,
        subTourId: { $in: subTourIds },
        isDeleted: false,
      })
        .populate("ticketId", "ticketRef")
        .populate("subTourId", "subTourCode originalTourId");

      if (!reviews.length) {
        return res.status(404).json({
          success: false,
          message: "No reviews found for this user in the specified tour",
        });
      }

      // Filter out unwanted fields
      const filteredReviews = reviews.map((review) => {
        const { isDeleted, createdAt, updatedAt, ...rest } = review.toObject();
        return rest;
      });

      res.status(200).json({ success: true, reviews: filteredReviews });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /review/:id
  async deleteReview(req, res, next) {
    try {
      await Review.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
      next(error);
    }
  }

  async createReview(req, res, next) {
    try {
      const { ticketId, originalTourId, userId, rating } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!ticketId || !userId || !originalTourId || !rating) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // Kiểm tra ticketId và userId có phải ObjectId hợp lệ không
      if (
        !mongoose.Types.ObjectId.isValid(ticketId) ||
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(originalTourId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ticketId or userId" });
      }

      let review = await Review.findOne({ userId, originalTourId });

      if (review) {
        review.rating = rating;
        review.feedback = req.body.feedback;
        await review.save();
        return res.status(200).json({
          success: true,
          message: "Review updated successfully",
          review,
        });
      }
      // Tạo review mới
      review = new Review({
        ...req.body,
        ticketId,
        originalTourId,
        userId,
        rating,
      });

      await review.save();

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsBySubTourIds(req, res, next) {
    try {
      const { subTourIds } = req.body;

      if (
        !subTourIds ||
        !Array.isArray(subTourIds) ||
        subTourIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "subTourIds must be a non-empty array",
        });
      }

      // Kiểm tra định dạng ObjectId
      const invalidIds = subTourIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid subTourId format",
        });
      }

      const reviews = await Review.find({
        subTourId: { $in: subTourIds },
        isDeleted: { $ne: true },
      }).sort({ createdAt: -1 });

      // Fetch user information for each review
      const reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          const user = await Account.findById(review.userId);
          const reviewObj = review.toObject();
          delete reviewObj.isDeleted;

          return {
            ...reviewObj,
            userInfo: user
              ? {
                  name: user.username,
                  avatar: user.avatar,
                }
              : null,
          };
        })
      );

      res.status(200).json({
        success: true,
        reviews: reviewsWithUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/:subTourId
  async getReviewsBySubTourIdForAdmin(req, res, next) {
    const { subTourId } = req.params;

    if (!subTourId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing subTourId" });
    }
    if (!mongoose.Types.ObjectId.isValid(subTourId)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid subTourId format" });
    }

    try {
      const reviews = await Review.find({
        subTourId: new mongoose.Types.ObjectId(subTourId),
      })
        .populate("userId", "username")
        .populate("subTourId", "subTourCode");

      let tmpReviews = reviews.map((review) => {
        let avgRating =
          (review.rating.transport +
            review.rating.services +
            review.rating.priceQuality) /
          3;
        avgRating = parseFloat(avgRating.toFixed(1));

        return {
          ...review.toObject(), // Chuyển Mongoose document thành object JS
          avgRating,
        };
      });

      res.status(200).json({ success: true, reviews: tmpReviews });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/:subTourId
  async getReviewsByOriginalTourIdForAdmin(req, res, next) {
    const { orgTourId } = req.params;

    if (!orgTourId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing orgTourId" });
    }
    if (!mongoose.Types.ObjectId.isValid(orgTourId)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid orgTourId format" });
    }

    try {
      // Lấy các subsidiary tour thuộc originalTourId
      const subTours = await mongoose
        .model("SubsidiaryTour")
        .find({ originalTourId: orgTourId })
        .select("_id");
      const subTourIds = subTours.map((subTour) => subTour._id);

      if (subTourIds.length === 0) {
        return res.status(200).json({ success: true, reviews: [] });
      }

      // Tìm các review có subTourId thuộc các subsidiary tour trên
      const reviews = await Review.find({
        subTourId: { $in: subTourIds },
      })
        .populate("userId", "username")
        .populate("subTourId", "subTourCode originalTourId");

      let tmpReviews = reviews.map((review) => {
        let avgRating =
          (review.rating.transport +
            review.rating.services +
            review.rating.priceQuality) /
          3;
        avgRating = parseFloat(avgRating.toFixed(1));

        return {
          ...review.toObject(), // Chuyển Mongoose document thành object JS
          avgRating,
        };
      });

      res.status(200).json({ success: true, reviews: tmpReviews });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /admin/:reviewId
  async updateFeedbackByReviewIdForAdmin(req, res, next) {
    try {
      const { reviewId } = req.params;

      // Kiểm tra reviewId có được cung cấp không
      if (!reviewId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing reviewId" });
      }

      // Kiểm tra định dạng ObjectId
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid reviewId format" });
      }

      // Tìm review
      const review = await Review.findById(reviewId);

      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }

      // Kiểm tra xem review đã bị xóa chưa
      if (review.isDeleted) {
        return res
          .status(400)
          .json({ success: false, message: "Review is deleted" });
      }

      // Cập nhật feedback thành chuỗi rỗng
      review.feedback = "";
      await review.save();

      // Loại bỏ các trường không cần thiết trước khi trả về
      const { isDeleted, createdAt, updatedAt, ...rest } = review.toObject();

      return res.status(200).json({
        success: true,
        message: "Feedback cleared successfully",
        review: rest,
      });
    } catch (error) {
      next(error);
    }
  }
 async getReviewByTicketId (req, res, next)  {
    try {
      const { ticketId } = req.params;
      const review = await Review.findOne({ ticketId })
        .populate("userId", "firstname lastname avatar")
        .lean();
  
      return res.status(200).json({
        success: true,
        review: review || null,
      });
    } catch (error) {
      console.error("Error fetching review by ticketId:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
}

module.exports = new ReviewController();
