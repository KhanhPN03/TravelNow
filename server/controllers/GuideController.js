const { OAuth2Client } = require("google-auth-library");
const passport = require("passport");
const crypto = require("crypto");
const Account = require("../models/Account");
const Notification = require("../models/Notification");
const SubsidiaryTour = require("../models/SubsidiaryTour");
const mongoose = require("mongoose");

class GuideController {
  // [POST] /guide
  async createGuideAccount(req, res, next) {
    try {
      const {
        accountCode,
        email,
        username,
        password,
        firstname,
        lastname,
        DOB,
        gender,
        phone,
        avatar,
        createdBy,
      } = req.body;

      // Validate required fields
      if (!accountCode || !email || !username || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // Register new guide account
      const newAccount = new Account({
        accountCode,
        googleID: " ",
        email,
        username,
        role: "guide",
        firstname: firstname || "",
        lastname: lastname || "",
        DOB: DOB || null,
        gender: gender || "",
        phone: phone || "",
        avatar:
          avatar ||
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        deleted: false,
        createdBy: createdBy,
      });

      Account.register(newAccount, password, async (err, user) => {
        if (err) {
          console.error("Error during registration new guide:", err);
          return res.status(400).json({ success: false, message: err.message });
        }
        const creator = await Account.findById(createdBy);
        // Create notification
        const notification = await Notification.create({
          type: "MANAGE ACCOUNT",
          message: `${creator.accountCode} created a new guide account`,
          information: {
            createAccount: {
              accountCode: user.accountCode,
              createdBy: creator.accountCode, // Assuming the creator is the account itself (modify if created by another user)
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

        // Authenticate and respond
        passport.authenticate("local")(req, res, () => {
          res.status(200).json({
            success: true,
            status: "Create new guide successful!",
            account: user,
          });
        });
      });
    } catch (error) {
      console.error("Error in createGuideAccount:", error);
      next(error);
    }
  }

  // [GET] /guide
  async getAllGuide(req, res, next) {
    try {
      const guides = await Account.find({ role: "guide" })
        .select("-__v")
        .lean();

      res.status(200).json({ message: "success", guides });
    } catch (error) {
      console.error("Error in getAllGuide:", error.message, error.stack);
      next(error);
    }
  }

  // [GET] /guide/:guideId
  getGuideById(req, res, next) {
    const id = req.params.guideId;
    Account.findById(id)
      .then((guide) => {
        if (!guide) {
          return res
            .status(404)
            .json({ success: false, message: "Guide not found" });
        }
        res.status(200).json(guide);
      })
      .catch(next);
  }

  // [PUT] /guide/:accountId
  async updateGuide(req, res, next) {
    try {
      const { email } = req.body;

      if (email) {
        const existingAccount = await Account.findOne({
          email,
          _id: { $ne: req.params.accountId },
        });

        if (existingAccount) {
          return res.status(400).json({
            success: false,
            message: "Email already exists in the database",
          });
        }
      }

      const account = await Account.findByIdAndUpdate(
        req.params.accountId,
        req.body,
        { new: true }
      );
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Guide not found" });
      }

      res.status(200).json({ success: true, account });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /guide/:guideId
  async deleteGuide(req, res, next) {
    try {
      const { guideId, userId } = req.params;

      if (!guideId || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing guide ID or user ID" });
      }

      const account = await Account.findById(guideId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Guide not found" });
      }

      const deletedByAccount = await Account.findById(userId);
      if (!deletedByAccount) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const deletedAccount = await Account.findByIdAndDelete(guideId);
      if (!deletedAccount) {
        return res
          .status(404)
          .json({ success: false, message: "Guide not found" });
      }

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE ACCOUNT",
        message: `${deletedAccount.accountCode} was permanently deleted`,
        information: {
          hardDeleteAccount: {
            accountCode: deletedAccount.accountCode,
            deletedBy: deletedByAccount.accountCode,
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

      res
        .status(200)
        .json({ success: true, message: "Guide hard deleted successfully" });
    } catch (error) {
      console.error("Error in deleteGuide:", error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting guide", error });
    }
  }

  // [DELETE] /guide/softDelete/:accountId/:userId
  async softDelete(req, res, next) {
    try {
      const { accountId, userId } = req.params;

      // Validate ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(accountId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        console.log("Invalid accountId or userId:", { accountId, userId });
        return res
          .status(400)
          .json({ success: false, message: "Invalid account or user ID" });
      }

      const account = await Account.findById(accountId);
      if (!account) {
        console.log("Account not found:", accountId);
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      const deletedByAccount = await Account.findById(userId);
      if (!deletedByAccount) {
        console.log("User not found:", userId);
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const guided = await SubsidiaryTour.findOne({ guidedBy: accountId });
      if (guided) {
        console.log("Account has assigned for guide:", guided._id);
        return res.status(400).json({
          success: false,
          message: "Account has assigned for guide and cannot be deleted",
          booking: guided,
        });
      }

      // Perform soft delete
      await account.delete(userId);

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE ACCOUNT",
        message: `${account.accountCode || account.email} removed a guide account`,
        information: {
          softDeleteAccount: {
            accountCode: account.accountCode || account.email,
            deletedBy: deletedByAccount.accountCode,
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

      console.log("Account soft deleted successfully:", accountId);
      return res
        .status(200)
        .json({ success: true, message: "Account soft deleted successfully" });
    } catch (error) {
      console.error("Error in softDelete:", error.message, error.stack);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // [PUT] /guide/restore/:accountId/:userId
  async restoreGuide(req, res, next) {
    try {
      const { accountId, userId } = req.params;

      // Validate ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(accountId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        console.log("Invalid accountId or userId:", { accountId, userId });
        return res
          .status(400)
          .json({ success: false, message: "Invalid account or user ID" });
      }

      // Find account, including soft-deleted
      const restoreAccount = await Account.findOneWithDeleted({
        _id: accountId,
      });
      if (!restoreAccount) {
        console.log("Account not found:", accountId);
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      // Ensure the account is soft-deleted
      if (!restoreAccount.deleted) {
        return res
          .status(400)
          .json({ success: false, message: "Account is not deleted" });
      }

      const restoredByAccount = await Account.findById(userId);
      if (!restoredByAccount) {
        console.log("User not found:", userId);
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Restore the account
      await restoreAccount.restore();

      // Create notification
      const notification = await Notification.create({
        type: "MANAGE ACCOUNT",
        message: `${
          restoreAccount.accountCode || restoreAccount.email
        } was restored`,
        information: {
          restoreAccount: {
            accountCode: restoreAccount.accountCode || restoreAccount.email,
            restoredBy: restoredByAccount.accountCode,
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

      console.log("Account restored successfully:", accountId);
      return res
        .status(200)
        .json({ success: true, message: "Account restored successfully" });
    } catch (error) {
      console.error("Error in restoreGuide:", error.message, error.stack);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = new GuideController();
