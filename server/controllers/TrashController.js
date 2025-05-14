const OriginalTour = require("../models/OriginalTour");
const SubsidiaryTour = require("../models/SubsidiaryTour");
const Account = require("../models/Account");
const Discount = require("../models/Discount");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

class TrashController {
  // [GET] /trash/:type
  async getAllRemovedItems(req, res, next) {
    try {
      const { type } = req.params;

      let items;
      let dataKey;

      switch (type) {
        case "OriginalTour":
          items = await OriginalTour.findWithDeleted({})
            .populate("createdBy", "accountCode")
            .populate("deletedBy", "accountCode");
          dataKey = "originalTours";
          break;
        case "SubsidiaryTour":
          items = await SubsidiaryTour.findWithDeleted({})
            .populate("createdBy", "accountCode")
            .populate("deletedBy", "accountCode")
            .populate("originalTourId");
          dataKey = "subsidiaryTours";
          break;
        case "Account":
          items = await Account.findWithDeleted({}).select("-__v").lean();
          dataKey = "accounts";
          break;
        case "Discount":
          items = await Discount.findWithDeleted({})
            .populate("createdBy")
            .populate("updatedBy")
            .populate("deletedBy")
            .sort({ createdAt: -1 });
          dataKey = "discounts";
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid type" });
      }

      res
        .status(200)
        .json({ success: true, message: "success", [dataKey]: items });
    } catch (error) {
      console.error(`Error fetching removed ${req.params.type}:`, error);
      next(error);
    }
  }

  // [PUT] /trash/restore/:type/:id/:userId
  async restoreItem(req, res, next) {
    try {
      const { type, id, userId } = req.params;

      // Validate inputs
      if (
        !id ||
        !userId ||
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID or user ID" });
      }

      // Fetch user for notifications and role check
      const account = await Account.findById(userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let item;
      let notificationData;

      switch (type) {
        case "OriginalTour":
          item = await OriginalTour.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Original tour not found" });
          }
          if (!item.deleted) {
            return res.status(400).json({
              success: false,
              message: "Original tour is not deleted",
            });
          }
          await item.restore();
          notificationData = {
            type: "MANAGE ORIGINAL TOUR",
            message: `${account.accountCode} restored an original tour`,
            information: {
              restoreTour: {
                tourCode: item.originalTourCode,
                restoredBy: account.accountCode,
                title: item.title,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "SubsidiaryTour":
          item = await SubsidiaryTour.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Subsidiary tour not found" });
          }
          if (!item.deleted) {
            return res.status(400).json({
              success: false,
              message: "Subsidiary tour is not deleted",
            });
          }
          await item.restore();
          notificationData = {
            type: "MANAGE SUBSIDIARY TOUR",
            message: `${account.accountCode} restored a subsidiary tour`,
            information: {
              restoreTour: {
                tourCode: item.subTourCode,
                restoredBy: account.accountCode,
                originalTourId: item.originalTourId,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "Account":
          item = await Account.findOneWithDeleted({ _id: id });

          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Account not found" });
          }
          if (!item.deleted) {
            return res.status(400).json({
              success: false,
              message: "Account is not deleted",
            });
          }
          // Restrict admin/superAdmin restoration to superAdmin users
          if (
            (item.role === "admin" || item.role === "superAdmin") &&
            account.role !== "superAdmin"
          ) {
            return res.status(403).json({
              success: false,
              message:
                "Only superAdmin can restore admin or superAdmin accounts",
            });
          }
          await item.restore();
          notificationData = {
            type: "MANAGE ACCOUNT",
            message: `${
              account.accountCode || account.email
            } restored an account`,
            information: {
              restoreAccount: {
                accountCode: item.accountCode || item.email,
                restoredBy: account.accountCode,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "Discount":
          item = await Discount.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Discount not found" });
          }
          if (!item.deleted) {
            return res
              .status(400)
              .json({ success: false, message: "Discount is not deleted" });
          }
          await item.restore();
          notificationData = {
            type: "MANAGE DISCOUNT",
            message: `${account.accountCode} restored a discount`,
            information: {
              restoreDiscount: {
                discountCode: item.discountCode,
                restoredBy: account.accountCode,
                discountMessage: item.discountMessage,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid type" });
      }

      // Create notification
      const notification = await Notification.create(notificationData);
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
        .json({ success: true, message: `${type} restored successfully` });
    } catch (error) {
      console.error(`Error restoring ${req.params.type}:`, error);
      next(error);
    }
  }

  // [DELETE] /trash/hardDelete/:type/:id/:userId
  async hardDeleteItem(req, res, next) {
    try {
      const { type, id, userId } = req.params;

      // Validate inputs
      if (
        !id ||
        !userId ||
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID or user ID" });
      }

      // Fetch user for notifications and role check
      const account = await Account.findById(userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let item;
      let notificationData;

      switch (type) {
        case "OriginalTour":
          item = await OriginalTour.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Original tour not found" });
          }
          await OriginalTour.findByIdAndDelete(id);
          notificationData = {
            type: "MANAGE ORIGINAL TOUR",
            message: `${account.accountCode} permanently deleted an original tour`,
            information: {
              hardDeleteTour: {
                tourCode: item.originalTourCode,
                deletedBy: account.accountCode,
                title: item.title,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "SubsidiaryTour":
          item = await SubsidiaryTour.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Subsidiary tour not found" });
          }
          await SubsidiaryTour.findByIdAndDelete(id);
          notificationData = {
            type: "MANAGE SUBSIDIARY TOUR",
            message: `${account.accountCode} permanently deleted a subsidiary tour`,
            information: {
              hardDeleteTour: {
                tourCode: item.subTourCode,
                deletedBy: account.accountCode,
                originalTourId: item.originalTourId,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "Account":
          item = await Account.findOneWithDeleted({ _id: id });

          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Account not found" });
          }
          // Restrict admin/superAdmin deletion to superAdmin users
          if (
            (item.role === "admin" || item.role === "superAdmin") &&
            account.role !== "superAdmin"
          ) {
            return res.status(403).json({
              success: false,
              message:
                "Only superAdmin can delete admin or superAdmin accounts",
            });
          }
          await Account.findByIdAndDelete(id);
          notificationData = {
            type: "MANAGE ACCOUNT",
            message: `${
              account.accountCode || account.email
            } permanently deleted an account`,
            information: {
              hardDeleteAccount: {
                accountCode: item.accountCode || item.email,
                deletedBy: account.accountCode,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        case "Discount":
          item = await Discount.findOneWithDeleted({ _id: id });
          if (!item) {
            return res
              .status(404)
              .json({ success: false, message: "Discount not found" });
          }
          await Discount.findByIdAndDelete(id);
          notificationData = {
            type: "MANAGE DISCOUNT",
            message: `${account.accountCode} permanently deleted a discount`,
            information: {
              hardDeleteDiscount: {
                discountCode: item.discountCode,
                deletedBy: account.accountCode,
                discountMessage: item.discountMessage,
              },
            },
            recipients: ["admin", "super_admin"],
          };
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid type" });
      }

      // Create notification
      const notification = await Notification.create(notificationData);
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
        .json({ success: true, message: `${type} hard deleted successfully` });
    } catch (error) {
      console.error(`Error hard deleting ${req.params.type}:`, error);
      next(error);
    }
  }
}

module.exports = new TrashController();
