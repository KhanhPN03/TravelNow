const passport = require("passport");

const mongoose = require("mongoose");
const Account = require("../models/Account");
const Discount = require("../models/Discount");
const OriginalTour = require("../models/OriginalTour");
const SubsidiaryTour = require("../models/SubsidiaryTour");
const Notification = require("../models/Notification");
class AdminController {
  // [POST] /superAdmin/

  async createAdminAccount(req, res, next) {
    // res.json(req.body);
    Account.register(
      new Account({
        accountCode: req.body.accountCode,
        googleID: " ",
        email: req.body.email,
        username: req.body.username,
        role: "admin",
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        DOB: req.body.DOB,
        gender: req.body.gender,
        phone: req.body.phone,
        avatar:
          req.body.avatar ||
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        createdBy: req.body.createdBy,
      }),
      req.body.password,
      (err, user) => {
        if (err) {
          console.error("Error during registration:", err); // Log the error
          res.status(400).json({ success: false, message: err.message });
        } else {
          passport.authenticate("local")(req, res, () => {
            res
              .status(200)
              .json({ success: true, status: "Create Successful!" });
          });
        }
      }
    );
    const creator = await Account.findById(req.body.createdBy);
    const notification = await Notification.create({
      type: "MANAGE ACCOUNT",
      message: `${
        creator.accountCode || creator.email
      } created a new admin account`,
      information: {
        createAccount: {
          accountCode: req.body.accountCode,
          createdBy: creator.accountCode,
        },
      },
      recipients: ["admin", "super_admin"],
    });
    await notification.save();

    // Optional: WebSocket notification (if you use it)
    const { getNotificationSocket } = require("../websocket/index");
    const notificationSocket = getNotificationSocket();
    if (notificationSocket) {
      notificationSocket.broadcast({
        status: true,
      });
    }
  }

  // [GET] /admin
  async getAdmins(req, res, next) {
    try {
      const admins = await Account.find({ role: "admin" })
        .select("-__v") // Exclude the __v field
        .lean();

      res.status(200).json({ message: "success", admins: admins });
    } catch (error) {
      console.error("Error in getAllAdmin:", error.message, error.stack);
      next(error); // Pass to error-handling middleware
    }
  }
  //[PUT] /superAdmin/:id
  async updateAdmin(req, res, next) {
    const { email } = req.body;
    if (email) {
      const existingAccount = await Account.findOne({
        email: email,
        _id: { $ne: req.params.accountId },
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Email already exists in the database",
        });
      }
    }
    Account.findByIdAndUpdate(req.params.accountId, req.body, { new: true })
      .then((account) =>
        res.status(200).json({ success: true, account: account })
      )
      .catch(next);
  }
  async softDeleteAdmin(req, res, next) {
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

      if (!accountId) {
        console.log("Missing account ID");
        return res
          .status(400)
          .json({ success: false, message: "Missing account ID" });
      }

      // Find the account and ensure it's an admin
      const account = await Account.findById(accountId);
      if (!account) {
        console.log("Account not found:", accountId);
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }
      if (account.role !== "admin" && account.role !== "super_admin") {
        console.log("Account is not an admin:", account.role);
        return res
          .status(400)
          .json({ success: false, message: "Account is not an admin" });
      }

      // Check if the admin is referenced in Discount (createdBy or updatedBy)
      const discountReference = await Discount.findOne({
        $or: [{ createdBy: accountId }, { updatedBy: accountId }],
      });
      if (discountReference) {
        console.log("Admin is referenced in Discount:", discountReference._id);
        return res.status(200).json({
          success: false,
          message:
            "Admin cannot be deleted as they are referenced in a Discount",
          discount: discountReference,
        });
      }

      // Check if the admin is referenced in OriginalTour (createdBy)
      const originalTourReference = await OriginalTour.findOne({
        createdBy: accountId,
      });
      if (originalTourReference) {
        console.log(
          "Admin is referenced in OriginalTour:",
          originalTourReference._id
        );
        return res.status(200).json({
          success: false,
          message:
            "Admin cannot be deleted as they are referenced in an Original Tour",
          originalTour: originalTourReference,
        });
      }

      // Check if the admin is referenced in SubsidiaryTour (createdBy or guidedBy)
      const subsidiaryTourReference = await SubsidiaryTour.findOne({
        $or: [{ createdBy: accountId }, { guidedBy: accountId }],
      });
      if (subsidiaryTourReference) {
        console.log(
          "Admin is referenced in SubsidiaryTour:",
          subsidiaryTourReference._id
        );
        return res.status(200).json({
          success: false,
          message:
            "Admin cannot be deleted as they are referenced in a Subsidiary Tour",
          subsidiaryTour: subsidiaryTourReference,
        });
      }

      // Perform soft delete
      await account.delete(userId);

      const deletedBy = await Account.findById(userId);
      // Create notification
      const notification = await Notification.create({
        type: "MANAGE ACCOUNT",
        message: `${
          deletedBy.accountCode || deletedBy.email
        } removed an admin account`,
        information: {
          softDeleteAccount: {
            accountCode: account.accountCode,
            deletedBy: deletedBy.accountCode,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      await notification.save();

      // Optional: WebSocket notification
      const { getNotificationSocket } = require("../websocket/index");
      const notificationSocket = getNotificationSocket();
      if (notificationSocket) {
        notificationSocket.broadcast({
          status: true,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin account soft deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error in softDeleteAdminAccount:",
        error.message,
        error.stack
      );
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // [DELETE] /admin/:id
  async deleteAdmin(req, res, next) {
    try {
      await Account.findByIdAndDelete(req.params.id);
      x;
      res.status(200).json({ success: true, message: "Admin deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
