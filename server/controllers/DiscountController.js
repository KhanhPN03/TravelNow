const Discount = require("../models/Discount");
const TokenModel = require("../config/push-notification");
const { createNotification } = require("../utils/featureCommon");
const Notification = require("../models/Notification");
const Account = require("../models/Account");

class DiscountController {
  // [GET] /discount
  async createDiscount(req, res, next) {
    try {
      const existingDiscount = await Discount.findOne({
        discountCode: req.body.discountCode,
      });

      if (existingDiscount) {
        return res
          .status(400)
          .json({ success: false, message: "Discount code already exists" });
      }

      const now = new Date();
      const discountDateStart = new Date(req.body.discountDateStart);
      const discountDateEnd = new Date(req.body.discountDateEnd);
      const isActive = now >= discountDateStart && now <= discountDateEnd;

      const discountData = {
        discountPrice: Number(req.body.discountPrice),
        minTotalPrice: Number(req.body.minTotalPrice),
        discountMessage: req.body.discountMessage || "",
        discountCode: req.body.discountCode,
        discountDateStart: discountDateStart,
        discountDateEnd: discountDateEnd,
        discountSlots: Number(req.body.discountSlots),
        discountAvailableSlots: Number(req.body.discountSlots),
        isActive: isActive,
        deleted: false, // Thay đổi isDeleted thành deleted theo schema mới
        createdBy: req.body.createdBy,
        updatedBy: null,
      };

      const discount = await Discount.create(discountData);

      if (discount) {
        const notificationData = {
          type: "RECEIVE DISCOUNT",
          message: "A new discount has been added to your list!",
          information: {
            discount: {
              discountCode: discount.discountCode,
              discountAmount: discount.discountPrice,
              discountDateEnd: discount.discountDateEnd,
              minTotalPrice: discount.minTotalPrice,
            },
          },
          recipients: ["customer"],
        };

        const [pushResult, notification] = await Promise.all([
          TokenModel.sendNotification({
            title: "New Discount Available",
            body: "Check your discount list for a new offer!",
          }),
          createNotification(notificationData),
        ]);

        // console.log('Push notification result:', pushResult);
        // console.log('Database notification created:', notification);

        res.status(201).json({ success: true, discount }); // 201 (tạo mới)
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create discount" });
      }
    } catch (error) {
      next(error);
    }
  }

  async getDiscounts(req, res, next) {
    try {
      const discounts = await Discount.find()
        .populate("createdBy")
        .populate("updatedBy")
        .populate("deletedBy")
        .sort({ createdAt: -1 });
      const updatedDiscounts = discounts.map((discount) => {
        const discountObj = discount.toObject();

        // Giữ nguyên isActive từ database, chỉ tính toán nếu undefined
        if (discountObj.isActive === undefined) {
          const now = new Date();
          const discountStart = new Date(discountObj.discountDateStart);
          const discountEnd = new Date(discountObj.discountDateEnd);
          discountObj.isActive = now >= discountStart && now <= discountEnd;
        }

        return discountObj;
      });

      res.status(200).json({ success: true, discounts: updatedDiscounts });
    } catch (error) {
      next(error);
    }
  }

