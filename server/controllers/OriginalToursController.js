const OriginalTour = require("../models/OriginalTour");
const SubTour = require("../models/SubsidiaryTour");
const Notification = require("../models/Notification");
const Account = require("../models/Account");

class OriginalToursController {
  // [GET] /searchOriginal?q=
  searchOriginal(req, res, next) {
    let query = req.query.q;
    OriginalTour.find({ title: { $regex: query, $options: "i" } })
      .then((tours) => {
        if (tours.length === 0) {
          return res.status(404).json({ message: "Not found", success: false });
        } else {
          res.status(200).json({ tours, success: true });
        }
      })
      .catch(next);
  }

  // [GET] /
  async getAllOriginalTours(req, res, next) {
    try {
      const originalTours = await OriginalTour.find({})
        .populate("createdBy", "accountCode")
        .populate("deletedBy", "accountCode");
      res
        .status(200)
        .json({
          message: "success",
          lenght: originalTours.length,
          originalTours,
        });
    } catch (error) {
      next(error);
    }
  }

  async getAllRemovedOriginalTours(req, res, next) {
    try {
      const originalTours = await OriginalTour.findWithDeleted({})
        .populate("createdBy", "accountCode")
        .populate("deletedBy", "accountCode");
      res.status(200).json({ message: "success", originalTours });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /:originalTourId
  getOriginalTourById(req, res, next) {
    const id = req.params.originalTourId;
    OriginalTour.findById(id)
      .populate("createdBy", "accountCode")
      .then((tour) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tour);
      })
      .catch(next);
  }

