const SubsidiaryTour = require("../models/SubsidiaryTour");
const Notification = require("../models/Notification");
const Account = require("../models/Account");
const mongoose = require("mongoose");

class SubsidiaryToursController {
  // [GET] /
  getAllSubTours(req, res, next) {
    SubsidiaryTour.find({})
      .populate("createdBy", "accountCode")
      .populate("deletedBy", "accountCode")
      .populate("originalTourId")
      .then((subsidiaryTours) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res
          .status(200)
          .json({ message: "success",length: subsidiaryTours.length, subsidiaryTours: subsidiaryTours });
      })
      .catch(next);
  }
   async getSubToursByGuideId (req, res, next)  {
    console.log(1);
    
    try {
      const { guideId } = req.params;
  
      // Convert guideId string to ObjectId
      const guideObjectId = new mongoose.Types.ObjectId(guideId);
  
      const tours = await SubsidiaryTour.find({
        guidedBy: guideObjectId, // Filter by the guide's ObjectId
        isDeleted: false, // Exclude soft-deleted tours
      }).populate("guidedBy originalTourId"); // Populate the correct fields
  
      res.status(200).json({
        success: true,
        tours,
      });
    } catch (error) {
      console.error("Error fetching subsidiary tours by guide:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching subsidiary tours by guide",
      });
    }
  };
  // [GET] /deleted/get-all-subtours
  async getAllRemovedSubTours(req, res, next) {
    try {
      const subsidiaryTours = await SubsidiaryTour.findWithDeleted({})
        .populate("createdBy", "accountCode")
        .populate("deletedBy", "accountCode")
        .populate("originalTourId");
      res.status(200).json({ message: "success", subsidiaryTours });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /:subTourId
  getSubTourById(req, res, next) {
    const id = req.params.subTourId;
    SubsidiaryTour.findById(id)
      .populate("originalTourId")
      .then((tour) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tour);
      })
      .catch(next);
  }

  // [GET] /originalTour/:orgTourId
  getSubTourByOrgTourId(req, res, next) {
    const { orgTourId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orgTourId)) {
      return res.status(404).json({ error: "Invalid orgTourId format" });
    }

    SubsidiaryTour.find({
      originalTourId: new mongoose.Types.ObjectId(orgTourId),
    })
      .populate("createdBy", "accountCode")
      .then((tours) => {
        // if (!tours.length) {
        //   return res.status(404).json({ message: "No subsidiary tours found" });
        // }
        res.status(200).json({ message: "success", subsidiaryTours: tours });
      })
      .catch((error) => {
        console.error("Error fetching subsidiary tours:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }

  // [POST] /
  async createSubTour(req, res, next) {
    try {
      const subTour = await SubsidiaryTour.create(req.body);

      // Fetch the account for notification
      const account = await Account.findById(req.body.createdBy);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE SUBSIDIARY TOUR",
        message: `${account.accountCode} created a new subsidiary tour`,
        information: {
          createTour: {
            tourCode: req.body.subTourCode,
            createdBy: account.accountCode,
            originalTourId: req.body.originalTourId,
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

      await subTour.save();
      res.status(200).json(subTour);
    } catch (error) {
      next(error);
    }
  }

  async softDeleteSubTourById(req, res, next) {
    try {
      const { subTourId, userId } = req.params;

      if (!subTourId || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID or user ID" });
      }

      const deleteTour = await SubsidiaryTour.findById(subTourId);

      const account = await Account.findById(userId);

      if (!deleteTour) {
        return res
          .status(404)
          .json({ success: false, message: "Tour not found" });
      }

      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      console.log(1);

      if (deleteTour.revenue > 0) {
        return res.status(200).json({
          success: false,
          message: "This tour has revenue, cannot be removed",
        });
      }
      console.log(2);

      await deleteTour.delete(userId);
      console.log(3);

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE SUBSIDIARY TOUR",
        message: `${account.accountCode} removed a subsidiary tour`,
        information: {
          softDeleteTour: {
            tourCode: deleteTour.subTourCode,
            deletedBy: account.accountCode,
            originalTourId: deleteTour.originalTourId,
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
        .json({ success: true, message: "Tour soft deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /hardDelete/:subTourId/:userId
  async hardDeleteSubTourById(req, res, next) {
    try {
      const { subTourId, userId } = req.params;

      if (!subTourId || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID or user ID" });
      }

      const deleteTour = await SubsidiaryTour.findByIdAndDelete(subTourId);
      const account = await Account.findById(userId);

      if (!deleteTour) {
        return res
          .status(404)
          .json({ success: false, message: "Tour not found" });
      }

      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE SUBSIDIARY TOUR",
        message: `${account.accountCode} permanently deleted a subsidiary tour`,
        information: {
          hardDeleteTour: {
            tourCode: deleteTour.subTourCode,
            deletedBy: account.accountCode,
            originalTourId: deleteTour.originalTourId,
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
        .json({ success: true, message: "Tour hard deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /restore/:subTourId/:userId
  async restoreSubTourById(req, res, next) {
    try {
      const { subTourId, userId } = req.params;

      if (!subTourId || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tour ID or user ID" });
      }

      // Debug: Log the SubsidiaryTour model
      console.log("SubsidiaryTour model:", SubsidiaryTour);

      // Find tour by ID, including soft-deleted
      const restoreTour = await SubsidiaryTour.findOneWithDeleted({
        _id: subTourId,
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

      // Fetch account for notification
      const account = await Account.findById(userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE SUBSIDIARY TOUR",
        message: `${account.accountCode} restored a subsidiary tour`,
        information: {
          restoreTour: {
            tourCode: restoreTour.subTourCode,
            restoredBy: account.accountCode,
            originalTourId: restoreTour.originalTourId,
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

  async getSubsidiaryToursByOriginalTour(req, res) {
    const { originalTourId } = req.params;
    try {
      const subsidiaryTours = await SubsidiaryTour.find({
        originalTourId,
      }).select("subTourCode revenue createdAt");
      return res.status(200).json({ subsidiaryTours });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching subsidiary tours" });
    }
  }
}

module.exports = new SubsidiaryToursController();