  async getRemovedDiscounts(req, res, next) {
    try {
      const discounts = await Discount.findWithDeleted({})
        .populate("createdBy")
        .populate("updatedBy")
        .populate("deletedBy")
        .sort({ createdAt: -1 });
      const updatedDiscounts = discounts.map((discount) => {
        const discountObj = discount.toObject();

        // Giữ nguyên isActive từ database, chỉ tính toán nếu undefined
        if (discountObj.isActive === undefined) {
          const now = new Date();
          const discountStart = new Date(discountObj.discountDateStart);
          const discountEnd = new Date(discountObj.discountDateEnd);
          discountObj.isActive = now >= discountStart && now <= discountEnd;
        }

        return discountObj;
      });

      res.status(200).json({ success: true, discounts: updatedDiscounts });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /discount/:id
  async getDiscount(req, res, next) {
    try {
      const discount = await Discount.findById(req.params.id)
        .populate("createdBy")
        .populate("updatedBy");
      if (!discount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      const discountObj = discount.toObject();

      // Giữ nguyên isActive từ database, chỉ tính toán nếu undefined
      if (discountObj.isActive === undefined) {
        const now = new Date();
        const discountStart = new Date(discountObj.discountDateStart);
        const discountEnd = new Date(discountObj.discountDateEnd);

        if (isNaN(discountStart.getTime()) || isNaN(discountEnd.getTime())) {
          return res.status(500).json({
            success: false,
            message: "Invalid date format in discount data",
          });
        }

        discountObj.isActive = now >= discountStart && now <= discountEnd;
      }

      console.log("Discount from DB:", discountObj);
      console.log("isActive from DB:", discountObj.isActive);

      res.status(200).json({ success: true, discount: discountObj });
    } catch (error) {
      next(error);
    }
  }

  async updateDiscount(req, res, next) {
    try {
      const {
        discountPrice,
        minTotalPrice,
        discountMessage,
        discountCode,
        discountDateStart,
        discountDateEnd,
        discountSlots,
        isActive,
      } = req.body;

      const currentDiscount = await Discount.findById(req.params.id);
      if (!currentDiscount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      const currentDate = new Date();
      const startDate = new Date(currentDiscount.discountDateStart);
      const endDate = new Date(currentDiscount.discountDateEnd);
      const isOngoing = currentDate >= startDate && currentDate <= endDate;

      if (!isOngoing && currentDate < startDate) {
        if (
          discountPrice !== undefined &&
          (isNaN(discountPrice) || discountPrice < 0)
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid discount price" });
        }
        if (
          minTotalPrice !== undefined &&
          (isNaN(minTotalPrice) || minTotalPrice < 0)
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid minimum total price" });
        }
        if (discountCode !== undefined && !discountCode.trim()) {
          return res
            .status(400)
            .json({ success: false, message: "Discount code is required" });
        }
        if (discountDateStart !== undefined && !discountDateStart) {
          return res
            .status(400)
            .json({ success: false, message: "Start date is required" });
        }
      }

      if (discountDateEnd !== undefined && !discountDateEnd) {
        return res
          .status(400)
          .json({ success: false, message: "End date is required" });
      }
      if (
        (discountDateStart || currentDiscount.discountDateStart) &&
        discountDateEnd &&
        new Date(discountDateStart || currentDiscount.discountDateStart) >=
          new Date(discountDateEnd)
      ) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
      if (
        discountSlots !== undefined &&
        (isNaN(discountSlots) || discountSlots < 0)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid discount slots" });
      }
      if (
        isOngoing &&
        discountSlots !== undefined &&
        Number(discountSlots) < Number(currentDiscount.discountAvailableSlots)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total slots must be greater than or equal to current available slots",
        });
      }

      if (currentDate > endDate) {
        return res.status(403).json({
          success: false,
          message: "Cannot update: Discount period has ended",
        });
      }

      const updateData = {
        ...(discountPrice !== undefined && {
          discountPrice: Number(discountPrice),
        }),
        ...(minTotalPrice !== undefined && {
          minTotalPrice: Number(minTotalPrice),
        }),
        ...(discountMessage !== undefined && { discountMessage }),
        ...(discountCode !== undefined && { discountCode }),
        ...(discountDateStart !== undefined && {
          discountDateStart: new Date(discountDateStart),
        }),
        ...(discountDateEnd !== undefined && {
          discountDateEnd: new Date(discountDateEnd),
        }),
        ...(discountSlots !== undefined && {
          discountSlots: Number(discountSlots),
        }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        updatedBy: req.body.updatedBy, // Lưu updatedBy từ req.body
      };

      const discount = await Discount.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({ success: true, discount });
    } catch (error) {
      next(error);
    }
  }

  async softDeleteDiscountById(req, res, next) {
    try {
      const { discountId, userId } = req.params;

      // Kiểm tra xem có cung cấp ID của discount hay không
      if (!discountId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing discount ID" });
      }

      // Tìm thông tin tài khoản thực hiện xóa
      const account = await Account.findById(userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      // Tìm discount theo ID
      const discount = await Discount.findById(discountId);
      if (!discount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      // Kiểm tra điều kiện: discountAvailableSlots phải bằng discountSlots
      if (discount.discountAvailableSlots !== discount.discountSlots) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete discount that has been used by customers",
        });
      }

      // Kiểm tra điều kiện: ngày bắt đầu phải khác ngày hiện tại
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const discountStartDate = new Date(discount.discountDateStart);
      discountStartDate.setHours(0, 0, 0, 0);

      if (discountStartDate.getTime() === today.getTime()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete discount starting today",
        });
      }

      // Thực hiện soft delete và lưu thông tin deletedBy, deletedAt
      await discount.delete(userId);

      // Tạo thông báo và lưu vào database
      const notification = await Notification.create({
        type: "MANAGE DISCOUNT",
        message: `${account.accountCode} removed a discount`,
        information: {
          softDeleteDiscount: {
            discountCode: discount.discountCode,
            deletedBy: account.accountCode,
            discountMessage: discount.discountMessage,
          },
        },
        recipients: ["admin", "super_admin"],
      });
      await notification.save();

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
        .json({ success: true, message: "Discount soft deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreDiscountById(req, res, next) {
    try {
      const { discountId } = req.params;

      if (!discountId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing discount ID" });
      }

      // Recherche de la remise par ID
      const restoreDiscount = await Discount.findOneWithDeleted({
        _id: discountId,
      });
      console.log(discountId);

      if (!restoreDiscount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      // Restauration de la remise soft-deleted
      await restoreDiscount.restore();

      return res
        .status(200)
        .json({ success: true, message: "Discount restored successfully" });
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /discount/hard-delete/:discountId
  async hardDeleteDiscountById(req, res, next) {
    try {
      const { discountId } = req.params;

      if (!discountId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing discount ID" });
      }

      // Suppression définitive de la remise
      const deleteDiscount = await Discount.findByIdAndDelete(discountId);

      if (!deleteDiscount) {
        return res
          .status(404)
          .json({ success: false, message: "Discount not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "Discount hard deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscountController();