  // [POST] /
  async createOriginalTour(req, res, next) {
    try {
      const originalTour = await OriginalTour.create(req.body);

      const account = await Account.findById(req.body.createdBy);

      // Tạo thông báo và lưu vào db khi admin tạo org tour mới [Chưa tối ưu - bản draf]
      const notification = await Notification.create({
        type: "MANAGE ORIGINAL TOUR",
        message: `${account.accountCode} create a new original tour`,
        information: {
          createTour: {
            tourCode: req.body.originalTourCode,
            createdBy: account.accountCode,
            title: req.body.title,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      notification.save();

      // Lấy socket và gửi thông báo qua WebSocket
      const { getNotificationSocket } = require("../websocket/index");
      const notificationSocket = getNotificationSocket();
      if (notificationSocket) {
        notificationSocket.broadcast({
          status: true,
        });
      }

      originalTour.save().then((tour) => res.json(tour));
    } catch (error) {
      next(error);
    }
  }

  // orgTours/topRevenue
  // Tìm top 5 tour doanh thu cao nhất nằm trong khoảng thời gian
  async getTopOriginalToursByDate(req, res, next) {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Parse dates to ensure they are in Date format
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Fetch all SubsidiaryTour documents within the date range
      const subsidiaryTours = await mongoose.model("SubsidiaryTour").find({
        dateStart: { $gte: start, $lte: end },
      });

      // Create a map to store total revenue for each OriginalTour
      const revenueMap = {};

      subsidiaryTours.forEach((tour) => {
        const tourId = tour.tourId.toString(); // Convert ObjectId to string for easier manipulation
        if (!revenueMap[tourId]) {
          revenueMap[tourId] = 0; // Initialize revenue if not already present
        }
        revenueMap[tourId] += tour.revenue; // Add revenue for the tour
      });

      // Convert the map to an array and sort by total revenue in descending order
      const sortedRevenue = Object.entries(revenueMap)
        .map(([tourId, totalRevenue]) => ({ tourId, totalRevenue }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5); // Take the top 5 tours

      // Fetch details of the top 5 OriginalTours
      const topTours = await Promise.all(
        sortedRevenue.map(async ({ tourId, totalRevenue }) => {
          const originalTour = await mongoose
            .model("OriginalTour")
            .findById(tourId);
          return {
            tourId,
            totalRevenue,
            tourName: originalTour?.name || "Unknown",
            description:
              originalTour?.description || "No description available",
          };
        })
      );

      return res.status(200).json({
        topTours,
      });
    } catch (error) {
      next(error);
    }
  }

  // orgTours/allRevenue
  async getAllOriginalToursRevenueByDate(req, res, next) {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Parse dates to ensure they are in Date format
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Fetch all SubsidiaryTours within the date range
      const subsidiaryTours = await mongoose.model("SubsidiaryTour").find({
        dateStart: { $gte: start, $lte: end },
      });

      // Fetch all OriginalTours
      const originalTours = await mongoose.model("OriginalTour").find();

      // Create a map to store total revenue for each OriginalTour
      const revenueMap = {};

      // Calculate total revenue for each OriginalTour based on SubsidiaryTours
      subsidiaryTours.forEach((tour) => {
        const tourId = tour.tourId.toString(); // Convert ObjectId to string for consistent comparison
        if (!revenueMap[tourId]) {
          revenueMap[tourId] = {
            totalRevenue: 0,
          };
        }
        revenueMap[tourId].totalRevenue += tour.revenue; // Sum revenue
      });

      // Map results to include OriginalTour details
      const result = originalTours.map((tour) => {
        const tourId = tour._id.toString(); // Convert ObjectId to string
        const totalRevenue = revenueMap[tourId]?.totalRevenue || 0; // Default to 0 if no revenue found
        return {
          tourId,
          tourName: tour.name,
          createdAt: tour.createdAt,
          totalRevenue,
        };
      });

      // Sort results by total revenue in descending order
      result.sort((a, b) => b.totalRevenue - a.totalRevenue);

      return res.status(200).json({
        tours: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // orgTours/revenue/:originalTourId
  // Tìm doanh thu của tour mẹ nằm trong khoảng thời gian
  async getOriginalTourRevenueByIdByDate(req, res, next) {
    try {
      const { startDate, endDate, originalTourId } = req.body;

      if (!startDate || !endDate || !originalTourId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Parse dates to ensure they are in Date format
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find all SubsidiaryTours matching the criteria and calculate the total revenue
      const result = await mongoose.model("SubsidiaryTour").aggregate([
        {
          $match: {
            tourId: mongoose.Types.ObjectId(originalTourId), // Match by tourId
            dateStart: { $gte: start, $lte: end }, // Match dateStart within range
          },
        },
        {
          $group: {
            _id: null, // No grouping key, calculate for all matching documents
            totalRevenue: { $sum: "$revenue" }, // Sum up the revenue field
          },
        },
      ]);

      // Check if any revenue data exists
      const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

      return res.status(200).json({
        totalRevenue,
      });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /softDelete/:originalTourId/:userId
  async softDeleteOriginalTourById(req, res, next) {
    try {
      const { originalTourId, userId } = req.params;

      const account = await Account.findById(userId);

      if (!originalTourId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID" });
      }

      // Tìm tour theo ID
      const deleteTour = await OriginalTour.findById(originalTourId);
      const existedSubTour = await SubTour.findOne({
        originalTourId: originalTourId,
      });

      if (!deleteTour) {
        return res
          .status(404)
          .json({ success: false, message: "Tour not found" });
      }

      // Thực hiện soft delete và lưu thông tin deletedBy, deletedAt
      if (existedSubTour) {
        return res.status(200).json({
          success: false,
          message: "Subsidiary tour existed",
          subTour: existedSubTour,
        });
      }
      await deleteTour.delete(userId);

      // Tạo thông báo và lưu vào db khi admin tạo org tour mới [Chưa tối ưu - bản draf]
      const notification = await Notification.create({
        type: "MANAGE ORIGINAL TOUR",

        message: `${account.accountCode} removed an original tour`,

        information: {
          softDeleteTour: {
            tourCode: deleteTour.originalTourCode,
            deletedBy: account.accountCode,
            title: deleteTour.title,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      notification.save();

      // Lấy socket và gửi thông báo qua WebSocket
      const { getNotificationSocket } = require("../websocket/index");
      const notificationSocket = getNotificationSocket();
      if (notificationSocket) {
        notificationSocket.broadcast({
          status: true,
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "Tour soft deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /hardDelete/:originalTourId/:userId
  async hardDeleteOriginalTourById(req, res, next) {
    try {
      const { originalTourId, userId } = req.params;
      const account = await Account.findById(userId);

      if (!originalTourId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID" });
      }

      const deleteTour = await OriginalTour.findByIdAndDelete(originalTourId);

      if (!deleteTour) {
        return res
          .status(404)
          .json({ success: false, message: "Tour not found" });
      }

      // Tạo thông báo và lưu vào db khi admin tạo org tour mới [Chưa tối ưu - bản draf]
      const notification = await Notification.create({
        type: "MANAGE ORIGINAL TOUR",

        message: `${account.accountCode} permanently delete an origianl tour`,

        information: {
          hardDeleteTour: {
            tourCode: deleteTour.originalTourCode,
            deletedBy: account.accountCode,
            title: deleteTour.title,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      notification.save();

      // Lấy socket và gửi thông báo qua WebSocket
      const { getNotificationSocket } = require("../websocket/index");
      const notificationSocket = getNotificationSocket();
      if (notificationSocket) {
        notificationSocket.broadcast({
          status: true,
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "Tour hard deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /restore/:originalTourId/:userId
  async restoreOriginalTourById(req, res, next) {
    try {
      const { originalTourId, userId } = req.params;

      if (!originalTourId || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID or user ID" });
      }

      // Debug: Log the OriginalTour model
      console.log("OriginalTour model:", OriginalTour);

      // Find tour by ID, including soft-deleted
      const restoreTour = await OriginalTour.findOneWithDeleted({
        _id: originalTourId,
      });

      if (!restoreTour) {
        return res
          .status(404)
          .json({ success: false, message: "Tour not found" });
      }

      // Ensure the tour is soft-deleted
      if (!restoreTour.deleted) {
        return res
          .status(400)
          .json({ success: false, message: "Tour is not deleted" });
      }

      // Restore the tour
      await restoreTour.restore();

      // Create notification for restore action
      const account = await Account.findById(userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const notification = await Notification.create({
        type: "MANAGE ORIGINAL TOUR",
        message: `${account.accountCode} restored an original tour`,
        information: {
          restoreTour: {
            tourCode: restoreTour.originalTourCode,
            restoredBy: account.accountCode,
            title: restoreTour.title,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      await notification.save();

      // Send WebSocket notification
      const { getNotificationSocket } = require("../websocket/index");
      const notificationSocket = getNotificationSocket();
      if (notificationSocket) {
        notificationSocket.broadcast({
          status: true,
          notification,
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "Tour restored successfully" });
    } catch (error) {
      console.error("Error restoring tour:", error);
      next(error);
    }
  }
}

module.exports = new OriginalToursController();
