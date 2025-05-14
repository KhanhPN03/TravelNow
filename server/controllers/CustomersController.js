const { OAuth2Client } = require("google-auth-library");
const passport = require("passport");
const authenticate = require("../config/authenticate");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Account = require("../models/Account");
const User = require("../models/Account");
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store OTP codes (should use Redis or database in production)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

class CustomersController {
  // [GET] /
  async getAllCustomer(req, res, next) {
    try {
      // Fetch only non-deleted customers with role "customer"
      const customers = await Account.find({ role: "customer" })
        .select("-__v") // Exclude the __v field
        .lean(); // Optional: Convert to plain JS objects for faster performance

      res.status(200).json({ message: "success", users: customers });
    } catch (error) {
      console.error("Error in getAllCustomer:", error.message, error.stack);
      next(error); // Pass to error-handling middleware
    }
  }

  // [GET] /:customerId
  async getCustomerById(req, res, next) {

    
    const id = req.params.customerId;
    Account.findById(id)
      .then((customer) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(customer);
      })
      .catch(next);
  }

  // [POST] /
  async createCustomerAccount(req, res, next) {
    // res.json(req.body);
    Account.register(
      new Account({
        accountCode: req.body.accountCode,
        googleID: " ",
        email: req.body.email,
        username: req.body.username,
        role: "customer",
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
      } created a new customer account`,
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

  // [GET] /users/total
  async getTotalCustomers(req, res, next) {
    try {
      const totalCustomers = await User.countDocuments({ role: "customer" });
      res.status(200).json({ success: true, totalCustomers });
    } catch (error) {
      next(error);
    }
  }

  /* Code cũ */
  // POST /users/register
  async register(req, res, next) {
    try {
      Account.register(
        new Account({
          accountCode: req.body.accountCode,
          email: req.body.email,
          username: req.body.username,
          role: req.body.role, // change
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          DOB: req.body.DOB,
          gender: req.body.gender,
          phone: req.body.phone,
          avatar: req.body.image,
        }),
        req.body.password,
        (err, user) => {
          if (err) {
            err.message = "User is already registered";
            next(err);
          } else {
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({
                success: true,
                status: "Registration Successful!",
                user: user,
              });
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  login(req, res, next) {
    const token = authenticate.getToken({ _id: req.user.id });
    const user = req.user.toObject ? req.user.toObject() : req.user; // nếu có hàm .toObject thì nó là 1 doc mongoose, nên Chuyển về object thường
    const { isDeleted, salt, hash, createdAt, updatedAt, ...rest } = user;

    res.statusCode = 200;

    res.setHeader("Content-Type", "application/json");

    res.json({
      success: true,
      token: token,
      user: rest,
      status: "You are successfully logged in!",
    });
  }

  // New forgot password methods
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      console.log("Searching for email:", email);

      const user = await User.findOne({ email: email.toLowerCase() });
      console.log("Found user:", user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Email not found",
        });
      }

      const otp = generateOTP();
      otpStore.set(email, {
        otp,
        timestamp: Date.now(),
        userId: user._id,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Verification Code",
        html: `
                <h1>Password Reset Request</h1>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process request",
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      const storedData = otpStore.get(email);
      console.log("stored data: ", storedData);

      if (!storedData) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or invalid",
        });
      }

      if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP expired",
        });
      }

      if (storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in verify OTP:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      const storedData = otpStore.get(email);
      if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      const user = await User.findById(storedData.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await new Promise((resolve, reject) => {
        user.setPassword(newPassword, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await user.save();
      otpStore.delete(email);
      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error in reset password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
      });
    }
  }

  // POST /account/login-google
  async loginWithGoogle(req, res, next) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    try {
      // Xác minh token Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleID = payload.sub; // Lấy Google ID từ payload

      if (!googleID) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Google ID" });
      }

      // Kiểm tra người dùng đã tồn tại chưa
      let user = await User.findOne({ googleID });
      let userName = payload.email.split("@")[0];
      if (!user) {
        // Nếu chưa tồn tại, tạo người dùng mới
        user = new User({
          googleID: googleID,
          email: payload.email,
          username: userName,
          firstname: payload.given_name,
          lastname: payload.family_name,
          avatar: payload.picture,
        });

        await user.save();
      } else {
        // Nếu đã tồn tại, cập nhật thông tin người dùng

        user.email = payload.email;
        user.firstname = payload.given_name;
        user.lastname = payload.family_name;

        await user.save();
      }

      // Tạo token để gửi về client
      const tokenToSend = authenticate.getToken({ _id: user.id });

      res.status(200).json({
        success: true,
        token: tokenToSend,
        user: user,
        status: "Successfully logged in with Google!",
      });
    } catch (error) {
      console.error("Google login error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Google login failed", error });
    }
  }

  getUser(req, res, next) {
    Account.findById(req.params.id)

      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "not found user" });
        } else {
          res.status(200).json({ success: true, user: user });
        }
      })
      .catch(next);
  }
  // GET /users/logout
  logout(req, res, next) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ success: true }); // Chuyển hướng về trang chủ sau khi đăng xuất
      });
    });
  }

  async getAll(req, res, next) {
    try {
      const users = await Account.find({});
      res.json({ success: true, users: users });
    } catch (error) {
      let err = new Error("Not Found");
      err.status = 404;
      next(error);
    }
  }

  async getAllRemovedAccounts(req, res, next) {
    try {
      const users = await Account.findWithDeleted({}); // Include soft-deleted documents
      res.json({ success: true, users: users });
    } catch (error) {
      let err = new Error("Not Found");
      err.status = 404;
      next(error);
    }
  }

  async create(req, res) {
    try {
      const newUser = new Account(req.body);

      await newUser.save();
      res.json({ success: true, user: newUser });
    } catch (error) {
      res.status(500).send({ message: "Error creating user", error });
    }
  }

  async getOne(req, res) {
    try {
      const user = await Account.findById(req.params.id);

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.json({ success: true, user: user });
    } catch (error) {
      res.status(500).send({ message: "Error retrieving user details", error });
    }
  }

  async updateAccount(req, res, next) {
    const { email } = req.body;
    if (email) {
      const existingAccount = await Account.findOne({
        email: email,
        _id: { $ne: req.params.customerId },
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Email already exists in the database",
        });
      }
    }
    Account.findByIdAndUpdate(req.params.customerId, req.body, { new: true })
      .then((account) =>
        res.status(200).json({ success: true, account: account })
      )
      .catch(next);
  }

  async softDeleteAccountById(req, res, next) {
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

      const account = await Account.findById(accountId);
      if (!account) {
        console.log("Account not found:", accountId);
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      const existingBookings = await Booking.findOne({ userId: accountId });
      if (existingBookings) {
        console.log("Account has bookings:", existingBookings._id);
        return res.status(200).json({
          success: false,
          message: "Account has existing bookings and cannot be deleted",
          booking: existingBookings,
        });
      }

      // Pass userId directly as a string (ObjectId will be handled by mongoose-delete)
      await account.delete(userId);
      const deletedBy = await Account.findById(userId);
      const notification = await Notification.create({
        type: "MANAGE ACCOUNT",
        message: `${
          deletedBy.accountCode || deletedBy.email
        } removed a customer account`,
        information: {
          softDeleteAccount: {
            accountCode: account.accountCode,
            deletedBy: deletedBy.accountCode,
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
          message: "Account soft deleted",
        });
      }
      return res
        .status(200)
        .json({ success: true, message: "Account soft deleted successfully" });
    } catch (error) {
      console.error(
        "Error in softDeleteAccountById:",
        error.message,
        error.stack
      );
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  async delete(req, res) {
    try {
      const account = await Account.findByIdAndDelete(req.params.id);
      if (!account) {
        return res.status(404).send({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).send({ message: "Error deleting user", error });
    }
  }
  async changePasswordByAdmin(req, res, next) {
    try {
      const { newPassword } = req.body;
      const { userId } = req.params;
  
      // Validate input
      if (!userId || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId or newPassword",
        });
      }
  
      // Find the user
      const user = await Account.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }
  
      // Update password without checking old password (admin privilege)
      await new Promise((resolve, reject) => {
        user.setPassword(newPassword, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
  
      // Save the updated user
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error in changePassword:", error);
      next(error);
    }
  }
  async changePassword(req, res, next) {
    try {
      // Lấy dữ liệu từ request body
      const { oldPassword, newPassword } = req.body;
      const { userId } = req.params;
      // Kiểm tra dữ liệu đầu vào
      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: userId, oldPassword, or newPassword",
        });
      }

      // Tìm người dùng trong database
      const user = await Account.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Xác thực mật khẩu cũ
      const isValid = await new Promise((resolve, reject) => {
        user.authenticate(oldPassword, (err, thisUser, passwordErr) => {
          if (err) return reject(err);
          if (passwordErr || !thisUser) return resolve(false);
          resolve(true);
        });
      });

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Incorrect old password",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be from 6 characters",
        });
      }

      // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
      if (oldPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from old password",
        });
      }

      // Thay đổi mật khẩu bằng phương thức của passport-local-mongoose
      await new Promise((resolve, reject) => {
        user.setPassword(newPassword, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Lưu thay đổi vào database
      await user.save();

      // Trả về phản hồi thành công
      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // [PUT] /restore/:userId
  async restoreUserById(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing user ID" });
      }

      // Tìm tour theo ID
      const restoreUser = await Account.findOneWithDeleted({ _id: userId });

      if (!restoreUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Thực hiện soft delete và lưu thông tin deletedBy, deletedAt
      await restoreUser.restore();

      return res
        .status(200)
        .json({ success: true, message: "User restore successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomersController();
